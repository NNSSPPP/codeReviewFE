import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';

export interface Issue {
  issues_id: string;
  scan_id: string;
  issueKey: string;
  type: 'Bug' | 'Vulnerability' | 'Code Smell';
  severity: 'Blocker' | 'Critical' | 'Major' | 'Minor';
  component: string;
  message: string;
  assignedTo?: string; // user_id
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
  createdAt: Date;
  updatedAt: Date;
}
export interface AddCommentPayload {
  text: string;    // alias ของ "comment"
  author: string;  // alias ของ "userId"
}
@Injectable({
  providedIn: 'root'
})
export class IssueService {

  // private readonly issues: Issue[] = [
  //   {
  //     issues_id: '1',
  //     scan_id: '1',
  //     issueKey: 'BUG-101',
  //     type: 'Bug',
  //     severity: 'Critical',
  //     component: 'auth-service',
  //     message: 'NullPointerException on login',
  //     assignedTo: 'u1',
  //     status: 'Open',
  //     createdAt: new Date(),
  //     updatedAt: new Date()
  //   },
  //   {
  //     issues_id: '2',
  //     scan_id: '1',
  //     issueKey: 'VUL-201',
  //     type: 'Vulnerability',
  //     severity: 'Major',
  //     component: 'payment-service',
  //     message: 'SQL Injection risk',
  //     assignedTo: 'u2',
  //     status: 'In Progress',
  //     createdAt: new Date(),
  //     updatedAt: new Date()
  //   }
  // ];

  private http = inject(HttpClient);
  private base = 'http://localhost:8080/api/issues';
  
  //GET /api/issues
  // ดึง issue ทั้งหมด
  getAll(userId: string): Observable<Issue[]> {
    return this.http.get<Issue[]>(`${this.base}/${userId}`);
  }

  // GET /api/issues/:issues_id
  // ดึง issue ตาม issues_id (detail issue)
  getById(issues_id: string): Observable<Issue | undefined> {
    return this.http.get<Issue>(`${this.base}/${issues_id}`);
  }


   
   // PUT /api/issues/:id/assign
   // กำหนด developer ให้กับ issue
  assignDeveloper(issues_id: string, user_id: string): Observable<Issue> {
    const params = new HttpParams().set('userId', user_id);
    return this.http.put<Issue>(`${this.base}/${issues_id}/assign`, null, { params });
  }


  //PUT /api/issues/:issues_id/status
  //อัปเดตสถานะของ issue
  updateStatus(
    issues_id: string,
    status: 'Open' | 'In Progress' | 'Resolved' | 'Closed'
  ): Observable<Issue> {
    return this.http.put<Issue>(`${this.base}/${issues_id}/status`, { status });
  }
 
  //POST /api/issues/:id/comments
  // เพิ่ม comment ให้ issue
  addComment(
    issues_id: string,
    payload: { text: string; author: string } // map ไปเป็น {comment, userId}
  ): Observable<any> {
    const body = { comment: payload.text, userId: payload.author };
    return this.http.post(`${this.base}/${issues_id}/comments`, body);
  }

  /** GET /api/issues/{issues_id}/comments */
  getComments(issues_id: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.base}/${issues_id}/comments`);
  }

}
