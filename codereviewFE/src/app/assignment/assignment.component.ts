import { Component, ViewChild } from '@angular/core';
import { NgForm, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

interface IssueAssignment {
  issueId: string;
  assignedTo: string; // userId
  assignedBy: string; // userId
  priority: 'low' | 'medium' | 'high' | 'critical';
  dueDate?: Date;
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  resolution?: string;
}

@Component({
  selector: 'app-assignment',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './assignment.component.html',
  styleUrl: './assignment.component.css'
})
export class AssignmentComponent {
  @ViewChild('assignmentForm') assignmentForm!: NgForm;

  users = [
    { id: 'u1', name: 'Alice' },
    { id: 'u2', name: 'Bob' },
    { id: 'u3', name: 'Charlie' },
    { id: 'u4', name: 'David' },
    { id: 'u5', name: 'Eva' }
  ];

  assignment: IssueAssignment = {
    issueId: 'ISS-001',
    assignedTo: '',
    assignedBy: 'admin',
    priority: 'medium',
    status: 'open'
  };

  // Mock assignments
  assignments: IssueAssignment[] = [
    {
      issueId: 'ISS-001',
      assignedTo: 'BK',
      assignedBy: 'admin',
      priority: 'low',
      dueDate: new Date("2025-09-11"),
      status: 'open',
      resolution: ''
    },
    {
      issueId: 'ISS-002',
      assignedTo: 'PP',
      assignedBy: 'admin',
      priority: 'medium',
      dueDate: new Date("2025-09-10"),
      status: 'in-progress',
      resolution: ''
    },
    {
      issueId: 'ISS-003',
      assignedTo: 'BTS',
      assignedBy: 'admin',
      priority: 'high',
      dueDate: new Date("2025-09-09"),
      status: 'resolved',
      resolution: 'Fixed in v1.0.2'
    },
    {
      issueId: 'ISS-004',
      assignedTo: 'V',
      assignedBy: 'admin',
      priority: 'critical',
      dueDate: new Date("2025-09-15"),
      status: 'open',
      resolution: ''
    },
    {
      issueId: 'ISS-005',
      assignedTo: 'JK',
      assignedBy: 'admin',
      priority: 'medium',
      dueDate: new Date("2025-09-16"),
      status: 'closed',
      resolution: 'Duplicate issue'
    }
  ];

// ปุ่มย้อนกลับ
goBack(): void {
  window.history.back();
}

  showAssignModal = false;

openAssignModal() {
  this.showAssignModal = true;
}

  closeAssignModal() {
    this.showAssignModal = false;
  }


  onSubmit(form: NgForm) {
    if (form.invalid) {
      return;
    }
    this.assignments.push({ ...this.assignment });
    this.assignment = { issueId: 'ISS-001', assignedTo: '', assignedBy: 'admin', priority: 'medium', status: 'open' };
  
    this.closeAssignModal();
  }

  getPriorityColor(priority: string): string {
    switch(priority) {
      case 'low': return 'success';
      case 'medium': return 'warning';
      case 'high': return 'danger';
      case 'critical': return 'dark';
      default: return 'secondary';
    }
  }

}
