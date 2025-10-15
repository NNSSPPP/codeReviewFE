import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { AuthService } from '../authservice/auth.service';

export interface Issue {
  issuesId: string;
  scanId: string;
  projectId: string;
  userId: string;
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

 
  
  private readonly http = inject(HttpClient);
  private readonly base = 'http://localhost:8080/api/issues';
  private readonly auth = inject(AuthService);

  private authOpts() {
        const token = this.auth.token;
        return token
          ? { headers: new HttpHeaders({ Authorization: `Bearer ${token}` }) }
          : {};
      }
  
  //GET /api/issues/{userId}
  // ดึง issue ทั้งหมด
  getAllIssue(userId: string): Observable<Issue[]> {
    return this.http.get<Issue[]>(`${this.base}/user/${userId}`, this.authOpts());
  }

  getIssueByProjectId(projectId: string): Observable<Issue[]> {
    return this.http.get<Issue[]>(`${this.base}/project/${projectId}`, this.authOpts());
  }

  // GET /api/issues/:issues_id
  // ดึง issue ตาม issues_id (detail issue)
  getIssueById(issuesId: string): Observable<Issue | undefined> {
    return this.http.get<Issue>(`${this.base}/${issuesId}`, this.authOpts());
  }


   
   // PUT /api/issues/:id/assign
   // กำหนด developer ให้กับ issue
  assignDeveloper(issuesId: string, userId: string): Observable<Issue> {
    const params = new HttpParams().set('userId', userId);
    return this.http.put<Issue>(`${this.base}/${issuesId}/assign`, null, { params });
  }


  //PUT /api/issues/:issues_id/status
  //อัปเดตสถานะของ issue
  updateStatus(
    issuesId: string,
    status: 'Open' | 'In Progress' | 'Resolved' | 'Closed'
  ): Observable<Issue> {
    return this.http.put<Issue>(`${this.base}/${issuesId}/status`, { status }, this.authOpts());
  }
 
  //POST /api/issues/:id/comments
  // เพิ่ม comment ให้ issue
  addComment(
    issuesId: string,
    payload: { text: string; author: string } // map ไปเป็น {comment, userId}
  ): Observable<any> {
    const body = { comment: payload.text, userId: payload.author };
    return this.http.post(`${this.base}/${issuesId}/comments`, body, this.authOpts());
  }

  /** GET /api/issues/{issues_id}/comments */
  getComments(issuesId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.base}/${issuesId}/comments`, this.authOpts());
  }

  

}
