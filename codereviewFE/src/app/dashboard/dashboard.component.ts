import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router , RouterModule} from '@angular/router';
import { NgApexchartsModule, ApexOptions } from 'ng-apexcharts';

interface Condition {
  metric: string;
  status: 'OK' | 'WARN' | 'ERROR';
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
  project: string;
  typeproject: 'Angular' | 'SpringBoot';
  status: 'Passed' | 'Warning' | 'Failed';
  grade: string;
  time: string;
}

interface DashboardData {
  qualityGate: {
    status: 'OK' | 'WARN' | 'ERROR';
    conditions: Condition[];
  };
  metrics: {
    bugs: number;
    vulnerabilities: number;
    codeSmells: number;
    coverage: number;
    duplications: number;
    technicalDebt: string;
  };
  issues: Issue[];
  securityHotspots: SecurityHotspot[];
  history: ScanHistory[];
  coverageHistory: number[];
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

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule,NgApexchartsModule,RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})


export class DashboardComponent {
  constructor(private readonly router: Router) {}

  ngOnInit() {

    this.loadDashboardData();
    this.loadCoverageChart();
    this.calculateProjectDistribution();
  }

   // Mock Dashboard Data
   dashboardData: DashboardData = {
    qualityGate: {
      status: 'WARN',
      conditions: [
        { metric: 'Coverage', status: 'WARN', actual: 78, threshold: 80 },
        { metric: 'Bugs', status: 'OK', actual: 2, threshold: 5 },
        { metric: 'Code Smells', status: 'ERROR', actual: 150, threshold: 100 }
      ]
    },
    metrics: {
      bugs: 2,
      vulnerabilities: 1,
      codeSmells: 150,
      coverage: 78,
      duplications: 5,
      technicalDebt: '12d'
    },
    issues: [
      { id: 1, type: 'Bug', severity: 'CRITICAL', message: 'SQL Injection vulnerability', project: 'Project A' },
      { id: 2, type: 'Bug', severity: 'MAJOR', message: 'Memory Leak', project: 'Project B' }
    ],
    securityHotspots: [
      { id: 1, status: 'TO_REVIEW', description: 'Use of weak cryptography', project: 'Project C' },
      { id: 2, status: 'REVIEWED', description: 'Hardcoded password', project: 'Project A' }
    ],
    history: [
      { project: 'Project A', typeproject: 'Angular', status: 'Passed', grade: 'A', time: '2025-08-21 12:00' },
      { project: 'Project B', typeproject: 'SpringBoot', status: 'Warning', grade: 'B', time: '2025-08-19 15:00' },
      { project: 'Project C', typeproject: 'Angular', status: 'Failed', grade: 'C', time: '2025-08-18 09:00' },
      { project: 'Project D', typeproject: 'SpringBoot', status: 'Failed', grade: 'E', time: '2025-08-17 09:00' },
      { project: 'Project E', typeproject: 'Angular', status: 'Passed', grade: 'A', time: '2025-08-20 12:00' },
      { project: 'Project F', typeproject: 'SpringBoot', status: 'Warning', grade: 'B', time: '2025-08-15 15:00' },
      { project: 'Project G', typeproject: 'Angular', status: 'Failed', grade: 'D', time: '2025-08-01 09:00' }
    ],
    coverageHistory: [70, 75, 80, 85, 90, 95, 100],
    days: [1, 5, 10, 15, 20, 25, 30]
  };

  showNotifications = false;
  isMobile = false;
  activeTab: NotificationTab = 'All';
  displayCount = 5;

  getTimeAgo(timestamp: Date): string {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime(); // millisecond
  
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  }
  

  notifications: Notification[] = [
    { title: '1.New Scan Completed', message: 'Scan #123 finished.', icon: '🔍', type: 'Scans', timestamp: new Date('2025-08-26T10:00:00'), read: false },
    { title: '2.System Update', message: 'Update v1.2 deployed.', icon: '⚙️', type: 'System', timestamp: new Date('2025-08-26T09:00:00'), read: false },
    { title: '3.Error Detected', message: 'Server error reported.', icon: '❌', type: 'Issues', timestamp:new Date('2025-08-26T11:00:00'), read: true },
    { title: '4.New Issue', message: 'Issue #456 created.', icon: '🐞', type: 'Issues', timestamp: new Date('2025-08-25T10:00:00'), read: false },
    { title: '5.Backup Done', message: 'Daily backup completed.', icon: '💾', type: 'System', timestamp: new Date('2025-08-25T11:00:00'), read: true },
    { title: '6.Security Alert', message: 'Login from new device.', icon: '🔒', type: 'System', timestamp: new Date('2025-07-26T10:00:00'), read: false },
    { title: '7.Scan #124 Completed', message: 'Scan #124 finished.', icon: '🔍', type: 'Scans', timestamp: new Date('2025-08-26T12:00:00'), read: false },
    { title: '8.New Issue', message: 'Issue #457 created.', icon: '🐞', type: 'Issues', timestamp: new Date('2025-08-26T08:00:00'), read: false }
  ];

