import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { NgApexchartsModule, ApexOptions } from 'ng-apexcharts';
import { DashboardService, Dashboard, History, Trends } from '../services/dashboardservice/dashboard.service';
import { AuthService } from '../services/authservice/auth.service';
import { ScanService, Scan } from '../services/scanservice/scan.service';
import { forkJoin } from 'rxjs';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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
  status: 'Passed' | 'Failed';
  grade: string;
  time: string;
}
interface DashboardData {
  id: string;
  name: string;
  qualityGate: { status: 'OK' | 'ERROR'; conditions: Condition[]; };
  metrics: { bugs: number; vulnerabilities: number; codeSmells: number; coverage: number; duplications: number; technicalDebt?: string; };
  issues: Issue[];
  securityHotspots: SecurityHotspot[];
  history: ScanHistory[];
  coverageHistory: number[];
  days: number[];
}
type NotificationTab = 'All' | 'Unread' | 'Scans' | 'Issues' | 'System';
interface Notification {
  title: string; message: string; icon: string; type: NotificationTab;
  timestamp: Date; read: boolean;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {
  constructor(
    private readonly router: Router,
    private readonly dash: DashboardService,
    private readonly auth: AuthService,
    private readonly scanService: ScanService
  ) { }

  ngOnInit() {
  if (!this.auth.token) {
    console.warn('No token found, redirecting to login');
    this.router.navigate(['/login']);
    return;
  }
  
  const userId = this.auth.userId;
  this.fetchFromServer(userId!);

    this.dash.getOverview(this.auth.userId || '').subscribe({
      next: data => console.log('Dashboard overview data:', data),
      error: err => console.error('Error fetching dashboard overview:', err)
    });

    this.loadDashboardData();
    console.log('Dashboard data:', this.dashboardData);


  }

  

  loading = true;

  dashboardData: DashboardData = {
    id: '',
    name: '',
    qualityGate: { status: 'OK', conditions: [] },
    metrics: { bugs: 0, vulnerabilities: 0, codeSmells: 0, coverage: 0, duplications: 0, technicalDebt: '0' },
    issues: [],
    securityHotspots: [],
    history: [],
    coverageHistory: [],
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

  // ---------- Fetch real data ----------
  fetchFromServer(userId: string | number) {
    this.loading = true;
    forkJoin({
      overview: this.dash.getOverview(userId),
      history: this.dash.getHistory(userId),
      trends: this.dash.getTrends(userId),
      scans: this.scanService.getAllScan()
    }).subscribe({
      next: ({ overview, history, trends, scans }) => {
        this.applyOverview(overview);
        this.applyHistory(history);
        this.applyTrends(trends);
         this.recomputeStatusCountsFromHistory();
        this.calculateProjectDistribution();
        this.loadDashboardData();
       // this.loadCoverageChart();
          this.recentScans = scans.sort((a, b) => {
          const dateA = a.completedAt ? new Date(a.completedAt).getTime() : 0;
          const dateB = b.completedAt ? new Date(b.completedAt).getTime() : 0;
          return dateB - dateA;
        }).slice(0, 5);
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching dashboard data:', err);
        this.loading = false;
      }
    });
  }

  // ---------- Mapping helpers ----------
  private applyOverview(overview: any) {
    if (!Array.isArray(overview) || overview.length === 0) return;

    const list = overview.map((o: any) => {
      const m = o?.metrics ?? {};
      return {
        bugs: this.asNumber(m.bugs),
        vulnerabilities: this.asNumber(m.vulnerabilities),
        codeSmells: this.asNumber(m.code_smells),
        coverage: this.asNumber(m.coverage),
        duplications: this.asNumber(m.duplicated_lines_density),
      };
    });

    const n = list.length || 1;
    const sum = list.reduce((a, x) => ({
      bugs: a.bugs + x.bugs,
      vulnerabilities: a.vulnerabilities + x.vulnerabilities,
      codeSmells: a.codeSmells + x.codeSmells,
      coverage: a.coverage + x.coverage,
      duplications: a.duplications + x.duplications,
    }), { bugs: 0, vulnerabilities: 0, codeSmells: 0, coverage: 0, duplications: 0 });

    this.dashboardData.metrics = {
      bugs: sum.bugs,
      vulnerabilities: sum.vulnerabilities,
      codeSmells: sum.codeSmells,
      coverage: +(sum.coverage / n).toFixed(1),
      duplications: +(sum.duplications / n).toFixed(1),
      technicalDebt: this.dashboardData.metrics.technicalDebt ?? '0'
    };

    const qg: 'OK' | 'ERROR' = this.dashboardData.metrics.coverage >= 80 ? 'OK' : 'ERROR';
    this.dashboardData.qualityGate.status = qg;
    this.dashboardData.qualityGate.conditions = [{
      metric: 'Coverage',
      status: qg,
      actual: this.dashboardData.metrics.coverage,
      threshold: 80,
    }];
  }

  private applyHistory(history: History[]) {
    this.dashboardData.history = (history || []).map(h => {
      const t = new Date(h.createdAt);
      const typeproject = this.normalizeProjectType((h as any).projectType);
      return {
        scanId: (h as any).scanId,
        projectId: (h as any).projectId,
        project: (h as any).projectName,
        typeproject,
        status: (h as any).status ?? 'Passed',
        grade: (h as any).grade ?? 'A',
        time: t.toISOString().slice(0, 16).replace('T', ' ')
      };
    });
  }

  private normalizeProjectType(v?: string): 'Angular' | 'SpringBoot' {
    const s = (v || '').toLowerCase();
    if (s.includes('spring')) return 'SpringBoot';
    if (s.includes('angular')) return 'Angular';
    return 'Angular';
  }

  private normalizeQgStatus(v: any): 'Passed' | 'Failed' {
    const s = String(v ?? '').trim().toUpperCase();
    return s === 'OK' ? 'Passed' : 'Failed';
  }

  private applyTrends(trends: Trends[]) {
    const t0: any = trends?.[0] || {};
    if (Array.isArray(t0.coverageHistory)) this.dashboardData.coverageHistory = t0.coverageHistory;
    if (Array.isArray(t0.days)) this.dashboardData.days = t0.days;
    if (t0.qualityGate) {
      this.dashboardData.qualityGate.status = (t0.qualityGate as any) as 'OK' | 'ERROR';
    }
  }

  private asNumber(v: any): number {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  }

  private normalizeRawMetrics(m: Dashboard['metrics']) {
    return {
      bugs: this.asNumber(m?.bugs),
      vulnerabilities: this.asNumber(m?.vulnerabilities),
      codeSmells: this.asNumber(m?.codeSmells),
      coverage: this.asNumber(m?.coverage),
      duplications: this.asNumber(m?.duplications)
    };
  }

  private normalizeOverviewArray(raw: Dashboard[]) {
    const perProject: DashboardData[] = (raw || []).map(o => ({
      id: o.id,
      name: o.name,
      metrics: this.normalizeRawMetrics(o.metrics || ({} as any)),
      qualityGate: { status: 'OK', conditions: [] },
      issues: [],
      securityHotspots: [],
      history: [],
      coverageHistory: [],
      days: []
    }));

    const totalProjects = perProject.length || 1;
    const sum = perProject.reduce((acc, p) => {
      acc.bugs += p.metrics.bugs;
      acc.vulnerabilities += p.metrics.vulnerabilities;
      acc.codeSmells += p.metrics.codeSmells;
      acc.coverage += p.metrics.coverage;
      acc.duplications += p.metrics.duplications;
      return acc;
    }, { bugs: 0, vulnerabilities: 0, codeSmells: 0, coverage: 0, duplications: 0 });

    const totals = {
      bugs: sum.bugs,
      vulnerabilities: sum.vulnerabilities,
      codeSmells: sum.codeSmells,
      coverage: Number((sum.coverage / totalProjects).toFixed(1)),
      duplications: Number((sum.duplications / totalProjects).toFixed(1)),
    };

    return { perProject, totals };
  }

  private safeParse<T>(s: string): Partial<T> { try { return JSON.parse(s); } catch { return {}; } }
  private toNum(v: any): number { const n = Number(v); return Number.isFinite(n) ? n : 0; }

  // ---------- Notifications ----------
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
    const m = Math.floor(diffSec / 60), h = Math.floor(diffSec / 3600), d = Math.floor(diffSec / 86400);
    if (m < 1) return 'Just now';
    if (m < 60) return `${m}m ago`;
    if (h < 24) return `${h}h ago`;
    return `${d}d ago`;
  }

  toggleNotifications() { this.showNotifications = !this.showNotifications; }
  closeNotifications() { this.showNotifications = false; }
  markAllRead() { this.notifications.forEach(n => n.read = true); }
  selectTab(tab: NotificationTab) { this.activeTab = tab; this.displayCount = 5; }

  /** ✅ ฟังก์ชันที่ขาดไปในเทมเพลต */
  viewNotification(n: Notification) {
    n.read = true;
    // ถ้าต้องการ route ต่อจากชนิดแจ้งเตือน ทำแบบนี้ได้:
    // if (n.type === 'Issues') this.router.navigate(['/issue']);
    // else if (n.type === 'Scans') this.router.navigate(['/scanhistory']);
    // ปัจจุบัน: แค่ mark read และคง panel ไว้
  }

  get filteredNotifications() {
    let filtered = this.notifications;
    if (this.activeTab === 'Unread') filtered = filtered.filter(n => !n.read);
    else if (this.activeTab !== 'All') filtered = filtered.filter(n => n.type === this.activeTab);
    filtered = filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    return filtered.slice(0, this.displayCount);
  }
  get unreadCount() { return this.notifications.filter(n => !n.read).length; }
  loadMore() { this.displayCount += 5; }
  get totalFilteredCount() {
    if (this.activeTab === 'All') return this.notifications.length;
    if (this.activeTab === 'Unread') return this.notifications.filter(n => !n.read).length;
    return this.notifications.filter(n => n.type === this.activeTab).length;
  }

  // ---------- Calculations / Charts ----------
  projectDistribution: { type: string, count: number, percent: number }[] = [];

  calculateProjectDistribution() {
    const typeCounts: Record<string, number> = {};
    const total = this.dashboardData.history.length || 1;
    this.dashboardData.history.forEach(h => { typeCounts[h.typeproject] = (typeCounts[h.typeproject] || 0) + 1; });
    this.projectDistribution = Object.entries(typeCounts).map(([type, count]) => ({
      type, count, percent: Math.round((count / total) * 100)
    }));
  }

  private recomputeStatusCountsFromHistory() {
    const passed = this.dashboardData.history.filter(h => h.status === 'Passed').length;
    const failed = this.dashboardData.history.filter(h => h.status === 'Failed').length;
    this.Data = { passedCount: passed, failedCount: failed };
    this.totalProjects = passed + failed;
  }

  onExport() {
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const margin = 10;
    let y = 15;
  
    // =========================
    // 1. Header
    // =========================
    pdf.setFontSize(20);
    pdf.setTextColor(40, 40, 40);
    pdf.text('Dashboard Overview', pdf.internal.pageSize.getWidth() / 2, y, { align: 'center' });
    y += 10;
  
    // =========================
    // 2. Date & Admin
    // =========================
    const today = new Date();
    pdf.setFontSize(11);
    pdf.setTextColor(80, 80, 80);
    pdf.text(`Date: ${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear()}`, margin, y);
    pdf.text(`Role: Admin`, pdf.internal.pageSize.getWidth() - margin, y, { align: 'right' });
    y += 12;
  
    pdf.setDrawColor(200);
    pdf.setLineWidth(0.5);
    pdf.line(margin, y, pdf.internal.pageSize.getWidth() - margin, y); // separator line
    y += 6;
  
    // =========================
    // 3. Quality Gate Status
    // =========================
    pdf.setFontSize(14);
    pdf.setTextColor(0, 123, 255); // blue header
    pdf.text('Quality Gate Status', margin, y);
    y += 7;
    pdf.setFontSize(11);
    pdf.setTextColor(0);
    pdf.text(`Passed: ${this.Data.passedCount}`, margin, y); y += 5;
    pdf.text(`Failed: ${this.Data.failedCount}`, margin, y); y += 10;
  
    // =========================
    // 4. Recent Scans Table
    // =========================
    const scansColumns = ['Project', 'Status', 'Grade', 'Time'];
    const scansRows = this.recentScans.map(s => [s.projectId, s.status, s.completedAt]);
  
    (autoTable as any)(pdf, {
      head: [scansColumns],
      body: scansRows,
      startY: y,
      theme: 'grid',
      styles: { fontSize: 10, cellPadding: 2 },
      headStyles: { fillColor: [0, 123, 255], textColor: 255 },
      margin: { left: margin, right: margin },
    });
  
    y = (pdf as any).lastAutoTable?.finalY + 8;
  
    // =========================
    // 5. Metrics
    // =========================
    pdf.setFontSize(14);
    pdf.setTextColor(0, 123, 255);
    pdf.text('Metrics', margin, y);
    y += 6;
    pdf.setFontSize(11);
    pdf.setTextColor(0);
    pdf.text(`Bugs: ${this.dashboardData.metrics.bugs}`, margin, y); y += 5;
    pdf.text(`Security: ${this.dashboardData.metrics.vulnerabilities}`, margin, y); y += 5;
    pdf.text(`Code Smells: ${this.dashboardData.metrics.codeSmells}`, margin, y); y += 5;
    pdf.text(`Coverage: ${this.dashboardData.metrics.coverage}%`, margin, y); y += 10;
  
    // =========================
    // 6. Top Issues
    // =========================
    pdf.setFontSize(14);
    pdf.setTextColor(220, 53, 69); // red
    pdf.text('Top Issues', margin, y);
    y += 6;
    pdf.setFontSize(11);
    pdf.setTextColor(0);
    this.dashboardData.issues.forEach(i => {
      pdf.text(`- [${i.severity}] ${i.type}: ${i.message}`, margin, y);
      y += 5;
    });
    y += 5;
  
    // =========================
    // 7. Project Distribution
    // =========================
    pdf.setFontSize(14);
    pdf.setTextColor(0, 123, 255);
    pdf.text('Project Distribution', margin, y);
    y += 6;
    pdf.setFontSize(11);
    pdf.setTextColor(0);
    this.projectDistribution.forEach(p => {
      pdf.text(`${p.type}: ${p.percent}%`, margin, y);
      pdf.setFillColor(0, 123, 255); // bar color
      pdf.rect(margin, y + 2, p.percent * 1.2, 5, 'F'); // simple bar chart
      y += 10;
    });
  
    // =========================
    // 8. Save PDF
    // =========================
    const fileName = `Dashboard_Report_${today.getFullYear()}${today.getMonth() + 1}${today.getDate()}.pdf`;
    pdf.save(fileName);
    console.log('Exporting data...'); 
  }
  

  // ฟังก์ชันคำนวณสีตามเกรด
  getGradeColor(grade: string): string {
    switch (grade) {
      case 'A': return '#10B981';
      case 'B': return '#84CC16';
      case 'C': return '#F59E0B';
      case 'D': return '#FB923C';
      case 'E': return '#EF4444';
      case 'F': return '#EF4444';
      default: return '#6B7280';
    }
  }

loadDashboardData() {
  // 1️⃣ จัดกลุ่ม scan ล่าสุดต่อ project
  const latestScanPerProject: Record<string, Scan> = {};
  this.recentScans.forEach(scan => {
    const prev = latestScanPerProject[scan.projectId];
    const scanTime = scan.completedAt ? new Date(scan.completedAt).getTime() : 0;
    if (!prev || scanTime > (prev.completedAt ? new Date(prev.completedAt).getTime() : 0)) {
      latestScanPerProject[scan.projectId] = scan;
    }
  });

  // 2️⃣ เอา scan ล่าสุดแต่ละโปรเจกต์
  const latestScans = Object.values(latestScanPerProject);

  // 3️⃣ นับ pass/fail จาก qualityGate.status โดยตรง
  // แทนที่จะใช้ s.qualityGate.status
const passedCount = latestScans.filter(s => s.qualityGate === 'Passed').length;
const failedCount = latestScans.filter(s => s.qualityGate !== 'Passed').length;


  // 4️⃣ อัปเดต Data ให้ template ใช้ได้เลย
  this.Data = { passedCount, failedCount };
  this.totalProjects = passedCount + failedCount;

  // 5️⃣ คำนวณเกรดรวม
  const avg = this.totalProjects > 0 ? passedCount / this.totalProjects : 0;
  this.grade = 
    avg >= 0.8 ? 'A' :
    avg >= 0.7 ? 'B' :
    avg >= 0.6 ? 'C' :
    avg >= 0.5 ? 'D' :
    avg >= 0.4 ? 'E' : 'F';
  this.gradePercent = Math.round(avg * 100);

  // 6️⃣ ตั้งค่า donut chart
  this.pieChartOptions = {
    chart: { type: 'donut', height: 300 },
    series: [this.gradePercent, 100 - this.gradePercent],
    labels: ['', ''],
    colors: [this.getGradeColor(this.grade), '#E5E7EB'],
    plotOptions: {
      pie: {
        donut: {
          labels: {
            show: true,
            total: {
              show: true,
              showAlways: true,
              label: this.grade,
              fontSize: '24px',
              formatter: () => this.gradePercent + '%'
            }
          }
        }
      }
    },
    dataLabels: { enabled: false },
    legend: { show: false },
    tooltip: { enabled: false }
  };

  console.log('Pass count:', passedCount, 'Fail count:', failedCount);
  console.log('Grade percent:', this.gradePercent, 'Grade:', this.grade);
}





  // loadCoverageChart() {
  //   const data = this.dashboardData.coverageHistory?.length
  //     ? this.dashboardData.coverageHistory
  //     : [this.dashboardData.metrics.coverage];
  //   const cats = (this.dashboardData.days?.length === data.length && this.dashboardData.days.length)
  //     ? this.dashboardData.days
  //     : data.map((_, i) => i + 1);

  //   this.coverageChartSeries = [{ name: 'Coverage', data }];
  //   this.coverageChartOptions = {
  //     chart: { type: 'line', height: 200, foreColor: 'var(--apexcharts-text)' },
  //     stroke: { curve: 'smooth', width: 3 },
  //     markers: { size: 4 },
  //     colors: ['#2563eb'],
  //     xaxis: { categories: cats },
  //     yaxis: { labels: { formatter: (val) => val + '%' } }
  //   };
  // }

  // // ---------- Misc ----------
  // get latestScans(): ScanHistory[] {
  //   return [...this.dashboardData.history]
  //     .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
  //     .slice(0, 5);
  // }

  onRefresh() { this.fetchFromServer(this.auth.userId!); }

  viewScan(scanId: string) {
    this.router.navigate(['/scanresult', scanId]);
  }
 
}

