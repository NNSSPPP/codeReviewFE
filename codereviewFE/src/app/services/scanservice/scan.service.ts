import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { AuthService } from '../authservice/auth.service';

export type ScanStatus = 'Active' | 'Scanning' | 'Error' | 'Cancelled';
export type YN = 'Y' | 'N';

export interface Scan {

  scanId: string;            // UUID
  projectId: string;          // UUID
  qualityGate?: string;
  startedAt?: Date;
  completedAt?: Date;
  status: ScanStatus;
  reliabilityGate?: string;
  securityGate?: string;
  maintainabilityGate?: string;
  securityReviewGate?: string; 
  coverageGate?: YN;
  duplicationGate?: YN;
  // metrics?: Record<string, number>;
  metrics?: {
    coverage?: number;
    bugs?: number;
    vulnerabilities?: number;
  };


  log_file_path?: string;

  // ถ้ามีจริงค่อยเติม
  log_file_name?: string;
  log_content?: string;
}

export interface ScanRequest {
  // ใส่ฟิลด์ตามที่ Spring รับ (คุณระบุไว้แบบนี้)
  repoUrl: string;
  projectKey: string;
  branchName?: string;
  token: string;
}

// หมายเหตุ: ชนิดนี้ต้อง "ตรงกับของ Spring" จริง ๆ
// จากตัวอย่าง controller ก่อนหน้า ผมเคยเห็นหน้าตาประมาณ scanId/fileName/path/content
// ถ้า backend ของคุณคืน { scan_id, line: string[] } ก็ใช้ตามนี้ได้เลย
export interface ScanLogModel {
  scanId: string;
  line: string[];
}

@Injectable({ providedIn: 'root' })
export class ScanService {
  private readonly http = inject(HttpClient);
  // แนะนำย้ายไป environment: `${environment.apiBaseUrl}/scans`
  private readonly base = 'http://localhost:8080/api/scans';
  private readonly auth = inject(AuthService);

  private authOpts() {
      const token = this.auth.token;
      return token
        ? { headers: new HttpHeaders({ Authorization: `Bearer ${token}` }) }
        : {};
    }

  /** POST /api/scans — เริ่มสแกน */
  startScan(req: ScanRequest): Observable<Scan> {
    console.log('[ScanService] Starting scan for repository:', req);
    return this.http.post<Scan>(this.base, req, this.authOpts());
  }

  /** GET /api/scans — ดึงสแกนทั้งหมด */
  getAllScan(): Observable<Scan[]> {
    console.log('[ScanService] Fetching all scans...');
    return this.http.get<Scan[]>(this.base, this.authOpts()).pipe(
      map(scans => {
        console.log('[ScanService] Raw scans from backend:', scans);
        const mapped = scans.map(s => ({
          ...s,
          status: this.mapStatus(s.status)
        }));
        console.log('[ScanService] Mapped scans:', mapped);
        return mapped;
      })
    );
  }

  /** GET /api/scans/{id} — รายละเอียดสแกน */
  getByScanId(id: string): Observable<Scan> {
    return this.http.get<Scan>(`${this.base}/${id}`, this.authOpts()).pipe(
      map(s => ({ ...s, status: this.mapStatus(s.status) }))
    );
  }

  /** GET /api/scans/{id}/log — log ของสแกน */
  getLog(id: string): Observable<ScanLogModel> {
    return this.http.get<ScanLogModel>(`${this.base}/${id}/log`, this.authOpts());
  }

  /** POST /api/scans/{id}/cancel — ยกเลิกสแกน */
  cancelScan(id: string): Observable<Scan> {
    // *** ระวัง: ใน Controller ใช้ @PostMapping("/{id}/cancel") แต่พารามิเตอร์ชื่อ scanId
    // ให้แก้ที่ฝั่ง Spring เป็น @PathVariable("id") UUID scanId
    return this.http.post<Scan>(`${this.base}/${id}/cancel`, null, this.authOpts());
  }

  /** ดึงสแกนตาม project_id (ถ้า backend ยังไม่มี endpoint แยก ใช้วิธี filter ฝั่ง client ชั่วคราว) */
  getScansByProjectId(projectId: string): Observable<Scan[]> {
    return this.getAllScan().pipe(
      map(scans => scans.filter(s => s.projectId === projectId).map(s => ({ ...s, status: this.mapStatus(s.status) })))
    );
  }

