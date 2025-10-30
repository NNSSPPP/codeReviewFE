import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ReportRequest {
  projectId: string;
  dateFrom: string;  // 'YYYY-MM-DD'
  dateTo: string;    // 'YYYY-MM-DD'
  outputFormat: string; // 'pdf' | 'xlsx' | 'docx' | 'pptx'
  includeSections: string[]; // ["QualityGateSummary","IssueBreakdown"]
}

@Injectable({
  providedIn: 'root'
})
export class ExportreportService {

   private apiUrl = 'http://localhost:8080/api/export'; // ปรับเป็น URL ของคุณ

  constructor(private http: HttpClient) {}

  generateReport(req: ReportRequest): Observable<Blob> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    return this.http.post(`${this.apiUrl}/generate`, req, {
      headers,
      responseType: 'blob'
    });
  }
}
