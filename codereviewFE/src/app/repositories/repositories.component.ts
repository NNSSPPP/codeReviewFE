import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router'; 

interface Repository {
  id: number;
  name: string;
  framework: string;
  language: string;
  repoUrl: string;
  branch: string;
  status: 'Active' | 'Scanning' | 'Paused';
  lastScan?: string;
  scanningProgress?: number;
  qualityGate?: string;
  bugs: number;
  vulnerabilities: number;
  coverage: number;
  previousGrade?: string;
}

@Component({
  selector: 'app-repositories',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './repositories.component.html',
  styleUrl: './repositories.component.css'
})
export class RepositoriesComponent {
  repositories: Repository[] = [];
  filteredRepositories: Repository[] = [];
  summaryStats: { label: string; count: number; icon: string; bg: string }[] = [];
  activeFilter: string = 'all'; // ใช้ track tab ที่ active

  constructor(private readonly router: Router) {}

  goToAddRepository() {
    this.router.navigate(['/addrepository']);
  }
  
  ngOnInit(): void {
    this.repositories = [
      {
        id: 1,
        name: 'E-Commerce Platform',
        framework: 'Angular 18',
        language: 'TypeScript',
        repoUrl: 'https://github.com/pccth/ecommerce-frontend.git',
        branch: 'main',
        status: 'Active',
        lastScan: '2 hours ago',
        qualityGate: 'Grade A',
        bugs: 12,
        vulnerabilities: 3,
        coverage: 85
      },
      {
        id: 2,
        name: 'Payment API Service',
        framework: 'Spring Boot 3.2',
        language: 'Java 17',
        repoUrl: 'https://github.com/pccth/payment-service.git',
        branch: 'develop',
        status: 'Scanning',
        scanningProgress: 45,
        previousGrade: 'Grade B',
        bugs: 8,
        vulnerabilities: 3,
        coverage: 72
      },
      {
        id: 3,
        name: 'User Management Service',
        framework: 'Angular 18',
        language: 'TypeScript',
        repoUrl: 'https://github.com/pccth/user-service.git',
        branch: 'main',
        status: 'Paused',
        bugs: 5,
        vulnerabilities: 2,
        coverage: 68,
        previousGrade: 'Grade C'
      }
    ];

    this.filteredRepositories = this.repositories;
    this.updateSummaryStats();
  }

  searchRepositories(event: Event): void {
    const input = (event.target as HTMLInputElement).value.toLowerCase();
    this.filteredRepositories = this.repositories.filter(repo =>
      repo.name.toLowerCase().includes(input) ||
      repo.framework.toLowerCase().includes(input) ||
      repo.language.toLowerCase().includes(input)
    );
    this.updateSummaryStats();
  }

  filterBy(framework: string): void {
    this.activeFilter = framework;
    if (framework === 'all') {
      this.filteredRepositories = this.repositories;
    } else {
      this.filteredRepositories = this.repositories.filter(repo =>
        repo.framework.toLowerCase().includes(framework.toLowerCase())
      );
    }
    this.updateSummaryStats();
  }

  countByFramework(framework: string): number {
    return this.repositories.filter(repo =>
      repo.framework.toLowerCase().includes(framework.toLowerCase())
    ).length;
  }

  updateSummaryStats(): void {
    this.summaryStats = [
      { label: 'Total Repositories', count: this.filteredRepositories.length, icon: 'bi bi-database', bg: 'bg-primary' },
      { label: 'Active', count: this.filteredRepositories.filter(r => r.status === 'Active').length, icon: 'bi bi-check-circle-fill', bg: 'bg-success' },
      { label: 'Scanning', count: this.filteredRepositories.filter(r => r.status === 'Scanning').length, icon: 'bi bi-arrow-repeat', bg: 'bg-info' },
      { label: 'Paused', count: this.filteredRepositories.filter(r => r.status === 'Paused').length, icon: 'bi bi-pause-circle-fill', bg: 'bg-warning' }
    ];
  }

  viewRepo(repo: Repository): void {
    this.router.navigate(['/detailrepo', repo.id]);
  }
}
