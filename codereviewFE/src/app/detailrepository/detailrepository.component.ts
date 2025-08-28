import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { RouterModule } from '@angular/router'; 

interface Bug {
  title: string;
  severity: string;
  status: string;
  assignedTo: string;
}

interface ScanHistory {
  date: string;
  status: string;
  bugs: number;
  vulnerabilities: number;
  coverage: number;
}

interface Repository {
  id: number;
  name: string;
  framework: string;
  language: string;
  branch: string;
  repoUrl: string;
  status: 'Active' | 'Scanning' | 'Paused';
  lastScan?: string;
  scanningProgress?: number;
  qualityGate?: string;
  previousGrade?: string;
  bugs: number;
  vulnerabilities: number;
  coverage: number;
  bugList: Bug[];
  scanHistory: ScanHistory[];
}


@Component({
  selector: 'app-detailrepository',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './detailrepository.component.html',
  styleUrl: './detailrepository.component.css'
})
export class DetailrepositoryComponent {

  constructor(private route: ActivatedRoute) { }

  ngOnInit(): void {
    // ดึง id จาก URL
    this.repoId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadRepository(this.repoId);
  }

  repoId!: number;
  repo!: Repository;

  // ตัวอย่าง repository data
  allRepos: Repository[] = [
    {
      id: 1,
      name: 'E-Commerce Platform',
      framework: 'Angular',
      language: 'TypeScript',
      branch: 'main',
      repoUrl: 'https://github.com/pccth/ecommerce-frontend.git',
      status: 'Active',
      lastScan: '2025-08-27 14:00',
      scanningProgress: 65,
      qualityGate: 'Passed',
      previousGrade: 'B',
      bugs: 12,
      vulnerabilities: 3,
      coverage: 85,
      bugList: [
        { title: 'NullPointerException', severity: 'High', status: 'Open', assignedTo: 'John' },
        { title: 'UI Bug', severity: 'Low', status: 'Open', assignedTo: 'Alice' }
      ],
      scanHistory: [
        { date: '2025-08-25', status: 'Passed', bugs: 5, vulnerabilities: 1, coverage: 80 }
      ]
    },
    {
      id: 2,
      name: 'Payment API Service',
      framework: 'Spring Boot',
      language: 'Java',
      branch: 'develop',
      repoUrl: 'https://github.com/pccth/payment-service.git',
      status: 'Scanning',
      lastScan: '2025-08-26 10:00',
      scanningProgress: 0,
      qualityGate: 'Warning',
      previousGrade: 'C',
      bugs: 8,
      vulnerabilities: 3,
      coverage: 78,
      bugList: [
        { title: 'Memory Leak', severity: 'Medium', status: 'Closed', assignedTo: 'Bob' }
      ],
      scanHistory: [
        { date: '2025-08-24', status: 'Warning', bugs: 7, vulnerabilities: 2, coverage: 78 }
      ]
    }
  ];

  activeTab: string = 'overview';

  loadRepository(id: number) {
    // ดึง repo ตาม id
    this.repo = this.allRepos.find(r => r.id === id)!;
  }

  switchTab(tab: string) {
    this.activeTab = tab;
  }

  getStatusClass(status: string) {
    return {
      'bg-success': status === 'Active',
      'bg-info': status === 'Scanning',
      'bg-warning': status === 'Paused'
    };
  }

}