  public mapStatus(status?: string | 'Active' | 'Scanning' | 'Error'): 'Active' | 'Scanning' | 'Error' {
    if (!status) return 'Error'; // fallback
  
    const s = status.toUpperCase();
  
    switch (s) {
      case 'SUCCESS':
      case 'ACTIVE':   // ถ้า backend บางครั้งส่ง Active
        return 'Active';
      case 'FAILED':
      case 'ERROR':    // ถ้า backend บางครั้งส่ง Error
        return 'Error';
      case 'SCANNING':
        return 'Scanning';
      default:
        return 'Error'; // fallback
    }
  }
  


//       private readonly scans: Scan[] = [
//     {
//       scans_id: '1',
//       project_id: '111',
//       quality_gate: 'A',
//       status: 'Active',
//       started_at: new Date(Date.now() - 3600 * 1000),
//       completed_at: new Date(),
//       reliability_gate: 'Y',
//       security_gate: 'Y',
//       maintainability_gate: 'Y',
//       security_review_gate: 'Y',
//       metrics: { coverage: 85, bugs: 12, vulnerabilities: 3 },
//       log_file_path: '/logs/scan1.log',
//       log_file_name: 'scan1.log',
//       log_content: 'Scan 1 log content',
//     },
//     {
//       scans_id: '2',
//       project_id: '222',
//       quality_gate: 'B',
//       status: 'Scanning',
//       started_at: new Date(),
//       reliability_gate: 'Y',
//       security_gate: 'N',
//       maintainability_gate: 'Y',
//       security_review_gate: 'Y',
//       metrics: { coverage: 70, bugs: 25, vulnerabilities: 5 },
//       log_file_path: '/logs/scan2.log',
//       log_file_name: 'scan2.log',
//       log_content: 'Scan 2 log content',
//     },
//     {
//       scans_id: '3',
//       project_id: '333',
//       quality_gate: 'C',
//       status: 'Error',
//       started_at: new Date(Date.now() - 7200 * 1000),
//       completed_at: new Date(Date.now() - 3600 * 1000),
//       reliability_gate: 'N',
//       security_gate: 'Y',
//       maintainability_gate: 'Y',
//       security_review_gate: 'N',
//       metrics: { coverage: 70, bugs: 25, vulnerabilities: 5 },
//       log_file_path: '/logs/scan3.log',
//       log_file_name: 'scan3.log',
//       log_content: 'Scan 3 log content',
//     },
//     {
//       scans_id: '4',
//       project_id: '444',
//       quality_gate: 'A',
//       status: 'Active',
//       started_at: new Date(Date.now() - 10800 * 1000),
//       completed_at: new Date(Date.now() - 10700 * 1000),
//       reliability_gate: 'Y',
//       security_gate: 'N',
//       maintainability_gate: 'N',
//       security_review_gate: 'N',
//       metrics: { coverage: 50, bugs: 40, vulnerabilities: 10 },
//       log_file_path: '/logs/scan4.log',
//       log_file_name: 'scan4.log',
//       log_content: 'Scan 4 log content',
//     },
//     {
//       scans_id: '5',
//       project_id: '555',
//       quality_gate: 'B',
//       status: 'Error',
//       reliability_gate: 'Y',
//       security_gate: 'Y',
//       maintainability_gate: 'Y',
//       security_review_gate: 'Y',
//       metrics: { coverage: 90, bugs: 5, vulnerabilities: 0 },
//       log_file_path: '/logs/scan5.log',
//       log_file_name: 'scan5.log',
//       log_content: 'Scan 5 log content',
//     }
//   ];
  
//    GET /api/scans
//    ดึง scan ทั้งหมด (List all scan)
   
//   getAll(): Scan[] {
//     return this.scans;
//   }

   
//     GET /api/scans/:id
//     ดึง scan ตาม scan_id(get scan detail)
   
//   getByIdScan(scans_id: string): Scan | undefined {
//     return this.scans.find(s => s.scans_id === scans_id);
//   }

 
   
// POST /api/scans
// เพิ่ม scan ใหม่ (start scan)
// แบบเรียก API จริง
//  addScan(project_id: string): Observable<any> {
//   return this.http.post(`${this.apiUrl}/scans`, { project_id });
// }

// แบบ mock data (ไม่ยิง API จริง)
// addScan(project_id: string): Observable<any> {
//   console.log('[MOCK] Start scan for', project_id);
//   return of({
//     project_id,
//     status: 'Scanning',
//     started_at: new Date(),
//     message:'Scan started successfully'
//   });
// }

  
   
//    GET /api/scans/:id/log
//    ดึง log ของ scan ตาม scan_id
   
//   getLog(scans_id: string): string | undefined {
//     const scan = this.getByIdScan(scans_id);
//     return scan?.log_content;
//   }

   
//   POST /api/scans/:id/cancel
//   ยกเลิก scan ที่กำลังทำงาน (Scanning → Cancelled)
   
//   cancelScan(scans_id: string): boolean {
//     const scan = this.getByIdScan(scans_id);
//     if (scan && scan.status === 'Scanning') {
//       scan.status = 'Cancelled';
//       scan.completed_at = new Date(); // กำหนดเวลาสิ้นสุด
//       return true;
//     }
//     return false;
//   }

}
