import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';



interface Scan {
  scan_id : string;
  date: string;
  time: string;
  project: string;
  status: string;
  statusText: string;
  grade: string;
  issues?: { bugs?: number; locks?: number; warnings?: number };
}

@Component({
  selector: 'app-scanhistory',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './scanhistory.component.html',
  styleUrls: ['./scanhistory.component.css']  
})
export class ScanhistoryComponent {

  startDate: string = '';
  endDate: string = '';

  scans: Scan[] = [
    { scan_id: '11', date: '2024-01-15', time: '10:30 AM', project: 'Angular-App', status: 'success', statusText: 'Success', grade: 'A', issues: { bugs: 3, locks: 1, warnings: 45 } },
    { scan_id: '2', date: '2024-01-15', time: '09:45 AM', project: 'API-Service', status: 'warning', statusText: 'Warning', grade: 'B',  issues: { bugs: 8, locks: 3, warnings: 67 } },
    { scan_id: '3', date: '2024-01-14', time: '08:15 PM', project: 'Web-Portal', status: 'success', statusText: 'Success', grade: 'A',  issues: { bugs: 2, locks: 0, warnings: 30 } },
    { scan_id: '4', date: '2024-01-14', time: '02:30 PM', project: 'Auth-Service', status: 'failed', statusText: 'Failed', grade: 'C',  issues: { bugs: 15, locks: 5, warnings: 105 } },
    { scan_id: '5', date: '2024-01-13', time: '11:00 AM', project: 'Mobile-App', status: 'success', statusText: 'Success', grade: 'A',  issues: { bugs: 1, locks: 0, warnings: 10 } },
    { scan_id: '6', date: '2024-01-12', time: '03:20 PM', project: 'Backend-Service', status: 'warning', statusText: 'Warning', grade: 'B', issues: { bugs: 5, locks: 2, warnings: 40 }}
  ];

  filteredScans: Scan[] = [...this.scans];

  // Pagination
  pageSize: number = 5;
  currentPage: number = 1;
  totalPages: number = 1;
  pagedScans: Scan[] = [];
  pages: number[] = [];

  constructor(private readonly router: Router) {
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
    this.router.navigate(['/logviewer', scan.scan_id]);
  }

  viewResult(scan: Scan) {
    this.router.navigate(['/scanresult', scan.scan_id]);
  }

  // Export CSV
  exportHistory(): void {
    const flatData = this.filteredScans.map((scan, index) => ({
      No : index + 1,                   
      Date: this.formatDate(scan.date),   
      Time: scan.time,
      Project: scan.project,
      Status: scan.status,
      StatusText: scan.statusText,
      Grade: scan.grade,
      Bugs: scan.issues?.bugs ?? 0,
      Locks: scan.issues?.locks ?? 0,
      Warnings: scan.issues?.warnings ?? 0
    }));

    const header = Object.keys(flatData[0]).join(',');
    const rows = flatData.map(r => Object.values(r).join(',')).join('\n');
    const csv = header + '\n' + rows;

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const now = new Date();
  const dateStr = `${now.getFullYear()}${(now.getMonth()+1).toString().padStart(2,'0')}${now.getDate().toString().padStart(2,'0')}`;
  const fileName = `history_scan_${dateStr}.csv`;

  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  }
  

  selectedScans: Scan[] = [];
  showCompareModal = false;

  toggleScanSelection(scan: Scan) {
    const idx = this.selectedScans.findIndex(s => s.scan_id === scan.scan_id);
    if (idx >= 0) {
      // คลิกซ้ำเอาออก
      this.selectedScans.splice(idx, 1);
    } else if (this.selectedScans.length < 3) { // limit 3 scans
      this.selectedScans.push(scan);
    } else {
      alert("เลือกได้สูงสุด 3 scans");
    }
  }

  isSelected(scan: Scan): boolean {
    return this.selectedScans.some(s => s.scan_id === scan.scan_id);
  }
  
  
  compareScans() {
    if (this.selectedScans.length < 2) {
      alert("กรุณาเลือกอย่างน้อย 2 scans เพื่อเปรียบเทียบ");
      return;
    }
    this.showCompareModal = true;
  }
 

  closeCompareModal() {
    this.showCompareModal = false;
  }

  clearLogs() {
    this.startDate = '';
    this.endDate = '';
    this.filteredScans = [...this.scans];
    this.currentPage = 1;
    this.selectedScans = [];
    this.updatePagination();
  }
  

  // ฟังก์ชันช่วยแปลงเป็น dd/mm/yyyy
private formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  const day = d.getDate().toString().padStart(2, '0');
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

}