  toggleNotifications() { this.showNotifications = !this.showNotifications; }
  closeNotifications() { this.showNotifications = false; }
  
  @HostListener('window:resize')
  checkScreenSize() {
    this.isMobile = window.innerWidth <= 768; // mobile ถ้าน้อยกว่า 768px
  }

  markAllRead() {
    this.notifications.forEach(n => n.read = true);
  }

  selectTab(tab: NotificationTab) {
    this.activeTab = tab;
    this.displayCount = 5;
  }


  get filteredNotifications() {
    let filtered = this.notifications;
  
    if (this.activeTab === 'Unread') filtered = filtered.filter(n => !n.read);
    else if (this.activeTab !== 'All') filtered = filtered.filter(n => n.type === this.activeTab);
  
    filtered = filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  
    return filtered.slice(0, this.displayCount);
  }
  

  get unreadCount() {
    return this.notifications.filter(n => !n.read).length;
  }

  loadMore() {
    this.displayCount += 5;
  }

  get totalFilteredCount() {
    if (this.activeTab === 'All') return this.notifications.length;
    if (this.activeTab === 'Unread') return this.notifications.filter(n => !n.read).length;
    return this.notifications.filter(n => n.type === this.activeTab).length;
  }

  
  
  

  get latestScans(): ScanHistory[] {
    return [...this.dashboardData.history] 
      .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
      .slice(0, 5);
  }
  
  projectDistribution: { type: string, count: number, percent: number }[] = [];


calculateProjectDistribution() {
  const typeCounts: Record<string, number> = {};
  const total = this.dashboardData.history.length;

  this.dashboardData.history.forEach(h => {
    if (typeCounts[h.typeproject]) typeCounts[h.typeproject]++;
    else typeCounts[h.typeproject] = 1;
  });

  this.projectDistribution = Object.entries(typeCounts).map(([type, count]) => ({
    type,
    count,
    percent: Math.round((count / total) * 100)
  }));
}



  onRefresh() {
    console.log('Refreshing dashboard...');
  }

  onExport() {
    console.log('Exporting data...');
  }

  onLogout() {
    console.log('Logging out...');
    this.router.navigate(['/']);
  }

   // Mock data
   mockData = {
    passedCount: 15,
    warningCount: 3,
    failedCount: 0
  };

  /// Pie chart options
pieChartOptions!: ApexOptions;
totalProjects = 0;
grade = '';
gradePercent = 0;
loading = true;

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
  // คำนวณรวมโปรเจกต์
  this.totalProjects = this.mockData.passedCount + this.mockData.warningCount + this.mockData.failedCount;
  const passPercent = this.mockData.passedCount / this.totalProjects;

  // คำนวณเกรดรวม
  if (passPercent >= 0.8) this.grade = 'A';
  else if (passPercent >= 0.7) this.grade = 'B';
  else if (passPercent >= 0.6) this.grade = 'C';
  else if (passPercent >= 0.5) this.grade = 'D';
  else if (passPercent >= 0.4) this.grade = 'E';
  else this.grade = 'F';

  this.gradePercent = Math.round(passPercent * 100);

  const gradePercentSeries = this.gradePercent; // % ของเกรด
  const remainingPercent = 100 - this.gradePercent; // ส่วนที่เหลือ
  
  this.pieChartOptions = {
    chart: { type: 'donut', height: 300 },
    series: [gradePercentSeries, remainingPercent],
    labels: ['', ''], // ปิด label segment
    colors: [this.getGradeColor(this.grade), '#E5E7EB'], // สีเกรด + สีเทา
    plotOptions: {
      pie: {
        donut: {
          labels: {
            show: true,
            total: {
              show: true,
              showAlways: true,
              label: this.grade, // ตัวอักษรเกรด
              fontSize: '24px',
              formatter: () => this.gradePercent + '%' // ตัวเลข %
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

coverageChartSeries: any[] = [];
coverageChartOptions: ApexOptions = {};


loadCoverageChart() {
  this.coverageChartSeries = [
    {
      name: 'Coverage',
      data: this.dashboardData.coverageHistory
    }
  ];

  this.coverageChartOptions = {
    chart: {
      type: 'line',
      height: 200
    },
    stroke: {
      curve: 'smooth',
      width: 3
    },
    markers: {
      size: 4
    },
    colors: ['#2563eb'],
    xaxis: {
      categories: this.dashboardData.days
    },
    yaxis: {
      labels: {
        formatter: (val) => val + '%'
      }
    }
  };
}
}
