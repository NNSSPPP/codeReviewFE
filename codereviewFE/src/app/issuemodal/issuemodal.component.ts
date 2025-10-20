import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Issue } from '../services/issueservice/issue.service';

@Component({
  selector: 'app-issuemodal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './issuemodal.component.html',
  styleUrl: './issuemodal.component.css'
})
export class IssuemodalComponent {

    @Input() showAssign = false;
  @Input() showStatus = false;
  @Input() users: any[] = [];
   @Input() issue!: Issue;

  @Output() assignSubmit = new EventEmitter<any>();
  @Output() statusSubmit = new EventEmitter<any>();
  @Output() closed = new EventEmitter<void>();

  close() {
    this.closed.emit();
  }

  submitAssign() {
    this.assignSubmit.emit(this.issue);
  }

  submitStatus() {
    this.statusSubmit.emit(this.issue);
  }

}
