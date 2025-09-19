import { Injectable } from '@angular/core';
import { IssueService } from '../issueservice/issue.service';

export interface Scan {
  scans_id: string; // UUID
  project_id: string; // UUID
  quality_gate?: string;
  status: 'Active' | 'Scanning' | 'Paused' |'Error';
  started_at?: Date;
  completed_at?: Date;
  reliability_gate?: 'Y' | 'N';
  security_gate?: 'Y' | 'N';
  maintainability_gate?: 'Y' | 'N';
  security_review_gate?: 'Y' | 'N';
  metrics?: any;
  log_file_path?: string;
  created_at: Date;
  updated_at: Date;
}

@Injectable({
  providedIn: 'root'
})
export class ScanService {

  private scans: Scan[] = [
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
      created_at: new Date(),
      updated_at: new Date()
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
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      scans_id: '3',
      project_id: '333',
      quality_gate: 'C',
      status: 'Paused',
      started_at: new Date(Date.now() - 7200 * 1000),
      completed_at: new Date(Date.now() - 3600 * 1000),
      reliability_gate: 'N',
      security_gate: 'Y',
      maintainability_gate: 'Y',
      security_review_gate: 'N',
      metrics: { coverage: 70, bugs: 25, vulnerabilities: 5 },
      log_file_path: '/logs/scan3.log',
      created_at: new Date(),
      updated_at: new Date()
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
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      scans_id: '5',
      project_id: '555',
      quality_gate: 'B',
      status: 'Active',
      reliability_gate: 'Y',
      security_gate: 'Y',
      maintainability_gate: 'Y',
      security_review_gate: 'Y',
      metrics: { coverage: 90, bugs: 5, vulnerabilities: 0 },
      log_file_path: '/logs/scan5.log',
      created_at: new Date(),
      updated_at: new Date()
    }
  ];
  

  constructor() {}

  // ดึง scan ทั้งหมด
  getAll(): Scan[] {
    return this.scans;
  }

  // ดึง scan ตาม scan_id
  getByIdScan(scans_id: string): Scan | undefined {
    return this.scans.find(s => s.scans_id === scans_id);
  }


  // เพิ่ม scan ใหม่
  addScan(scan: Scan): void {
    const maxId = this.scans.length
      ? Math.max(...this.scans.map(s => +s.scans_id))
      : 0;
    scan.scans_id = (maxId + 1).toString();
    scan.created_at = new Date();
    scan.updated_at = new Date();
    this.scans.push(scan);
  }

  // อัพเดต scan
  updateScan(scans_id: string, updatedScan: Scan): void {
    const index = this.scans.findIndex(s => s.scans_id === scans_id);
    if (index > -1) {
      updatedScan.updated_at = new Date();
      updatedScan.created_at = this.scans[index].created_at;
      this.scans[index] = { ...this.scans[index], ...updatedScan };
    }
  }

  // ลบ scan
  deleteScan(scans_id: string): void {
    this.scans = this.scans.filter(s => s.scans_id !== scans_id);
  }

  // ดึง scan ตาม project_id
  getByProjectId(project_id: string): Scan[] {
    return this.scans.filter(s => s.project_id === project_id);
  }
}
