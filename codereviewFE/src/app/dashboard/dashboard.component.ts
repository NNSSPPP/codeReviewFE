import { Component } from '@angular/core';
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Router, RouterModule } from '@angular/router';
import { NgApexchartsModule, ApexOptions } from 'ng-apexcharts';
import { DashboardService, Dashboard, History, Trends } from '../services/dashboardservice/dashboard.service';
import { AuthService } from '../services/authservice/auth.service';
import { forkJoin } from 'rxjs';

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
  imports: [CommonModule, NgApexchartsModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {
  constructor(
    private readonly router: Router,
    private readonly dash: DashboardService,
    private readonly auth: AuthService
  ) {}

  ngOnInit() {
    const userId = this.auth.userId;
    if (!userId) { this.router.navigate(['/login']); return; }
    this.fetchFromServer(userId);
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

  // คง property เดิมไว้ (แต่จะเซ็ตค่าจากข้อมูลจริงใน loadDashboardData)
  Data = { passedCount: 0, failedCount: 0 };

  pieChartOptions!: ApexOptions;
  totalProjects = 0;
  grade = '';
  gradePercent = 0;

  coverageChartSeries: any[] = [];
  coverageChartOptions: ApexOptions = {};

  // ---------- Fetch real data ----------
  fetchFromServer(userId: string | number) {
    this.loading = true;

    forkJoin({
      overview: this.dash.getOverview(userId), 
      history : this.dash.getHistory(userId),  
      trends  : this.dash.getTrends(userId),   
    }).subscribe({
      next: ({ overview, history, trends }) => {
        this.applyOverview(overview);
        this.applyHistory(history);
        this.applyTrends(trends);

        // คงชื่อฟังก์ชันเดิม แต่ให้ทำงานกับข้อมูลจริง
        this.calculateProjectDistribution();
        this.loadDashboardData();
        this.loadCoverageChart();

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

  // map snake_case -> camelCase (number)
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

  // รวมค่า (bugs/vulns/codeSmells = sum, coverage/duplications = avg)
  const n = list.length || 1;
  const sum = list.reduce((a, x) => ({
    bugs: a.bugs + x.bugs,
    vulnerabilities: a.vulnerabilities + x.vulnerabilities,
    codeSmells: a.codeSmells + x.codeSmells,
    coverage: a.coverage + x.coverage,
    duplications: a.duplications + x.duplications,
  }), { bugs:0, vulnerabilities:0, codeSmells:0, coverage:0, duplications:0 });

  this.dashboardData.metrics = {
    bugs: sum.bugs,
    vulnerabilities: sum.vulnerabilities,
    codeSmells: sum.codeSmells,
    coverage: +(sum.coverage / n).toFixed(1),
    duplications: +(sum.duplications / n).toFixed(1),
    technicalDebt: this.dashboardData.metrics.technicalDebt ?? '0'
  };

  // ตั้ง QG ง่าย ๆ จาก coverage
  const qg: 'OK'|'ERROR' = this.dashboardData.metrics.coverage >= 80 ? 'OK' : 'ERROR';
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
    const typeproject = this.normalizeProjectType(h.projectType);

    return {
      projectId:  h.projectId,       
      project:    h.projectName,
      typeproject,
      status:     (h as any).status ?? 'Passed', // ถ้า BE ยังไม่ส่งมาก็ fallback
      grade:      (h as any).grade  ?? 'A',      // เช่นกัน
      time:       t.toISOString().slice(0,16).replace('T',' ')
    };
  });
}



private normalizeProjectType(v?: string): 'Angular' | 'SpringBoot' {
  const s = (v || '').toLowerCase();
  if (s.includes('spring'))  return 'SpringBoot';
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
    if (Array.isArray(t0.days))            this.dashboardData.days = t0.days;
    if (t0.qualityGate) {
      this.dashboardData.qualityGate.status = (t0.qualityGate as any) as 'OK'|'ERROR';
    }
  }

  


private asNumber(v: any): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

/** แปลง metrics snake_case + string -> camelCase + number */
private normalizeRawMetrics(m: Dashboard['metrics']) {
  return {
    bugs: this.asNumber(m?.bugs),
    vulnerabilities: this.asNumber(m?.vulnerabilities),
    codeSmells: this.asNumber(m?.codeSmells),
    coverage: this.asNumber(m?.coverage),
    duplications: this.asNumber(m?.duplications)
  };
}

/** แปลงทั้ง array และคำนวณสรุปรวมไว้ใช้บน Dashboard */
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

  // รวมสรุป
  const totalProjects = perProject.length || 1;
  const sum = perProject.reduce((acc, p) => {
    acc.bugs += p.metrics.bugs;
    acc.vulnerabilities += p.metrics.vulnerabilities;
    acc.codeSmells += p.metrics.codeSmells;
    acc.coverage += p.metrics.coverage;
    acc.duplications += p.metrics.duplications;
    return acc;
  }, { bugs: 0, vulnerabilities: 0, codeSmells: 0, coverage: 0, duplications: 0 });

  // ค่าที่เหมาะสม:
  // - bugs / vulns / codeSmells: ใช้ผลรวม
  // - coverage / duplications: ใช้ค่าเฉลี่ย (ถ้าต้องการ median ก็เปลี่ยนสูตรได้)
  const totals = {
    bugs: sum.bugs,
    vulnerabilities: sum.vulnerabilities,
    codeSmells: sum.codeSmells,
    coverage: Number((sum.coverage / totalProjects).toFixed(1)),
    duplications: Number((sum.duplications / totalProjects).toFixed(1)),
    // technicalDebt จะไม่มีใน payload นี้ – ถ้าต้องคำนวณภายหลังค่อยใส่
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
    { title: '2.System Update',      message: 'Update v1.2 deployed.', icon: '⚙️', type: 'System', timestamp: new Date('2025-08-26T09:00:00'), read: false },
    { title: '3.Error Detected',     message: 'Server error reported.', icon: '❌', type: 'Issues', timestamp:new Date('2025-08-26T11:00:00'), read: true },
    { title: '4.New Issue',          message: 'Issue #456 created.', icon: '🐞', type: 'Issues', timestamp: new Date('2025-08-25T10:00:00'), read: false },
    { title: '5.Backup Done',        message: 'Daily backup completed.', icon: '💾', type: 'System', timestamp: new Date('2025-08-25T11:00:00'), read: true },
    { title: '6.Security Alert',     message: 'Login from new device.', icon: '🔒', type: 'System', timestamp: new Date('2025-07-26T10:00:00'), read: false },
    { title: '7.Scan #124 Completed',message: 'Scan #124 finished.', icon: '🔍', type: 'Scans', timestamp: new Date('2025-08-26T12:00:00'), read: false },
    { title: '8.New Issue',          message: 'Issue #457 created.', icon: '🐞', type: 'Issues', timestamp: new Date('2025-08-26T08:00:00'), read: false }
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

  // นับจากข้อมูลจริง แต่คง property mockData ไว้เพื่อไม่ต้องแก้ HTML
  private recomputeStatusCountsFromHistory() {
    const passed  = this.dashboardData.history.filter(h => h.status === 'Passed').length;
    const warning = this.dashboardData.history.filter(h => h.status === 'Warning').length;
    const failed  = this.dashboardData.history.filter(h => h.status === 'Failed').length;
    this.Data = { passedCount: passed, failedCount: failed };
    this.totalProjects = passed + warning + failed;
  }

  getGradeColor(grade: string): string {
    switch (grade) {
      case 'A': return '#10B981';
      case 'B': return '#84CC16';
      case 'C': return '#F59E0B';
      case 'D': return '#FB923C';
      case 'E': return '#EF4444';
      case 'F': return '#EF4444';
      default:  return '#6B7280';
    }
  }

  // คงชื่อเดิม แต่คำนวณจากข้อมูลจริง
  loadDashboardData() {
    // อัปเดตตัวเลข Passed/Warning/Failed จาก history จริง
    this.recomputeStatusCountsFromHistory();

    // ถ้าข้อมูลไม่พอ ใช้ coverage รวมเป็นตัวแทนความผ่าน
    let passPercent: number;
    if (this.totalProjects > 0) {
      passPercent = this.Data.passedCount / this.totalProjects;
    } else {
      passPercent = Math.max(0, Math.min(1, (this.dashboardData.metrics.coverage || 0) / 100));
    }

    this.grade =
      passPercent >= 0.8 ? 'A' :
      passPercent >= 0.7 ? 'B' :
      passPercent >= 0.6 ? 'C' :
      passPercent >= 0.5 ? 'D' :
      passPercent >= 0.4 ? 'E' : 'F';

    this.gradePercent = Math.round(passPercent * 100);
    const gradePercentSeries = this.gradePercent;
    const remainingPercent = 100 - this.gradePercent;

    this.pieChartOptions = {
      chart: { type: 'donut', height: 300 },
      series: [gradePercentSeries, remainingPercent],
      labels: ['', ''],
      colors: [this.getGradeColor(this.grade), '#E5E7EB'],
      plotOptions: {
        pie: {
          donut: {
            labels: {
              show: true,
              value: { color: 'var(--text-main)' },
              total: {
                show: true,
                showAlways: true,
                label: this.grade,
                fontSize: '24px',
                color: 'var(--text-main)',
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
    this.loading = false;
  }

  loadCoverageChart() {
    const data = this.dashboardData.coverageHistory?.length
      ? this.dashboardData.coverageHistory
      : [this.dashboardData.metrics.coverage]; // อย่างน้อยมี 1 จุด
    const cats = (this.dashboardData.days?.length === data.length && this.dashboardData.days.length)
      ? this.dashboardData.days
      : data.map((_, i) => i + 1);

    this.coverageChartSeries = [{ name: 'Coverage', data }];
    this.coverageChartOptions = {
      chart: { type: 'line', height: 200, foreColor: 'var(--apexcharts-text)' },
      stroke: { curve: 'smooth', width: 3 },
      markers: { size: 4 },
      colors: ['#2563eb'],
      xaxis: { categories: cats },
      yaxis: { labels: { formatter: (val) => val + '%' } }
    };
  }

  // ---------- Misc ----------
  get latestScans(): ScanHistory[] {
    return [...this.dashboardData.history]
      .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
      .slice(0, 5);
  }

  onRefresh() { this.fetchFromServer(this.auth.userId!); }
  onExport()  { console.log('Exporting data...'); }
  onLogout()  { this.router.navigate(['/']); }
}
