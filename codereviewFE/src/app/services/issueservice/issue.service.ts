import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../authservice/auth.service';
import { environment } from '../../environments/environment';

export interface Issue {
  issueId: string;
  scanId: string;
  projectName: string;
  projectId: string;
  userId?: string;         // assigned developer user_id
  issueKey: string;
  type: 'Bug' | 'Vulnerability' | 'Code Smell';
  severity: 'Blocker' | 'Critical' | 'Major' | 'Minor';
  component: string;
  message: string;
  assignedTo?: string;     // user_id
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface AddCommentPayload {
  text: string;   // เนื้อคอมเมนต์
  author: string; // userId ผู้เขียน
}

@Injectable({ providedIn: 'root' })
export class IssueService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);
  private readonly base = environment.apiUrl + '/issues';

  private authOpts() {
    const token = this.auth.token;
    return token
      ? { headers: new HttpHeaders({ Authorization: `Bearer ${token}` }) }
      : {};
  }

  /** GET /api/issues/user/{userId} — ดึง issues ทั้งหมดของผู้ใช้ */
  getAll(userId: string): Observable<Issue[]> {
    return this.http.get<Issue[]>(`${this.base}/user/${userId}`, this.authOpts());
  }

  /** GET /api/issues/:issues_id — ดึง issue รายตัว */
  getById(issues_id: string): Observable<Issue> {
    return this.http.get<Issue>(`${this.base}/${issues_id}`, this.authOpts());
  }

  /** PUT /api/issues/:issues_id/assign?userId=... — กำหนด developer (user_id) */
  assignDeveloper(issues_id: string, user_id: string): Observable<Issue> {
    const params = new HttpParams().set('userId', user_id);
    const opts = { ...this.authOpts(), params };
    return this.http.put<Issue>(`${this.base}/${issues_id}/assign`, null, opts);
  }

  /** PUT /api/issues/:issues_id/status — อัปเดตสถานะของ issue (BE ใช้ตัวพิมพ์ใหญ่) */
  updateStatus(
    issues_id: string,
    status: 'Open' | 'In Progress' | 'Resolved' | 'Closed'
  ): Observable<Issue> {
    return this.http.put<Issue>(`${this.base}/${issues_id}/status`, { status }, this.authOpts());
  }

  /** POST /api/issues/:issues_id/comments — เพิ่มคอมเมนต์ */
  addComment(issues_id: string, payload: AddCommentPayload): Observable<any> {
    const body = { comment: payload.text, userId: payload.author };
    return this.http.post(`${this.base}/${issues_id}/comments`, body, this.authOpts());
  }

  /** GET /api/issues/{issues_id}/comments — ดึงคอมเมนต์ */
  getComments(issues_id: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.base}/${issues_id}/comments`, this.authOpts());
  }
}
