import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router'; 

interface Repository {
  project_id: number;
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
  imports: [CommonModule, FormsModule],
  templateUrl: './repositories.component.html',
  styleUrl: './repositories.component.css'
})
export class RepositoriesComponent {
  filteredRepositories: Repository[] = [];
  summaryStats: { label: string; count: number; icon: string; bg: string }[] = [];
  searchText: string = '';
  activeFilter: string = 'all';
  selectedStatus: string = 'all'; 

  repositories: Repository[] = [
    {
      project_id: 1,
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
      project_id: 2,
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
      project_id: 3,
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
  
  constructor(private readonly router: Router) {}

  goToAddRepository() {
    this.router.navigate(['/addrepository']);
  }

  ngOnInit(): void {
    this.filteredRepositories = this.repositories;
    this.updateSummaryStats();
  }
  searchRepositories(event: Event): void {
    this.searchText = (event.target as HTMLInputElement).value.toLowerCase();
    this.applyFilters();
  }

  filterBy(framework: string): void {
    this.activeFilter = framework;
    this.applyFilters();
  }

  filterByStatus(): void {
    this.applyFilters();
  }

  private applyFilters(): void {
    this.filteredRepositories = this.repositories.filter(repo =>
      // 1. filter ตาม tab (framework)
      (this.activeFilter === 'all' || repo.framework.toLowerCase().includes(this.activeFilter.toLowerCase())) &&
      // 2. filter ตาม status
      (this.selectedStatus === 'all' || repo.status === this.selectedStatus) &&
      // 3. filter ตาม search text
      (this.searchText === '' ||
        repo.name.toLowerCase().includes(this.searchText) ||
        repo.framework.toLowerCase().includes(this.searchText) ||
        repo.language.toLowerCase().includes(this.searchText))
    );

    this.updateSummaryStats();
  }


  countByFramework(framework: string): number {
    return this.filteredRepositories.filter(repo =>
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
    this.router.navigate(['/detailrepo', repo.project_id]);
  }
}