import { Component } from '@angular/core';
import{CommonModule} from '@angular/common';
import{FormsModule} from '@angular/forms';

interface Attachment {
  filename: string;
  url: string;
}

interface IssueComment {
  issueId: string;
  userId: string;
  comment: string;
  timestamp: Date;
  attachments?: Attachment[];
  mentions?: string[];
}

interface Issue {
  id: string;
  type: string;
  title: string;
  severity: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  project: string;
  file: string;
  line: number;
  created: string;
  assignedTo: string[]; // เปลี่ยนเป็น array
  dueDate: string;
  description: string;
  vulnerableCode: string;
  recommendedFix: string;
  comments: IssueComment[];
}

@Component({
  selector: 'app-issuedetail',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './issuedetail.component.html',
  styleUrl: './issuedetail.component.css'
})
export class IssuedetailComponent {

  //to be continue จะต้องเปลี่ยนตามคนที่login
  currentUser = '@currentUser';

   // ตัวเลือก Priority และ Status
   priorityLevels: Array<'Low' | 'Medium' | 'High' | 'Critical'> = ['Low', 'Medium', 'High', 'Critical'];

  issue: Issue = {
    id: 'SEC-2024-0145',
    type: 'Security',
    title: 'SQL Injection Risk',
    severity: 'Critical',
    priority: 'High',
    status: 'open',
    project: 'Angular-App',
    file: 'src/services/database.service.ts',
    line: 89,
    created: '2024-01-15 10:35 AM',
    assignedTo: ['@jane.dev'], // เป็น array
    dueDate: '2024-01-17',
    description: 'User input is directly concatenated into SQL query without proper sanitization or parameterization.',
    vulnerableCode: "const query = `SELECT * FROM users WHERE username = '${userInput}'`;",
    recommendedFix: 'Use parameterized queries or prepared statements',
    comments: [ { issueId: 'SEC-2024-0145', 
      userId: '@hello', 
      comment: 'This is a critical issue. We should use parameterized queries. I can help with the fix if needed.', 
      timestamp: new Date('2024-01-15T11:00:00'),
       mentions: ['@john.dev'] }, 
       { issueId: 'SEC-2024-0145', 
        userId: '@world', 
        comment: 'Thanks @john.dev. I\'m working on it now. Will push the fix by EOD.', 
        timestamp: new Date('2024-01-15T11:30:00') } ]
  };
   // ปุ่มย้อนกลับ
   goBack(): void {
    window.history.back();
  }

  newComment = {
    mention: '',  // @username
    comment: ''
  };
  
  postComment() {
    const commentText = this.newComment.comment.trim();
    if (!commentText) return;
  
    this.issue.comments.push({
      issueId: this.issue.id,
      userId: this.currentUser,  // ใช้ username ของคนที่ login
      comment: commentText,
      timestamp: new Date(),
      attachments: [],
      mentions: this.newComment.mention ? [this.newComment.mention] : []
    });
  
    // Reset input
    this.newComment = { mention: '', comment: '' };
  }
  
  

  

  updateStatus() {
    switch (this.issue.status) {
      case 'open':
        this.issue.status = 'in-progress';
        break;
      case 'in-progress':
        this.issue.status = 'resolved';
        break;
      case 'resolved':
        // หยุดไม่ไปต่อ
        break;
    }
  }

  changeAssignee(newAssignee: string) {
  if (!this.issue.assignedTo.includes(newAssignee)) {
    this.issue.assignedTo.push(newAssignee);
  } else {
    this.issue.assignedTo = this.issue.assignedTo.filter(a => a !== newAssignee);
  }
  console.log('Updated assignees:', this.issue.assignedTo);
}


  // set priority ผ่าน prompt
  setPriority() {
    const newPriority = prompt(`Set Priority (${this.priorityLevels.join(', ')})`);
    if (newPriority && this.priorityLevels.includes(newPriority as any)) {
      this.issue.priority = newPriority as 'Low' | 'Medium' | 'High' | 'Critical';
    }
  }




  closeIssue() {
    this.issue.status = 'closed';
  }

}
