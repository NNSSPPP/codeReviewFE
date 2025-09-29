import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable , of } from 'rxjs';

export interface Scan {
  scans_id: string; // UUID
  project_id: string; // UUID
  quality_gate?: string;
  status: 'Active' | 'Scanning' |'Error' | 'Cancelled';
  started_at?: Date;
  completed_at?: Date;
  reliability_gate?: 'Y' | 'N';
  security_gate?: 'Y' | 'N';
  maintainability_gate?: 'Y' | 'N';
  security_review_gate?: 'Y' | 'N';
  // metrics?: Record<string, number>;
  metrics?: {
    coverage?: number;
    bugs?: number;
    vulnerabilities?: number;
  };
  log_file_path?: string;
  
  //ไม่มีในdiagram
  log_file_name?: string;
  log_content?: string;
}

export interface ScanRequest {
  repoUrl: string;
  projectKey: string;
  branchName: string;
  token: string;
}

export interface ScanLogModel {
  scan_id: string;           
  line: Array<string>;
}


@Injectable({
  providedIn: 'root'
})
export class ScanService {

  private readonly scans: Scan[] = [
    {
      scans_id: '1',
      project_id: '111',
      quality_gate: 'A',
      status: 'Active',
      started_at: new Date(Date.now() - 3600 * 1000),
      completed_at: new Date(),
      reliability_gate: 'Y',
      security_gate: 'Y',
      maintainability_gate: 'Y',
      security_review_gate: 'Y',
      metrics: { coverage: 85, bugs: 12, vulnerabilities: 3 },
      log_file_path: '/logs/scan1.log',
      log_file_name: 'scan1.log',
      log_content: 'Scan 1 log content',
    },
    {
      scans_id: '2',
      project_id: '222',
      quality_gate: 'B',
      status: 'Scanning',
      started_at: new Date(),
      reliability_gate: 'Y',
      security_gate: 'N',
      maintainability_gate: 'Y',
      security_review_gate: 'Y',
      metrics: { coverage: 70, bugs: 25, vulnerabilities: 5 },
      log_file_path: '/logs/scan2.log',
      log_file_name: 'scan2.log',
      log_content: 'Scan 2 log content',
    },
    {
      scans_id: '3',
      project_id: '333',
      quality_gate: 'C',
      status: 'Error',
      started_at: new Date(Date.now() - 7200 * 1000),
      completed_at: new Date(Date.now() - 3600 * 1000),
      reliability_gate: 'N',
      security_gate: 'Y',
      maintainability_gate: 'Y',
      security_review_gate: 'N',
      metrics: { coverage: 70, bugs: 25, vulnerabilities: 5 },
      log_file_path: '/logs/scan3.log',
      log_file_name: 'scan3.log',
      log_content: 'Scan 3 log content',
    },
    {
      scans_id: '4',
      project_id: '444',
      quality_gate: 'A',
      status: 'Active',
      started_at: new Date(Date.now() - 10800 * 1000),
      completed_at: new Date(Date.now() - 10700 * 1000),
      reliability_gate: 'Y',
      security_gate: 'N',
      maintainability_gate: 'N',
      security_review_gate: 'N',
      metrics: { coverage: 50, bugs: 40, vulnerabilities: 10 },
      log_file_path: '/logs/scan4.log',
      log_file_name: 'scan4.log',
      log_content: 'Scan 4 log content',
    },
    {
      scans_id: '5',
      project_id: '555',
      quality_gate: 'B',
      status: 'Cancelled',
      reliability_gate: 'Y',
      security_gate: 'Y',
      maintainability_gate: 'Y',
      security_review_gate: 'Y',
      metrics: { coverage: 90, bugs: 5, vulnerabilities: 0 },
      log_file_path: '/logs/scan5.log',
      log_file_name: 'scan5.log',
      log_content: 'Scan 5 log content',
    }
  ];
  

  constructor() {}

  getScansByProjectId(project_id: string): Observable<Scan[]> {
    return of(this.scans.filter(s => s.project_id === project_id));
  }
   
   //GET /api/scans
   // ดึง scan ทั้งหมด (List all scan)
   
  getAll(): Scan[] {
    return this.scans;
  }

   
    //GET /api/scans/:id
    //ดึง scan ตาม scan_id(get scan detail)
   
  getByIdScan(scans_id: string): Scan | undefined {
    return this.scans.find(s => s.scans_id === scans_id);
  }

 
   
   //POST /api/scans
   //เพิ่ม scan ใหม่ (start scan)
  addScan(scan: Scan): void {
    const maxId = this.scans.length
      ? Math.max(...this.scans.map(s => +s.scans_id))
      : 0;
    scan.scans_id = (maxId + 1).toString();
    this.scans.push(scan);
  }

  
   
   //GET /api/scans/:id/log
   // ดึง log ของ scan ตาม scan_id
   
  getLog(scans_id: string): string | undefined {
    const scan = this.getByIdScan(scans_id);
    return scan?.log_content;
  }

   
   //POST /api/scans/:id/cancel
    //ยกเลิก scan ที่กำลังทำงาน (Scanning → Cancelled)
   
  cancelScan(scans_id: string): boolean {
    const scan = this.getByIdScan(scans_id);
    if (scan && scan.status === 'Scanning') {
      scan.status = 'Cancelled';
      scan.completed_at = new Date(); // กำหนดเวลาสิ้นสุด
      return true;
    }
    return false;
  }

}
