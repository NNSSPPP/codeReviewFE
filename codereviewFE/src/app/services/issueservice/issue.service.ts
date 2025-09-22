import { Injectable } from '@angular/core';
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

@Injectable({
  providedIn: 'root'
})
export class IssueService {

  private readonly issues: Issue[] = [
    {
      issues_id: '1',
      scan_id: '1',
      issueKey: 'BUG-101',
      type: 'Bug',
      severity: 'Critical',
      component: 'auth-service',
      message: 'NullPointerException on login',
      assignedTo: 'u1',
      status: 'Open',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      issues_id: '2',
      scan_id: '1',
      issueKey: 'VUL-201',
      type: 'Vulnerability',
      severity: 'Major',
      component: 'payment-service',
      message: 'SQL Injection risk',
      assignedTo: 'u2',
      status: 'In Progress',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  constructor() {}

  getByScanId(scan_id: string): Observable<Issue[]> {
    const result = this.issues.filter(i => i.scan_id === scan_id);
    return of(result);
  }

  //GET /api/issues
  // ดึง issue ทั้งหมด
  getAll(): Issue[] {
    return this.issues;
  }

  //GET /api/issues/:id
  // ดึง issue ตาม issues_id (detail issue)
  getById(issues_id: string): Issue | undefined {
    return this.issues.find(i => i.issues_id === issues_id);
  }

   
   // PUT /api/issues/:id/assign
   // กำหนด developer ให้กับ issue
   assignDeveloper(issues_id: string, user_id: string): void {
    const issue = this.getById(issues_id);
    if (issue) {
      issue.assignedTo = user_id;
      issue.updatedAt = new Date();
    }
  }

  //PUT /api/issues/:id/status
  //อัปเดตสถานะของ issue
  
  updateStatus(issues_id: string, status: 'Open' | 'In Progress' | 'Resolved' | 'Closed'): void {
    const issue = this.getById(issues_id);
    if (issue) {
      issue.status = status;
      issue.updatedAt = new Date();
    }
  }

  //POST /api/issues/:id/comments
  // เพิ่ม comment ให้ issue
   
  addComment(issues_id: string, comment: { text: string; author: string }): void {
    const issue = this.getById(issues_id);
    if (issue) {
      if (!(issue as any).comments) {
        (issue as any).comments = [];
      }
      (issue as any).comments.push({
        comment_id: `c${((issue as any).comments.length + 1).toString()}`,
        text: comment.text,
        author: comment.author,
        createdAt: new Date()
      });
      issue.updatedAt = new Date();
    }
  }
}
