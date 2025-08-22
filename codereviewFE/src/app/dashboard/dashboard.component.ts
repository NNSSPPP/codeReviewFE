import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
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
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule,NgApexchartsModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})


export class DashboardComponent {
  constructor(private readonly router: Router) {}

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
      { project: 'Project A', status: 'Passed', grade: 'A', time: '2025-08-20 12:00' },
      { project: 'Project B', status: 'Warning', grade: 'B', time: '2025-08-19 15:00' },
      { project: 'Project C', status: 'Failed', grade: 'C', time: '2025-08-18 09:00' }
    ]
  };

  showNotifications = false
  notifications = [
    { type: 'error',   title: 'Scan failed', message: 'API-Service build failed', icon: 'bi bi-x-circle-fill' },
    { type: 'warning', title: 'Quality gate warning', message: 'Coverage dropped below 80%', icon: 'bi bi-exclamation-triangle-fill' },
    { type: 'success', title: 'Issue resolved', message: 'SQL Injection fixed', icon: 'bi bi-check-circle-fill' },
    { type: 'info',    title: 'New comment', message: 'Please review code again', icon: 'bi bi-info-circle-fill' }
  ];

  toggleNotifications() {
    this.showNotifications = !this.showNotifications;
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

ngOnInit() {
  this.loadDashboardData();
}

// ฟังก์ชันคำนวณสีตามเกรด
getGradeColor(grade: string): string {
  switch (grade) {
    case 'A': return '#10B981'; // Green
    case 'B': return '#84CC16'; // Light Green
    case 'C': return '#F59E0B'; // Orange
    case 'D': return '#FB923C'; // Light Orange
    case 'E':
    case 'F': return '#EF4444'; // Red
    default: return '#6B7280';   // Gray fallback
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


}
