// src/app/scanservice/scan.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

// ชนิดสถานะ/ค่า gate
export type ScanStatus = 'Active' | 'Scanning' | 'Paused' | 'Error' | 'Cancelled';
export type YN = 'Y' | 'N';

// ### ให้ชนิดเวลาเป็น string (ISO) เพื่อให้ตรงกับ backend ###
export interface Scan {
  scans_id: string;            // UUID
  project_id: string;          // UUID
  quality_gate?: string;
  status: ScanStatus;
  started_at?: string;         // ISO string
  completed_at?: string;       // ISO string
  reliability_gate?: YN;
  security_gate?: YN;
  maintainability_gate?: YN;
  security_review_gate?: YN;
  metrics?: Record<string, number>;
  log_file_path?: string;

  // ถ้ามีจริงค่อยเติม
  log_file_name?: string;
  log_content?: string;
}

export interface ScanRequest {
  // ใส่ฟิลด์ตามที่ Spring รับ (คุณระบุไว้แบบนี้)
  repoUrl: string;
  projectKey: string;
  branchName: string;
  token: string;
}

// หมายเหตุ: ชนิดนี้ต้อง "ตรงกับของ Spring" จริง ๆ
// จากตัวอย่าง controller ก่อนหน้า ผมเคยเห็นหน้าตาประมาณ scanId/fileName/path/content
// ถ้า backend ของคุณคืน { scan_id, line: string[] } ก็ใช้ตามนี้ได้เลย
export interface ScanLogModel {
  scan_id: string;
  line: string[];
}

@Injectable({ providedIn: 'root' })
export class ScanService {
  private http = inject(HttpClient);
  // แนะนำย้ายไป environment: `${environment.apiBaseUrl}/scans`
  private base = 'http://localhost:8080/api/scans';

  /** POST /api/scans — เริ่มสแกน */
  startScan(req: ScanRequest): Observable<Scan> {
    return this.http.post<Scan>(this.base, req);
  }

  /** GET /api/scans — ดึงสแกนทั้งหมด */
  getAll(): Observable<Scan[]> {
    return this.http.get<Scan[]>(this.base);
  }

  /** GET /api/scans/{id} — รายละเอียดสแกน */
  getByIdScan(id: string): Observable<Scan> {
    return this.http.get<Scan>(`${this.base}/${id}`);
  }

  /** GET /api/scans/{id}/log — log ของสแกน */
  getLog(id: string): Observable<ScanLogModel> {
    return this.http.get<ScanLogModel>(`${this.base}/${id}/log`);
  }

  /** POST /api/scans/{id}/cancel — ยกเลิกสแกน */
  cancelScan(id: string): Observable<Scan> {
    // *** ระวัง: ใน Controller ใช้ @PostMapping("/{id}/cancel") แต่พารามิเตอร์ชื่อ scanId
    // ให้แก้ที่ฝั่ง Spring เป็น @PathVariable("id") UUID scanId
    return this.http.post<Scan>(`${this.base}/${id}/cancel`, null);
  }

  /** ดึงสแกนตาม project_id (ถ้า backend ยังไม่มี endpoint แยก ใช้วิธี filter ฝั่ง client ชั่วคราว) */
  getScansByProjectId(project_id: string): Observable<Scan[]> {
    return this.getAll().pipe(
      map(scans => scans.filter(s => s.project_id === project_id))
    );
  }
}
