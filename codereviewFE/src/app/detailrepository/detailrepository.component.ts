import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router,RouterModule ,ActivatedRoute } from '@angular/router';
import { Repository, RepositoryService } from '../services/reposervice/repository.service';
import { Scan} from '../services/scanservice/scan.service';
import { Issue} from '../services/issueservice/issue.service';


@Component({
  selector: 'app-detailrepository',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './detailrepository.component.html',
  styleUrl: './detailrepository.component.css'
})
export class DetailrepositoryComponent implements OnInit {

  repoId!: string;
  repo!: Repository;
  scans: Scan[] = [];
  issues: Issue[] = [];
  activeTab: 'overview' | 'bugs' | 'history' | 'metrics' = 'overview';
  loading: boolean = true;

  constructor(
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly repoService: RepositoryService
  ) {}

  ngOnInit(): void {
    this.repoId = this.route.snapshot.paramMap.get('project_id') ?? '';

    if (this.repoId) {
      this.loadRepositoryFull(this.repoId);
    }
  }

  loadRepositoryFull(repoId: string): void {
    this.loading = true;
    this.repoService.getFullRepository(repoId).subscribe(repo => {
      if (repo) {
        this.repo = repo;
        this.scans = repo.scans ?? [];
        this.issues = repo.issues ?? [];
      }
      this.loading = false;
    });
  }

   

  switchTab(tab: 'overview' | 'bugs' | 'history' | 'metrics') {
    this.activeTab = tab;
  }

  editRepo(repo: Repository) {
    this.router.navigate(['/settingrepo', repo.project_id]);
  }

  getStatusClass(status?: string) {
    switch (status) {
      case 'Active': return 'badge bg-success';
      case 'Scanning': return 'badge bg-primary';
      case 'Paused': return 'badge bg-warning text-dark';
      default: return '';
    }
  }
}