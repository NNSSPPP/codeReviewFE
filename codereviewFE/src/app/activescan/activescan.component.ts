import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface CodeReview {
  name: string;
  progress: number;
  elapsed: string;
  remaining: string;
  status: string;
}

interface QueueProject {
  name: string;
  status: string;
  submitted: string;
}

@Component({
  selector: 'app-activescan',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './activescan.component.html',
  styleUrl: './activescan.component.css'
})
export class ActivescanComponent {

  activeReviews: CodeReview[] = [
    { name: 'Mobile-App', progress: 75, elapsed: '3:45', remaining: '1:15', status: 'Analyzing source code...' },
    { name: 'Payment-Service', progress: 45, elapsed: '2:30', remaining: '3:00', status: 'Running SonarQube analysis...' },
    { name: 'Admin-Dashboard', progress: 25, elapsed: '1:15', remaining: '3:45', status: 'Cloning repository...' }
  ];

  queueProjects: QueueProject[] = [
    { name: 'Analytics-Service', status: 'Waiting', submitted: '10:30 AM' },
    { name: 'User-Portal', status: 'Waiting', submitted: '10:45 AM' }
  ];

  queueCount = this.queueProjects.length;

  // Modal control
  showQueueModal = false;

  openQueueModal() { this.showQueueModal = true; }
  closeQueueModal() { this.showQueueModal = false; }

  pauseReview(index: number) {
    console.log('Pause review:', this.activeReviews[index].name);
  }

  stopReview(index: number) {
    console.log('Stop review:', this.activeReviews[index].name);
  }
}
