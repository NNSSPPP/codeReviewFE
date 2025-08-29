import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';


interface Scan {
  id : string;
  date: string;
  time: string;
  project: string;
  status: string;
  statusText: string;
  grade: string;
  percentage: number;
  issues: { bugs: number; locks: number; warnings: number };
}

@Component({
  selector: 'app-scanhistory',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './scanhistory.component.html',
  styleUrl: './scanhistory.component.css'
})
export class ScanhistoryComponent {

  startDate: string = '';
  endDate: string = '';

  scans: Scan[] = [
    { id: '1', date: '2024-01-15', time: '10:30 AM', project: 'Angular-App', status: 'success', statusText: 'Success', grade: 'A', percentage: 92, issues: { bugs: 3, locks: 1, warnings: 45 } },
    { id: '2', date: '2024-01-15', time: '09:45 AM', project: 'API-Service', status: 'warning', statusText: 'Warning', grade: 'B', percentage: 85, issues: { bugs: 8, locks: 3, warnings: 67 } },
    { id: '3', date: '2024-01-14', time: '08:15 PM', project: 'Web-Portal', status: 'success', statusText: 'Success', grade: 'A', percentage: 90, issues: { bugs: 2, locks: 0, warnings: 30 } },
    { id: '4', date: '2024-01-14', time: '02:30 PM', project: 'Auth-Service', status: 'failed', statusText: 'Failed', grade: 'C', percentage: 72, issues: { bugs: 15, locks: 5, warnings: 105 } },
    { id: '5', date: '2024-01-13', time: '11:00 AM', project: 'Mobile-App', status: 'success', statusText: 'Success', grade: 'A', percentage: 95, issues: { bugs: 1, locks: 0, warnings: 10 } },
    { id: '6', date: '2024-01-12', time: '03:20 PM', project: 'Backend-Service', status: 'warning', statusText: 'Warning', grade: 'B', percentage: 80, issues: { bugs: 5, locks: 2, warnings: 40 }}
  ];

  filteredScans: Scan[] = [...this.scans];

  // Pagination
  pageSize: number = 5;
  currentPage: number = 1;
  totalPages: number = 1;
  pagedScans: Scan[] = [];
  pages: number[] = [];

  constructor(private router: Router) {
    this.updatePagination();
  }

  applyFilter() {
    this.filteredScans = this.scans.filter(scan => 
      (!this.startDate || scan.date >= this.startDate) &&
      (!this.endDate || scan.date <= this.endDate)
    );
    this.currentPage = 1;
    this.updatePagination();
  }

  clearFilter() {
    this.startDate = '';
    this.endDate = '';
    this.filteredScans = [...this.scans];
    this.currentPage = 1;
    this.updatePagination();
  }

  updatePagination() {
    this.totalPages = Math.ceil(this.filteredScans.length / this.pageSize);
    this.pages = Array.from({ length: this.totalPages }, (_, i) => i + 1);
    this.updatePagedScans();
  }

  updatePagedScans() {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.pagedScans = this.filteredScans.slice(start, end);
  }

  goPage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.updatePagedScans();
  }

  statusClass(status: string) {
    switch(status) {
      case 'success': return 'text-success';
      case 'failed': return 'text-danger';
      default: return 'text-warning';
    }
  }

  statusIcon(status: string) {
    switch(status) {
      case 'success': return 'bi-check-circle';
      case 'failed': return 'bi-x-circle';
      default: return 'bi-exclamation-circle';
    }
  }

  viewLog(scan: Scan) {
    this.router.navigate(['/logviewer', scan.id]);
  }

  viewResult(scan: Scan) {
    this.router.navigate(['/scanresult', scan.id]);
  }

  exportHistory() { alert('Exporting scan history...'); }
  compareScans() { alert('Comparing selected scans...'); }
  clearLogs() { alert('Clearing old logs...'); }

}

