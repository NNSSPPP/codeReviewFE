import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { NgApexchartsModule, ApexOptions } from 'ng-apexcharts';
import { DashboardService } from '../services/dashboardservice/dashboard.service';
import { AuthService } from '../services/authservice/auth.service';
import { ScanService, Scan } from '../services/scanservice/scan.service';
import { UserService, ChangePasswordData } from '../services/userservice/user.service';
import { forkJoin } from 'rxjs';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { IssueService } from '../services/issueservice/issue.service';

interface TopIssue {
  message: string;
  count: number;
}

interface Condition {
  metric: string;
  status: 'OK' | 'ERROR';
  actual: number;
  threshold: number;
}

interface Issue {
  id: number;
  type: string;
  severity: 'BLOCKER' | 'CRITICAL' | 'MAJOR' | 'MINOR';
  message: string;
  project: string;
}

interface SecurityHotspot {
  id: number;
  status: 'REVIEWED' | 'TO_REVIEW';
  description: string;
  project: string;
}

interface ScanHistory {
  scanId: string;
  projectId: string;
  project: string;
  typeproject: 'Angular' | 'SpringBoot';
  status: 'Passed' | 'Failed' | '';   // เผื่อว่าง
  grade: string | null;
  time: string;
  maintainabilityGate: string | null;
}

interface DashboardData {
  id: string;
  name: string;
  qualityGate: { status: 'OK' | 'ERROR'; conditions: Condition[]; };
  metrics: {
    bugs: number;
    vulnerabilities: number;
    codeSmells: number;
    coverage: number;
    duplications?: number;
    technicalDebt?: string;
  };
  issues: Issue[];
  securityHotspots: SecurityHotspot[];
  history: ScanHistory[];
  coverageHistory: number[];
  maintainabilityGate: string;
  days: number[];
}

type NotificationTab = 'All' | 'Unread' | 'Scans' | 'Issues' | 'System';

interface Notification {
  title: string;
  message: string;
  icon: string;
  type: NotificationTab;
  timestamp: Date;
  read: boolean;
}

