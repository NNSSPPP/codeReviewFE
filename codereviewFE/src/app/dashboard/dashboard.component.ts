import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';
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
    this.calculateProjectDistribution();
    this.loadCoverageChart();
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

  showNotifications = false
  notifications = [
    { type: 'error',   title: 'Scan failed', message: 'API-Service build failed', icon: 'bi bi-x-circle-fill' },
    { type: 'warning', title: 'Quality gate warning', message: 'Coverage dropped below 80%', icon: 'bi bi-exclamation-triangle-fill' },
    { type: 'success', title: 'Issue resolved', message: 'SQL Injection fixed', icon: 'bi bi-check-circle-fill' },
    { type: 'info',    title: 'New comment', message: 'Please review code again', icon: 'bi bi-info-circle-fill' }
  ];

  get latestScans(): ScanHistory[] {
    return [...this.dashboardData.history] // clone array ก่อน
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


  toggleNotifications() {
    this.showNotifications = !this.showNotifications;
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
