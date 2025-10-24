import { Component, OnInit, ViewChild } from '@angular/core';
import { NgForm, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import{IssuemodalComponent} from '../issuemodal/issuemodal.component';
import { AssignHistory,AssignhistoryService } from '../services/assignservice/assignhistory.service';
import { AuthService } from '../services/authservice/auth.service';
import { Issue ,IssueService } from '../services/issueservice/issue.service';


@Component({
  selector: 'app-assignment',
  standalone: true,
  imports: [CommonModule, FormsModule,IssuemodalComponent],
  templateUrl: './assignment.component.html',
  styleUrl: './assignment.component.css'
})
export class AssignmentComponent implements OnInit  {
  @ViewChild(IssuemodalComponent) assignModal!: IssuemodalComponent;


  // ปุ่มย้อนกลับ
goBack(): void {
  window.history.back();
}

 Assign: AssignHistory[] = [];

  constructor(
    private readonly router: Router,
    private readonly assignService: AssignhistoryService,
    private readonly auth: AuthService,
    private readonly issue: IssueService
      ) {}

  ngOnInit() {
    const userId = this.auth.userId;
    if (!userId) { this.router.navigate(['/login']); return; }
    this.loadAssignments();
  }

  // ฟังก์ชันโหลดข้อมูล assignment ทั้งหมด
loadAssignments() {
  const userId = this.auth.userId;
  if (!userId) return;

  this.assignService.getAllAssign(userId).subscribe({
    next: (data: any[]) => {
      // แปลง field และ date ให้ตรงกับ interface
      this.Assign = data.map(item => ({
        assignedTo: item.assigned_to || item.assignedTo,
        assignedToName : item.assigned_to_name || item.assignedToName,
        issueId: item.issue_id || item.issueId,
        severity: item.severity,
        message: item.message,
        status: item.status,
         dueDate: item.due_date || item.dueDate ? new Date(item.due_date || item.dueDate) : null,
        annotation: item.annotation
      }));
    },
    error: (err) => console.error('Error fetching assignments:', err)
  });
}

  
showAssignModal = false;

openAssignModal() { this.assignModal.openAddAssign(); }
closeModal() {
  this.assignModal.close();
}

 handleAssignSubmit(updated: Issue) {
  console.log('Assigned issue:', updated);

  this.assignService.addassign(updated).subscribe({
    next: (res) => {
      console.log('Assignment added successfully:', res);
      this.closeModal();
      this.loadAssignments(); // โหลดข้อมูลใหม่หลังบันทึก
    },
    error: (err) => {
      console.error('Error adding assignment:', err);
    }
  });
}



  getPriorityColor(severity: string): string {
    switch (severity.trim()) {  // trim() กัน space เกิน
    case 'MINOR':
      return '#FFEB3B'; // เหลืองอ่อน
    case 'MAJOR':
      return '#FFC107'; // ส้ม
    case 'CRITICAL':
      return '#FF5722'; // แดงส้ม
    case 'BLOCKER':
      return '#D32F2F'; // แดงเข้ม
    default:
      return '#9E9E9E'; // เทา
  }
  }

}