interface UserProfile {
  username: string;
  email: string;
  phoneNumber?: string;
  status: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule, RouterModule, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {
  constructor(
    private readonly router: Router,
    private readonly dash: DashboardService,
    private readonly auth: AuthService,
    private readonly userService: UserService,
    private readonly scanService: ScanService,
    private readonly issueService: IssueService,   // 👈 เพิ่มอันนี้

  ) { }

  loading = true;

  // ================== STATE หลัก ==================
  dashboardData: DashboardData = {
    id: '',
    name: '',
    qualityGate: { status: 'OK', conditions: [] },
    metrics: {
      bugs: 0,
      vulnerabilities: 0,
      codeSmells: 0,
      coverage: 0,
      duplications: 0,
      technicalDebt: '0'
    },
    issues: [],
    securityHotspots: [],
    history: [],
    coverageHistory: [],
    maintainabilityGate: '',
    days: []
  };

  Data = { passedCount: 0, failedCount: 0 };
  pieChartOptions!: ApexOptions;
  totalProjects = 0;
  grade = '';
  gradePercent = 0;

  coverageChartSeries: any[] = [];
  coverageChartOptions: ApexOptions = {};
  recentScans: Scan[] = [];
  topIssues: { message: string; count: number }[] = [];
  maxTop = 5;


  userProfile: UserProfile = { username: '', email: '', phoneNumber: '', status: '' };
  user: any = {};
  editedUser: any = {};
  showEditModal = false;
  showProfileDropdown = false;

  /** ตัวอักษรเกรดเฉลี่ยจาก backend (A–E) */
  avgGateLetter: 'A' | 'B' | 'C' | 'D' | 'E' = 'A';

  // ================== LIFE CYCLE ==================
  ngOnInit() {
    // ถ้าไม่มี token ให้เด้งไป login ก่อน
    if (!this.auth.token) {
      this.router.navigate(['/login']);
      return;
    }

    const userId = this.auth.userId;
    if (!userId) return;

    // ดาวน์โหลดข้อมูล dashboard
    this.fetchFromServer(userId);

    // โหลดโปรไฟล์ผู้ใช้
    this.userService.getUserProfile(userId).subscribe({
      next: (user) => {
        this.userProfile = {
          username: user.username || '',
          email: user.email || '',
          phoneNumber: user.phoneNumber || '',
          status: user.status || ''
        };
      },
      error: (err) => console.error('Error fetching user profile:', err)
    });

    // โหลดกราฟครั้งแรก (จะถูกเรียกซ้ำตอน fetch เสร็จ)
    this.loadDashboardData();
  }

  // ================== FETCH FROM SERVER ==================
  fetchFromServer(userId: string | number) {
    this.loading = true;

forkJoin({
  overview: this.dash.getOverview(userId),
  history: this.dash.getHistory(userId),
  trends: this.dash.getTrendsWithAvg(userId),
  scans: this.scanService.getAllScan(),
  issues: this.issueService.getAllIssue(String(userId))   // ✅ เพิ่ม
}).subscribe({
  next: ({ overview, history, trends, scans, issues }) => {
    // 1) metrics จาก overview
    const metrics = this.dash.getMetricsSummary(overview);
    this.dashboardData.metrics = {
      ...metrics,
      technicalDebt: this.dashboardData.metrics.technicalDebt ?? '0'
    };
    console.log('[overview] metrics summary:', metrics);

    // 2) history -> map
    this.dashboardData.history = this.dash.mapHistory(history);

    // 3) avg grade จาก trends
    if (trends?.length && this.isValidGateLetter(trends[0].avgGrade)) {
      this.avgGateLetter = trends[0].avgGrade.toUpperCase() as any;
      console.log('[trends] avgGrade from API =', trends[0].avgGrade);
    } else {
      // ... fallback เดิมของคุณ ...
      const latestMap = this.dashboardData.history.reduce((m, h) => {
        const cur = m.get(h.projectId);
        const tNew = new Date(h.time).getTime();
        const tCur = cur ? new Date(cur.time).getTime() : 0;
        if (!cur || tNew > tCur) m.set(h.projectId, h);
        return m;
      }, new Map<string, any>());
      const rows = Array.from(latestMap.values());

      const scoreMap: Record<'A'|'B'|'C'|'D'|'E', number> = { A: 5, B: 4, C: 3, D: 2, E: 1 };
      const score = (g: string) => scoreMap[(g || 'E').toUpperCase() as keyof typeof scoreMap] || 1;

      const grades = rows
        .map(r => (r.grade || 'E').toUpperCase())
        .filter(g => this.isValidGateLetter(g));

      const avgScore = grades.length
        ? grades.map(score).reduce((a, b) => a + b, 0) / grades.length
        : 1;

      const revMap: Record<1|2|3|4|5,'A'|'B'|'C'|'D'|'E'> = {
        1: 'E', 2: 'D', 3: 'C', 4: 'B', 5: 'A'
      };

      const rounded = Math.max(1, Math.min(5, Math.round(avgScore))) as 1|2|3|4|5;
      this.avgGateLetter = revMap[rounded];
      console.log('[fallback] avgGateLetter =', this.avgGateLetter);
    }

    // 4) recent scans (เอา 5 อันล่าสุด)
    this.recentScans = scans
      .sort((a, b) => {
        const dateA = a.completedAt ? new Date(a.completedAt).getTime() : 0;
        const dateB = b.completedAt ? new Date(b.completedAt).getTime() : 0;
        return dateB - dateA;
      })
      .slice(0, 5);

    // 5) นับ passed / failed จาก history
    this.recomputeStatusCountsFromHistory();

    // 6) สรุป project distribution
    this.calculateProjectDistribution();

    // 7) คำนวณ donut / เกรด
    this.loadDashboardData();

    // 8) ✅ ตรงนี้คือของใหม่: คำนวณ Top Issues จากรายการ issues ที่ดึงมา
    this.buildTopIssues(issues);

    console.log('[donut] pass/fail ->', this.Data, 'totalProjects =', this.totalProjects);
    console.log('[donut] center =', this.avgGateLetter);

    this.loading = false;
  },
  error: (err) => {
    console.error('Error fetching dashboard data:', err);
    this.loading = false;
  }
});

  }

  private buildTopIssuesFromDashboard() {
    const list = this.dashboardData?.issues || [];
    const counter: Record<string, number> = {};

    for (const it of list) {
      // backend บางทีส่ง message, บางทีส่ง title ก็กันไว้
      const msgRaw = it?.message || '(no message)';
      const msg = String(msgRaw).trim();

      // ถ้าจะนับเฉพาะที่ยัง open ก็เช็กตรงนี้ได้
      // if (it.status && it.status.toLowerCase() !== 'open') continue;

      counter[msg] = (counter[msg] || 0) + 1;
    }

    const arr: TopIssue[] = Object.entries(counter)
      .map(([message, count]) => ({ message, count }))
      .sort((a, b) => b.count - a.count);

    this.topIssues = arr.slice(0, this.maxTop);
  }
  private buildTopIssues(rawIssues: any[]) {
  if (!rawIssues || !rawIssues.length) {
    this.topIssues = [];
    return;
  }

  const counter: Record<string, number> = {};

  for (const it of rawIssues) {
    // ดึงเฉพาะหัวข้อ
    const msg = (it.message || '(no message)').trim();

    // ถ้าอยากตัดตัวที่ DONE / REJECT ออก ให้ uncomment 3 บรรทัดนี้
    // const st = (it.status || '').toUpperCase();
    // if (st === 'DONE' || st === 'REJECT') continue;

    counter[msg] = (counter[msg] || 0) + 1;
  }

  this.topIssues = Object.entries(counter)
    .map(([message, count]) => ({ message, count }))
    .sort((a, b) => b.count - a.count)  // มาก -> น้อย
    .slice(0, this.maxTop);
}

  // ================== PROFILE & USER ==================
  toggleProfileDropdown() {
    this.showProfileDropdown = !this.showProfileDropdown;
  }

  showChangePasswordModal = false;
  passwordData: ChangePasswordData = {
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  };
  submitted = false;

  openChangePasswordModal() {
    this.showChangePasswordModal = true;
    this.resetForm();
  }

  closeChangePasswordModal() {
    this.showChangePasswordModal = false;
  }

  resetForm() {
    this.passwordData = { oldPassword: '', newPassword: '', confirmPassword: '' };
  }

  submitChangePassword(form: any) {
    this.submitted = true;
    if (form.invalid || this.passwordData.newPassword !== this.passwordData.confirmPassword) return;

    this.userService.changePassword(this.passwordData).subscribe({
      next: () => {
        alert('Password changed successfully');
        this.closeChangePasswordModal();
      },
      error: (err) => {
        alert('Failed to change password: ' + (err.error?.message || err.message));
      }
    });
  }

  verifyEmail() {
    this.userService.verifyEmail(this.userProfile.email).subscribe({
      next: () => alert('Verification email sent successfully!'),
      error: (err) => {
        console.error('Error sending verification email:', err);
        alert('Failed to send verification email.');
      }
    });
  }

  // ================== NOTIFICATIONS ==================
  showNotifications = false;
  isMobile = false;
  activeTab: NotificationTab = 'All';
  displayCount = 5;

  notifications: Notification[] = [
    { title: '1.New Scan Completed', message: 'Scan #123 finished.', icon: '🔍', type: 'Scans', timestamp: new Date('2025-08-26T10:00:00'), read: false },
    { title: '2.System Update', message: 'Update v1.2 deployed.', icon: '⚙️', type: 'System', timestamp: new Date('2025-08-26T09:00:00'), read: false },
    { title: '3.Error Detected', message: 'Server error reported.', icon: '❌', type: 'Issues', timestamp: new Date('2025-08-26T11:00:00'), read: true },
    { title: '4.New Issue', message: 'Issue #456 created.', icon: '🐞', type: 'Issues', timestamp: new Date('2025-08-25T10:00:00'), read: false },
    { title: '5.Backup Done', message: 'Daily backup completed.', icon: '💾', type: 'System', timestamp: new Date('2025-08-25T11:00:00'), read: true },
    { title: '6.Security Alert', message: 'Login from new device.', icon: '🔒', type: 'System', timestamp: new Date('2025-07-26T10:00:00'), read: false },
    { title: '7.Scan #124 Completed', message: 'Scan #124 finished.', icon: '🔍', type: 'Scans', timestamp: new Date('2025-08-26T12:00:00'), read: false },
    { title: '8.New Issue', message: 'Issue #457 created.', icon: '🐞', type: 'Issues', timestamp: new Date('2025-08-26T08:00:00'), read: false }
  ];

  getTimeAgo(value: Date | string | number): string {
    const t = value instanceof Date ? value.getTime() : new Date(value).getTime();
    if (Number.isNaN(t)) return 'Just now';
    let diffSec = Math.floor((Date.now() - t) / 1000);
    if (diffSec < 0) diffSec = 0;
    const m = Math.floor(diffSec / 60),
      h = Math.floor(diffSec / 3600),
      d = Math.floor(diffSec / 86400);
    if (m < 1) return 'Just now';
    if (m < 60) return `${m}m ago`;
    if (h < 24) return `${h}h ago`;
    return `${d}d ago`;
  }

  toggleNotifications() {
    this.showNotifications = !this.showNotifications;
  }

  closeNotifications() {
    this.showNotifications = false;
  }

  markAllRead() {
    this.notifications.forEach((n) => (n.read = true));
  }

  selectTab(tab: NotificationTab) {
    this.activeTab = tab;
    this.displayCount = 5;
  }

  viewNotification(n: Notification) {
    n.read = true;
  }

  get filteredNotifications() {
    let filtered = this.notifications;
    if (this.activeTab === 'Unread') {
      filtered = filtered.filter((n) => !n.read);
    } else if (this.activeTab !== 'All') {
      filtered = filtered.filter((n) => n.type === this.activeTab);
    }
    filtered = filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    return filtered.slice(0, this.displayCount);
  }

  get unreadCount() {
    return this.notifications.filter((n) => !n.read).length;
  }

  loadMore() {
    this.displayCount += 5;
  }

  get totalFilteredCount() {
    if (this.activeTab === 'All') return this.notifications.length;
    if (this.activeTab === 'Unread') return this.notifications.filter((n) => !n.read).length;
    return this.notifications.filter((n) => n.type === this.activeTab).length;
  }

  // ================== PROJECT DISTRIBUTION ==================
  projectDistribution: { type: string; count: number; percent: number }[] = [];

  calculateProjectDistribution() {
    const typeCounts: Record<string, number> = {};
    const total = this.dashboardData.history.length || 1;
    this.dashboardData.history.forEach((h) => {
      typeCounts[h.typeproject] = (typeCounts[h.typeproject] || 0) + 1;
    });
    this.projectDistribution = Object.entries(typeCounts).map(([type, count]) => ({
      type,
      count,
      percent: Math.round((count / total) * 100)
    }));
  }

  // ================== ช่วยนับ passed / failed ==================
  /** ✅ แก้ตรงนี้ให้ normalize แล้ว */
  private recomputeStatusCountsFromHistory() {
    const norm = (s?: string) => (s || '').trim().toUpperCase();

    // บาง backend ใช้ PASSED / FAILED
    // บาง backend ใช้ OK / ERROR
    const passed = this.dashboardData.history.filter((h) => {
      const st = norm(h.status);
      return st === 'PASSED' || st === 'OK' || st === 'SUCCESS';
    }).length;

    const failed = this.dashboardData.history.filter((h) => {
      const st = norm(h.status);
      return st === 'FAILED' || st === 'ERROR';
    }).length;

    this.Data = { passedCount: passed, failedCount: failed };
    this.totalProjects = passed + failed;
  }

  // ================== HELPERS ==================
  private getLatestPerProject(rows: ScanHistory[]): ScanHistory[] {
    const map = new Map<string, ScanHistory>();
    for (const h of rows) {
      if (!h?.projectId || !h?.time) continue;
      const cur = map.get(h.projectId);
      const tNew = new Date(h.time).getTime();
      const tCur = cur ? new Date(cur.time).getTime() : 0;
      if (!cur || tNew > tCur) map.set(h.projectId, h);
    }
    return Array.from(map.values());
  }

  private notEmpty(v: unknown): boolean {
    return v !== null && v !== undefined && String(v).trim() !== '';
  }

  private isValidGateLetter(v?: string): boolean {
    return /^[A-E]$/i.test((v || '').trim());
  }

  private getGradeColor(grade: string): string {
    switch (grade?.toUpperCase()) {
      case 'A': return '#10B981';      // เขียว
      case 'B': return '#84CC16';
      case 'C': return '#F59E0B';
      case 'D': return '#FB923C';
      case 'E': return '#EF4444';
      default: return '#6B7280';      // เทา
    }
  }

  // ================== โหลดข้อมูลสำหรับโดนัทและการ์ด ==================
  loadDashboardData() {
    const latest = this.getLatestPerProject(this.dashboardData.history);
    const norm = (s?: string) => (s || '').trim().toUpperCase();
    const validLatest = latest.filter((s) => this.notEmpty(s.status));

    // ✅ pass ได้เฉพาะ 3 ตัวนี้เท่านั้น
    const passedCount = validLatest.filter((s) => {
      const st = norm(s.status);
      return st === 'PASSED' || st === 'OK' || st === 'SUCCESS';
    }).length;

    // ✅ ที่เหลือคือ failed ทั้งหมด
    const failedCount = validLatest.filter((s) => {
      const st = norm(s.status);
      return !(st === 'PASSED' || st === 'OK' || st === 'SUCCESS');
    }).length;

    // ใช้เฉพาะที่จบแล้ว (pass+fail) มาหาร
    const finishedTotal = passedCount + failedCount;

    this.Data = { passedCount, failedCount };
    this.totalProjects = finishedTotal;

    const ratio = finishedTotal > 0 ? passedCount / finishedTotal : 0;

    this.grade =
      ratio >= 0.8 ? 'A' :
        ratio >= 0.7 ? 'B' :
          ratio >= 0.6 ? 'C' :
            ratio >= 0.5 ? 'D' :
              ratio >= 0.4 ? 'E' :
                'F';

    this.gradePercent = Math.round(ratio * 100);

    let centerLetter: 'A' | 'B' | 'C' | 'D' | 'E';
    if (this.isValidGateLetter(this.avgGateLetter)) {
      centerLetter = this.avgGateLetter;
    } else {
      centerLetter = (this.grade === 'F' ? 'E' : this.grade) as 'A' | 'B' | 'C' | 'D' | 'E';
    }

    this.pieChartOptions = {
      chart: { type: 'donut', height: 300 },
      series: [this.gradePercent, 100 - this.gradePercent],
      labels: ['', ''],
      colors: [this.getGradeColor(centerLetter), '#E5E7EB'],
      plotOptions: {
        pie: {
          donut: {
            labels: {
              show: true,
              name: {
                show: true,
                offsetY: 0,
                fontSize: '48px',
                formatter: () => centerLetter
              },
              value: {
                show: false,
                offsetY: 5,
                formatter: () => this.gradePercent + '%'
              },
              total: { show: true }
            }
          }
        }
      },
      dataLabels: { enabled: false },
      legend: { show: false },
      tooltip: { enabled: false }
    };
  }


  // ================== EXPORT PDF ==================
  onExport() {
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const margin = 12;
    let y = 15;

    pdf.setFontSize(20);
    pdf.setTextColor(33, 37, 41);
    pdf.text('Dashboard Overview Report', pdf.internal.pageSize.getWidth() / 2, y, { align: 'center' });
    y += 12;

    const today = new Date();
    const username = this.user?.username || 'Unknown User';
    pdf.setFontSize(11);
    pdf.setTextColor(85, 85, 85);
    pdf.text(`Date: ${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear()}`, margin, y);
    pdf.text(`Username: ${username}`, pdf.internal.pageSize.getWidth() - margin, y, { align: 'right' });
    y += 10;

    pdf.setDrawColor(180);
    pdf.setLineWidth(0.5);
    pdf.line(margin, y, pdf.internal.pageSize.getWidth() - margin, y);
    y += 8;

    // Quality Gate
    pdf.setFontSize(14);
    pdf.setTextColor(0, 123, 255);
    pdf.text('Quality Gate Status', margin, y);
    y += 7;
    pdf.setFontSize(11);
    pdf.setTextColor(0);
    pdf.text(`Passed: ${this.Data.passedCount}`, margin, y);
    y += 6;
    pdf.text(`Failed: ${this.Data.failedCount}`, margin, y);
    y += 10;

    // Recent scans
    pdf.setFontSize(14);
    pdf.setTextColor(0, 123, 255);
    pdf.text('Recent Scans', margin, y);
    y += 6;

    const scansColumns = ['Project Name', 'Status', 'Completed At'];
    const scansRows = this.recentScans.map((s) => [
      s.projectName || 'N/A',
      s.qualityGate || 'N/A',
      new Date(s.completedAt ?? '').toLocaleString()
    ]);

    (autoTable as any)(pdf, {
      head: [scansColumns],
      body: scansRows,
      startY: y,
      theme: 'grid',
      styles: { fontSize: 10, cellPadding: 2 },
      headStyles: { fillColor: [0, 123, 255], textColor: 255, halign: 'center' },
      bodyStyles: { textColor: 50 },
      margin: { left: margin, right: margin }
    });

    y = (pdf as any).lastAutoTable?.finalY + 8;

    // Metrics
    pdf.setFontSize(14);
    pdf.setTextColor(0, 123, 255);
    pdf.text('Metrics Summary', margin, y);
    y += 6;
    pdf.setFontSize(11);
    pdf.setTextColor(0);
    pdf.text(`Bugs: ${this.dashboardData.metrics.bugs}`, margin, y);
    y += 5;
    pdf.text(`Security: ${this.dashboardData.metrics.vulnerabilities}`, margin, y);
    y += 5;
    pdf.text(`Code Smells: ${this.dashboardData.metrics.codeSmells}`, margin, y);
    y += 5;
    pdf.text(`Coverage: ${this.dashboardData.metrics.coverage}%`, margin, y);
    y += 10;

    // Top issues
    pdf.setFontSize(14);
    pdf.setTextColor(220, 53, 69);
    pdf.text('Top Issues', margin, y);
    y += 6;

    pdf.setFontSize(11);
    pdf.setTextColor(0);
    if (this.dashboardData.issues?.length > 0) {
      this.dashboardData.issues.forEach((i) => {
        pdf.text(`- [${i.severity || 'N/A'}] ${i.type || 'Unknown'}: ${i.message || ''}`, margin, y);
        y += 5;
      });
    } else {
      pdf.text('No critical issues found.', margin, y);
      y += 5;
    }
    y += 5;

    // Project distribution
    pdf.setFontSize(14);
    pdf.setTextColor(0, 123, 255);
    pdf.text('Project Distribution', margin, y);
    y += 6;
    pdf.setFontSize(11);
    pdf.setTextColor(0);

    this.projectDistribution.forEach((p) => {
      pdf.text(`${p.type}: ${p.percent}%`, margin, y);
      pdf.setFillColor(0, 123, 255);
      pdf.rect(margin + 40, y - 3, p.percent * 1.2, 5, 'F');
      y += 8;
    });

    const pageHeight = pdf.internal.pageSize.height;
    pdf.setFontSize(9);
    pdf.setTextColor(150);
    pdf.text(
      'Generated automatically by PCCTH Automate Code Review',
      pdf.internal.pageSize.getWidth() / 2,
      pageHeight - 10,
      { align: 'center' }
    );

    const fileName = `Dashboard_Report_${today.getFullYear()}${(today.getMonth() + 1)
      .toString()
      .padStart(2, '0')}${today.getDate().toString().padStart(2, '0')}.pdf`;
    pdf.save(fileName);
  }

  // ================== ACTIONS อื่น ๆ ==================
  onRefresh() {
    this.fetchFromServer(this.auth.userId!);
  }

  viewScan(scanId: string) {
    this.router.navigate(['/scanresult', scanId]);
  }

  viewDetail(scanId: string) {
    this.router.navigate(['/scanresult', scanId]);
  }
}
