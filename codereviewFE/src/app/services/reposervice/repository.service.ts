import { Injectable } from '@angular/core';
import { Observable, of, forkJoin } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { ScanService, Scan } from '../scanservice/scan.service';
import { IssueService, Issue } from '../issueservice/issue.service';

export interface Repository {
  project_id: string; // UUID
  user_id: string; // UUID
  name: string;
  repository_url: string;
  project_type ?: 'Angular' | 'Spring Boot';
  branch: string;
  sonar_project_key?: string;
  created_at: Date;
  updated_at: Date;

  scans?: Scan[]
  status?: 'Active' | 'Scanning' | 'Error' | 'Cancelled';
  lastScan?: string;
  scanningProgress?: number;
  qualityGate?: string;
  metrics?: {
    coverage?: number;
    bugs?: number;
    vulnerabilities?: number;
  };

  issues?: Issue[]; 
   
}

@Injectable({
  providedIn: 'root'
})
export class RepositoryService {

  private repositories: Repository[] = [
    {
      project_id: '111',
      user_id: 'u1-uuid-1111',
      name: 'E-Commerce Platform',
      repository_url: 'https://github.com/pccth/ecommerce-frontend.git',
      project_type: 'Angular',
      branch: 'main',
      sonar_project_key: 'SONAR_ECOMMERCE',
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      project_id: '222',
      user_id: 'u2-uuid-2222',
      name: 'Payment API Service',
      repository_url: 'https://github.com/pccth/payment-service.git',
      project_type: 'Spring Boot',
      branch: 'main',
      sonar_project_key: 'SONAR_PAYMENT',
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      project_id: '333',
      user_id: 'u1-uuid-1111',
      name: 'Inventory Management',
      repository_url: 'https://github.com/pccth/inventory-frontend.git',
      project_type: 'Angular',
      branch: 'main',
      sonar_project_key: 'SONAR_INVENTORY',
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      project_id: '444',
      user_id: 'u3-uuid-3333',
      name: 'User Authentication Service',
      repository_url: 'https://github.com/pccth/auth-service.git',
      project_type: 'Spring Boot',
      branch: 'main',
      sonar_project_key: 'SONAR_AUTH',
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      project_id: '555',
      user_id: 'u4-uuid-4444',
      name: 'Marketing Dashboard',
      repository_url: 'https://github.com/pccth/marketing-dashboard.git',
      project_type: 'Angular',
      branch: 'main',
      sonar_project_key: 'SONAR_MARKETING',
      created_at: new Date(),
      updated_at: new Date()
    }
  ];

  constructor(
    private readonly scanService: ScanService,
    private readonly issueService: IssueService
  ) {}

  //map repo and scan
  getRepositoriesWithScans(): Observable<Repository[]> {
    return of(this.repositories).pipe(
      switchMap(repos =>
        forkJoin(
          repos.map(repo =>
            this.scanService.getScansByProjectId(repo.project_id).pipe(
              map(scans => {
                const latestScan = scans.length
                  ? scans[scans.length - 1]
                  : undefined;

                return {
                  ...repo,
                  status: latestScan?.status ?? 'Active',
                  lastScan: latestScan?.completed_at
                    ? new Date(latestScan.completed_at).toLocaleString()
                    : '-',
                  scanningProgress:
                    latestScan?.status === 'Scanning' ? 50 : 100, // mock progress
                  qualityGate: latestScan?.quality_gate,
                  metrics: latestScan?.metrics
                } as Repository;
              })
            )
          )
        )
      )
    );
  }

  //map repo scan and issue
  getFullRepository(project_id: string): Observable<Repository | undefined> {
    const repo = this.getByIdRepo(project_id);
    if (!repo) return of(undefined);
  
    // ดึง scan ทั้งหมด
    return this.scanService.getScansByProjectId(project_id).pipe(
      switchMap(scans => {
        const latestScan = scans.length ? scans[scans.length - 1] : undefined;
  
        // ดึง issue ทั้งหมดของ scan ทั้งหมด
        return forkJoin<Issue[][]>(
          scans.map(scan => this.issueService.getByScanId(scan.scans_id))
        ).pipe(
          map(issuesArray => {
            const allIssues = issuesArray.flat();
            return {
              ...repo,
              scans,
              issues: allIssues,
              status: latestScan?.status ?? 'Active',
              lastScan: latestScan?.completed_at?.toLocaleString() ?? '-',
              scanningProgress: latestScan?.status === 'Scanning' ? 50 : 100,
              qualityGate: latestScan?.quality_gate,
              metrics: latestScan?.metrics
            } as Repository;
          })
        );
        
      })
    );
  }
  


  //GET /api/repositories
  // ดึง repository ทั้งหมด
  getAll(): Repository[] {
    return this.repositories;
  }

  //GET /api/repositories/:id
  // ดึง repository ตาม project_id
  getByIdRepo(project_id: string): Repository | undefined {
    return this.repositories.find(r => r.project_id === project_id)??undefined;
  }

  //POST /api/repositories
  // เพิ่ม repository ใหม่
  addRepo(repository: Repository): void {
    const maxId = this.repositories.length
      ? Math.max(...this.repositories.map(r => +r.project_id))
      : 0;

    repository.project_id = (maxId + 1).toString();
    repository.created_at = new Date();
    repository.updated_at = new Date();
    this.repositories.push(repository);
  }

  //PUT /api/repositories/:id
  // อัพเดตรายการ repository
  updateRepo(project_id: string, updatedRepo: Repository): void {
    const index = this.repositories.findIndex(r => r.project_id === project_id);
    if (index > -1) {
      updatedRepo.updated_at = new Date();
      updatedRepo.created_at = this.repositories[index].created_at; // เก็บ createdAt เดิม
      this.repositories[index] = { ...this.repositories[index], ...updatedRepo };
    }
  }

  //DELETE /api/repositories/:id
  // ลบ repository ตาม project_id
  deleteRepo(project_id: string): void {
    this.repositories = this.repositories.filter(r => r.project_id !== project_id);
  }

  //POST /api/repositories/:id/clone
  //clone repo
  cloneRepo(project_id: string): Observable<Repository> {
    const repo = this.repositories.find(r => r.project_id === project_id)!;
    const newRepo: Repository = {
      ...repo,
      project_id: (Math.max(...this.repositories.map(r => +r.project_id)) + 1).toString(),
      name: repo.name + ' (Clone)',
      created_at: new Date(),
      updated_at: new Date(),
    };
    this.repositories.push(newRepo);
    return of(newRepo);
  }

}