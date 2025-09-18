import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router,RouterModule ,ActivatedRoute } from '@angular/router';
import { Repository, RepositoryService } from '../services/reposervice/repository.service';
import { Scan, ScanService } from '../services/scanservice/scan.service';
import { Issue, IssueService } from '../services/issueservice/issue.service';


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

  constructor(
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly repoService: RepositoryService,
    private readonly scanService: ScanService,
    private readonly issueService: IssueService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('project_id') ?? '';
    this.repoId = id;

    if (this.repoId) {
      this.loadRepository(this.repoId);
      this.loadScans(this.repoId);
    }
  }

  loadRepository(repoId: string): void {
    const repo = this.repoService.getByIdRepo(repoId);
    if (repo) {
      this.repo = repo;
    }
  }

  loadScans(repoId: string): void {
    this.scans = this.scanService.getByProjectId(repoId);
  
    if (this.repo && this.scans.length > 0) {
      const latestScan = this.scans[0];
      this.repo.status = latestScan.status;
      this.repo.lastScan = latestScan.completed_at?.toISOString() ?? '';
      this.repo.qualityGate = latestScan.quality_gate;
      this.repo.metrics = latestScan.metrics;
  
      // โหลด issues ของ scan ล่าสุด แบบ async
      this.issues = this.issueService.getByScanId(latestScan.scans_id);
    }
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