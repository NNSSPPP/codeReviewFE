import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {
  constructor(private readonly router: Router) {}

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

  qualityStatus = { passed: 5, warning: 2, failed: 1 };

  recentScans = [
    { project: 'Project A', status: 'Passed', grade: 'A', time: '2025-08-20 12:00' },
    { project: 'Project B', status: 'Warning', grade: 'B', time: '2025-08-19 15:00' },
    { project: 'Project C', status: 'Failed', grade: 'C', time: '2025-08-18 09:00' }
  ];

  topIssues = [
    'SQL Injection - 3',
    'XSS problem - 2',
    'Memory Leak - 2'
  ];

  projectDistribution = ['Angular', 'Spring', 'React'];
}
