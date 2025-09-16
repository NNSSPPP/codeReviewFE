import { Injectable } from '@angular/core';

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

  private issues: Issue[] = [
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

  // ดึง issue ทั้งหมด
  getAll(): Issue[] {
    return this.issues;
  }

  // ดึง issue ตาม issues_id
  getById(issues_id: string): Issue | undefined {
    return this.issues.find(i => i.issues_id === issues_id);
  }

  // ดึง issue ตาม scan_id
  getByScanId(scan_id: string): Issue[] {
    return this.issues.filter(i => i.scan_id === scan_id);
  }

  // เพิ่ม issue ใหม่
  addIssue(issue: Issue): void {
    const maxId = this.issues.length
      ? Math.max(...this.issues.map(i => +i.issues_id))
      : 0;
    issue.issues_id = (maxId + 1).toString();
    issue.createdAt = new Date();
    issue.updatedAt = new Date();
    this.issues.push(issue);
  }

  // อัพเดต issue
  updateIssue(issues_id: string, updatedIssue: Issue): void {
    const index = this.issues.findIndex(i => i.issues_id === issues_id);
    if (index > -1) {
      updatedIssue.updatedAt = new Date();
      updatedIssue.createdAt = this.issues[index].createdAt;
      this.issues[index] = { ...this.issues[index], ...updatedIssue };
    }
  }

  // ลบ issue
  deleteIssue(issues_id: string): void {
    this.issues = this.issues.filter(i => i.issues_id !== issues_id);
  }
}
