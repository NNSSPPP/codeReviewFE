import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

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
  imports: [CommonModule],
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

  notifications = [
    { type: 'error',   title: 'Scan failed', message: 'API-Service build failed', icon: 'bi bi-x-circle-fill' },
    { type: 'warning', title: 'Quality gate warning', message: 'Coverage dropped below 80%', icon: 'bi bi-exclamation-triangle-fill' },
    { type: 'success', title: 'Issue resolved', message: 'SQL Injection fixed', icon: 'bi bi-check-circle-fill' },
    { type: 'info',    title: 'New comment', message: 'Please review code again', icon: 'bi bi-info-circle-fill' }
  ];

  showNotifications = false;

  onRefresh() {
    console.log('Refreshing dashboard...');
  }

  onExport() {
    console.log('Exporting data...');
  }

  toggleNotifications() {
    this.showNotifications = !this.showNotifications;
  }

  onLogout() {
    console.log('Logging out...');
    this.router.navigate(['/']);
  }
}
