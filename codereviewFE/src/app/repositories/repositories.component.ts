import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Repository, RepositoryService } from '../services/reposervice/repository.service';

@Component({
  selector: 'app-repositories',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './repositories.component.html',
  styleUrl: './repositories.component.css'
})
export class RepositoriesComponent implements OnInit {
  repositories: Repository[] = [];
  filteredRepositories: Repository[] = [];
  summaryStats: { label: string; count: number; icon: string; bg: string }[] = [];
  searchText: string = '';
  activeFilter: string = 'all';
  selectedStatus: string = 'all';

  constructor(
    private readonly router: Router,
    private readonly repoService: RepositoryService,
  ) { }

  ngOnInit(): void {
    this.repoService.getRepositoriesWithScans().subscribe(repos => {
      this.repositories = repos;
      this.filteredRepositories = [...repos];
      this.updateSummaryStats();
    });
  }

  
  

  goToAddRepository() {
    this.router.navigate(['/addrepository']);
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
      (this.activeFilter === 'all' || repo.project_type?.toLowerCase().includes(this.activeFilter.toLowerCase())) &&
      // 2. filter ตาม status
      // (this.selectedStatus === 'all' || repo.status === this.selectedStatus) &&
      // 3. filter ตาม search text
      (this.searchText === '' ||
        repo.name.toLowerCase().includes(this.searchText) ||
        repo.project_type?.toLowerCase().includes(this.searchText))
    );

    this.updateSummaryStats();
  }


  countByFramework(framework: string): number {
    return this.filteredRepositories.filter(repo =>
      repo.project_type?.toLowerCase().includes(framework.toLowerCase())
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

  runScan(repo: Repository) {
    console.log('Run scan for', repo.name);
    repo.status = 'Scanning';
    // เรียก service API เพื่อเริ่ม scan
  }

  stopScan(repo: Repository) {
    console.log('Stop scan for', repo.name);
    repo.status = 'Paused';
    // เรียก service API เพื่อหยุด scan
  }

  resumeScan(repo: Repository) {
    console.log('Resume scan for', repo.name);
    repo.status = 'Scanning';
    // เรียก service API เพื่อเริ่ม scan ต่อ
  }

  editRepo(repo: Repository) {
    this.router.navigate(['/settingrepo', repo.project_id]);
  }


  viewRepo(repo: Repository): void {
    this.router.navigate(['/detailrepo', repo.project_id]);
  }
}