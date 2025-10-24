import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import{IssuemodalComponent} from '../issuemodal/issuemodal.component';
import { IssueService, Issue as ApiIssue, AddCommentPayload } from '../services/issueservice/issue.service';
import { filter, map } from 'rxjs/operators';
import { AuthService } from '../services/authservice/auth.service';
import { Repository, RepositoryService } from '../services/reposervice/repository.service';

interface Attachment { filename: string; url: string; }
interface IssueComment {
  issueId: string; userId: string; comment: string; timestamp: Date | string;
  attachments?: Attachment[]; mentions?: string[];
}
interface Issue {
  id: string; 
  type: string; 
  title: string; 
  severity: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'open' | 'in-progress' | 'done' | 'reject';
  project: string; file: string; line: number; created: string;
  assignedTo?: string; dueDate: string; description: string;
  vulnerableCode: string; recommendedFix: string; comments: IssueComment[];
}
const isUUID = (s: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(s);

@Component({
  selector: 'app-issuedetail',
  standalone: true,
  imports: [CommonModule, FormsModule,IssuemodalComponent],
  templateUrl: './issuedetail.component.html',
  styleUrl: './issuedetail.component.css',
})
export class IssuedetailComponent implements OnInit {
  @ViewChild(IssuemodalComponent) assignModal!: IssuemodalComponent;
  trackByComment = (_: number, c: any) => c?.id || c?.timestamp || _;

  // FE options (เดิม)
  priorityLevels: Array<'Low' | 'Medium' | 'High' | 'Critical'> = ['Low', 'Medium', 'High', 'Critical'];



  loading = true;
  error: string | null = null;
  issue!: Issue;
  private readonly auth = inject(AuthService);
  /** ใช้ id ของผู้ใช้ปัจจุบันจาก AuthService */
  currentUserId = this.auth.userId ?? '';

  /** (optional) ชื่อผู้ใช้สำหรับแสดงผล */
  currentUserName = this.auth.username;

  newComment = { mention: '', comment: '' };

  constructor(
    private readonly route: ActivatedRoute,
    private readonly issueApi: IssueService,
    private readonly repositoryService: RepositoryService
  ) { }

  ngOnInit(): void {

    this.route.paramMap.pipe(map(pm => pm.get('issuesId') ?? ''),
      filter(id => {
        if (!id) { this.error = 'Issue ID not found'; return false; }
        if (!isUUID(id)) { this.error = 'Invalid Issue ID'; return false; } return true;
      }))
      .subscribe(id => {
        this.loading = true; this.issueApi.getById(id).pipe(map(raw => this.toIssue(raw)))
          .subscribe({
            next: issue => { this.issue = issue; this.issue.assignedTo ||= ''; this.loading = false; },
            error: err => { console.error('getById error', err); this.error = 'โหลดข้อมูลไม่สำเร็จ'; this.loading = false; }
          });
      });
  }



  /* ===================== Mapper (BE -> FE) ===================== */
  private toIssue(r: ApiIssue): Issue {
    console.log('Raw API issue:', r);
    return {
      id: (r as any).id ?? r.issueId ?? '',
      type: (r as any).type ?? 'Issue',
      title: (r as any).title ?? (r as any).message ?? '(no title)',
      severity: r.severity ?? 'Major',
      // BE ไม่มี priority ชัดเจน → เดาเป็น Medium (ปรับตามข้อมูลจริงได้)
      priority: 'Medium',
      status: this.mapStatusBeToFe(r.status),
      project: r.projectName ?? '',
      file: r.component ?? '',
      line: 0, // ถ้า BE มี lineNumber ให้แทนด้วย Number(r.lineNumber)
      created: (r.createdAt as any) ?? '',
      assignedTo: r.assignedTo ?? '',
      dueDate: '', // ถ้า BE มี dueDate ให้ map มา
      description: (r as any).description ?? '',
      vulnerableCode: (r as any).vulnerableCode ?? '',
      recommendedFix: (r as any).recommendedFix ?? '',
      comments: [] // คุณอาจจะโหลดผ่าน /comments แยกก็ได้
    };
  }

private mapStatusBeToFe(s: ApiIssue['status'] | undefined): Issue['status'] {
  if (!s) return 'open';
  const clean = s.toString().trim().toUpperCase();
  switch (clean) {
    case 'OPEN': return 'open';
    case 'IN PROGRESS': return 'in-progress';
    case 'DONE': return 'done';
    case 'REJECT': return 'reject';
    default: return 'open';
  }
}

  private mapStatusFeToBe(s: Issue['status']): ApiIssue['status'] {
    switch (s) {
      case 'open': return 'OPEN';
      case 'in-progress': return 'IN PROGRESS';
      case 'done': return 'DONE';
      case 'reject': return 'REJECT';
    }
  }

  /* ===================== UI actions (เดิม) ===================== */

  goBack() { window.history.back(); }

  showAssignModal = false;
showStatusModal = false;

 openAssignModal() {
    const isEdit = !!(this.issue.assignedTo && this.issue.assignedTo.length > 0);
    if (isEdit) {
      this.assignModal.openEditAssign({
        issueId: this.issue.id,
        assignedTo: this.issue.assignedTo,
        dueDate: this.issue.dueDate ? new Date(this.issue.dueDate) : new Date()
      });
    } else {
      this.assignModal.openAddAssign();
    }
  }

  openStatusModal() { this.assignModal.openStatusModal(); }
  
closeModal() {
  this.showAssignModal = false;
  this.showStatusModal = false;
}

 handleAssignSubmit(event: { issue: Partial<Issue>, isEdit: boolean }) {
    const updated = event.issue;
    if (updated.assignedTo) this.issue.assignedTo = updated.assignedTo;
    if (updated.dueDate) this.issue.dueDate = updated.dueDate;
    this.assignModal.close();
  }




 handleStatusSubmit(updated: Partial<Issue>) {
  if (updated.status) {
    const prev = this.issue.status;
    this.issue.status = updated.status; // optimistic update

    // this.issueApi.updateStatus(this.issue.id, updated.status as any).subscribe({
    //   next: () => console.log('Status updated to', updated.status),
    //   error: err => {
    //     console.error('Failed to update status', err);
    //     this.issue.status = prev; // rollback
    //   }
    // });
  }
  this.closeModal();
}


  // postComment() {
  //   const text = this.newComment.comment.trim();
  //   if (!text) return;
  //   const user = this.auth.username ?? this.currentUserId; // อะไรก็ได้ที่เป็น string
  //   if (!user) {
  //     this.error = 'กรุณาเข้าสู่ระบบก่อนแสดงความคิดเห็น';
  //     return;
  //   }

  //   const local: IssueComment = {
  //     issueId: this.issue.id,
  //     userId: user,             // <- ตอนนี้เป็น string แน่นอน
  //     comment: text,
  //     timestamp: new Date(),
  //     attachments: [],
  //     mentions: this.newComment.mention ? [this.newComment.mention] : []
  //   };
  //   // ...
  // }


  
  setPriority() {
    const p = prompt(`Set Priority (${this.priorityLevels.join(', ')})`);
    if (p && this.priorityLevels.includes(p as any)) {
      this.issue.priority = p as Issue['priority'];
      // TODO: ถ้าต้องบันทึกจริง เพิ่ม endpoint /priority ใน service
    }
  }

  rejectIssue() {
  // toggle: ถ้าเป็น reject แล้ว → กลับไป open
  const next: Issue['status'] = this.issue.status === 'reject' ? 'open' : 'reject';
  const prev = this.issue.status;

  // เปลี่ยนใน FE ก่อน (optimistic update)
  this.issue.status = next;

  // เรียก API ไปอัปเดตสถานะใน backend
  // this.issueApi.updateStatus(this.issue.id, this.mapStatusFeToBe(next)).subscribe({
  //   next: () => console.log(`Status changed to ${next}`),
  //   error: err => {
  //     console.error('rejectIssue error', err);
  //     this.issue.status = prev; // rollback ถ้า error
  //   }
  // });
}



}
