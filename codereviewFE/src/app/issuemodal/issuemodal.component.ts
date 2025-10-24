import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule  , NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { Issue } from '../services/issueservice/issue.service';
import {User, UserService } from '../services/userservice/user.service';
import { AuthService } from '../services/authservice/auth.service';

@Component({
  selector: 'app-issuemodal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './issuemodal.component.html',
  styleUrl: './issuemodal.component.css'
})
export class IssuemodalComponent {
  constructor(private readonly userService : UserService,
    private readonly authService : AuthService,
    private readonly router : Router
  ){}

  showAssign = false;
  showStatus = false;
  isEdit = false;
currentAssigneeId: string | null = null;

  // @Input() showAssign = false;
  // @Input() showStatus = false;
  @Input()  users: User[] = [];
  @Input() issue: Partial<Issue> = {
  issueId: '',
  assignedTo: '',
  dueDate: new Date(),
  status: 'OPEN'
};

  @Output() assignSubmit = new EventEmitter<any>();
  @Output() statusSubmit = new EventEmitter<any>();
  @Output() closed = new EventEmitter<void>();

 

 ngOnInit(): void {
  const userId = this.authService.userId;
    console.log(userId);
    if (!userId) {
      this.router.navigate(['/login']);
      return;
    }
    this.loadUsers();
  }

  loadUsers() {
    this.userService.getAllUser().subscribe({
      next: (data) => {
        console.log(data);
        this.users = data;
      },
      error: (err) => {
        console.error('Error loading users:', err);
      }
    });
  }

   /** เปิด modal สำหรับเพิ่ม assign */
  openAddAssign() {
    this.isEdit = false;
    this.issue = { issueId: '', assignedTo: '', dueDate: new Date(), status: 'OPEN' };
    this.showAssign = true;
  }

  /** เปิด modal สำหรับแก้ไข assign */
  openEditAssign(existingIssue: Partial<Issue>) {
    this.isEdit = true;
    this.issue = { ...existingIssue };
    //this.currentAssigneeId = existingIssue.assignedTo ?? null;
    this.showAssign = true;
  }

  openStatusModal() {
  const nextStatuses = this.statusFlow[this.issue.status!] || [];

  if (nextStatuses.length > 0) {
    this.issue.status = nextStatuses[0]; // ตั้ง default เป็นตัวแรก
  }

  this.showStatus = true;
}


  close() {
  this.showAssign = false;
  this.showStatus = false;
  this.closed.emit();
}


  submitAssign(form: NgForm) {
  if (form.invalid) return; // เช็คก่อน
  this.assignSubmit.emit({ issue: this.issue, isEdit: this.isEdit });
    console.log(this.isEdit ? 'Change assign:' : 'Add assign:', this.issue);
  this.close();
}

 statusFlow: { [key in Issue['status']]: Issue['status'][] } = {
    'OPEN': [],  
    'IN PROGRESS': ['DONE'],
    'DONE': [],
    'REJECT': []
  };

 submitStatus(form: NgForm) {
  if (form.invalid) return;

  const validNextStatuses = this.statusFlow[this.issue.status!] || [];
  if (validNextStatuses.length === 0) {
    console.warn('Cannot update this status');
    return;
  }

  // ส่งข้อมูลกลับ parent component
  this.statusSubmit.emit({ ...this.issue }); 
  this.close();
}



}
