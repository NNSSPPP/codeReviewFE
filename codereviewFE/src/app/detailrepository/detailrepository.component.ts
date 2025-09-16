import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule ,ActivatedRoute, Router } from '@angular/router';

interface Repository {
  project_id: number;
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
  codeSmells?: number;
  duplicatedLines?: number;
  technicalDebt?: number;
}

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




@Component({
  selector: 'app-detailrepository',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './detailrepository.component.html',
  styleUrl: './detailrepository.component.css'
})
export class DetailrepositoryComponent {

  repoId!: number;
  repo!: Repository;

  activeTab: 'overview' | 'bugs' | 'history' | 'metrics' = 'overview';

  constructor(
    private router: Router,
    private readonly route: ActivatedRoute) {}

  ngOnInit(): void {
    this.repoId = Number(this.route.snapshot.paramMap.get('project_id'));
    this.loadRepository(this.repoId);
  }

  // ตัวอย่าง repository data
  allRepos: Repository[] = [
    {
      project_id: 1,
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
      codeSmells: 12,
      duplicatedLines: 30,
      technicalDebt: 5,
      bugList: [
        { title: 'NullPointerException', severity: 'High', status: 'Open', assignedTo: 'John' },
        { title: 'UI Bug', severity: 'Low', status: 'Open', assignedTo: 'Alice' }
      ],
      scanHistory: [
        { date: '2025-08-25', status: 'Passed', bugs: 5, vulnerabilities: 1, coverage: 80 }
      ]
    },
    {
      project_id: 2,
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
      codeSmells: 8,
      duplicatedLines: 15,
      technicalDebt: 3,
      bugList: [
        { title: 'Memory Leak', severity: 'Medium', status: 'Closed', assignedTo: 'Bob' }
      ],
      scanHistory: [
        { date: '2025-08-24', status: 'Warning', bugs: 7, vulnerabilities: 2, coverage: 78 }
      ]
    }
  ];

  loadRepository(id: number) {
    const found = this.allRepos.find(r => r.project_id === id);
    if (found) {
      this.repo = found;
    } else {
      console.error('Repository not found!');
      this.repo = this.allRepos[0];
    }
  }

  switchTab(tab: 'overview' | 'bugs' | 'history' | 'metrics') {
    this.activeTab = tab;
  }

  editRepo(repo: Repository) {
    this.router.navigate(['/settingrepo', repo.project_id]);
  }

  getStatusClass(status: string) {
    switch (status) {
      case 'Active': return 'badge bg-success';
      case 'Scanning': return 'badge bg-primary';
      case 'Paused': return 'badge bg-warning text-dark';
      default: return '';
    }
  }
}