import { Component } from '@angular/core';
import { Router } from '@angular/router';
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {
  constructor(private router: Router) { }

  notifications = 3;

  onRefresh() {
    console.log('Refreshing dashboard...');
    // เขียนโค้ดรีเฟรชข้อมูล
  }

  onExport() {
    console.log('Exporting data...');
    // เขียนโค้ด export ข้อมูล
  }

  onNotificationClick() {
    console.log('Opening notifications...');
    // เปิด modal หรือหน้าแจ้งเตือน
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
