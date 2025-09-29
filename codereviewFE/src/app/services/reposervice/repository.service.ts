import { Injectable, inject } from '@angular/core';
import { Observable, forkJoin, switchMap, map, of } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ScanService, Scan } from '../scanservice/scan.service';
import { IssueService, Issue } from '../issueservice/issue.service';

export interface Repository {
  project_id: string;   // UUID (string)
  user_id: string;      // UUID (string)
  name: string;
  repository_url: string;
  project_type?: 'Angular' | 'Spring Boot';
  branch: string;
  sonar_project_key?: string;
  created_at: Date;   // <-- ใช้ string (ISO)
  updated_at: Date;   // <-- ใช้ string (ISO)

  scans?: Scan[];
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

@Injectable({ providedIn: 'root' })
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

  /** POST /api/repositories */
  addRepo(repo: Partial<Repository>): Observable<Repository> {
    const newRepo: Repository = {
      ...repo,
      project_id: (Math.max(...this.repositories.map(r => +r.project_id)) + 1).toString(),
      created_at: new Date(),
      updated_at: new Date()
    } as Repository;

    this.repositories.push(newRepo);
    return of(newRepo);
  }

  /** GET /api/repositories */
  getAllRepo(): Observable<Repository[]> {
    return of(this.repositories);
  }

  /** GET /api/repositories/{id} */
  getByIdRepo(id: string): Observable<Repository | undefined> {
    const repo = this.repositories.find(r => r.project_id === id);
    return of(repo);
  }

  /** PUT /api/repositories/{id} */
  updateRepo(id: string, repo: Partial<Repository>): Observable<Repository | undefined> {
    const index = this.repositories.findIndex(r => r.project_id === id);
    if (index > -1) {
      this.repositories[index] = {
        ...this.repositories[index],
        ...repo,
        updated_at: new Date()
      };
      return of(this.repositories[index]);
    }
    return of(undefined);
  }

  /** DELETE /api/repositories/{id} */
  deleteRepo(id: string): Observable<void> {
    this.repositories = this.repositories.filter(r => r.project_id !== id);
    return of(void 0);
  }

  /** POST /api/repositories/clone?projectId=UUID */
  clone(projectId: string): Observable<string> {
    const repo = this.repositories.find(r => r.project_id === projectId);
    if (!repo) return of('Not found');

    const newRepo: Repository = {
      ...repo,
      project_id: (Math.max(...this.repositories.map(r => +r.project_id)) + 1).toString(),
      name: repo.name + ' (Clone)',
      created_at: new Date(),
      updated_at: new Date()
    };
    this.repositories.push(newRepo);
    return of(`Cloned repo: ${newRepo.project_id}`);
  }

  // private http = inject(HttpClient);
  // private scanService = inject(ScanService);
  // private issueService = inject(IssueService);

  // private base = 'http://localhost:8080/api/repositories';



  // /** POST /api/repositories */
  // addRepo(repo: Partial<Repository>): Observable<Repository> {
  //   return this.http.post<Repository>(this.base, repo);
  // }

  // /** GET /api/repositories */
  // getAllRepo(): Observable<Repository[]> {
  //   return this.http.get<Repository[]>(this.base);
  // }

  // /** GET /api/repositories/{id} */
  // getByIdRepo(id: string): Observable<Repository> {
  //   return this.http.get<Repository>(`${this.base}/${id}`);
  // }

  // /** PUT /api/repositories/{id} */
  // updateRepo(id: string, repo: Partial<Repository>): Observable<Repository> {
  //   return this.http.put<Repository>(`${this.base}/${id}`, repo);
  // }

  // /** DELETE /api/repositories/{id} */
  // deleteRepo(id: string): Observable<void> {
  //   return this.http.delete<void>(`${this.base}/${id}`);
  // }

  // /** POST /api/repositories/clone?projectId=UUID  (backend คืน text) */
  // clone(projectId: string): Observable<string> {
  //   const params = new HttpParams().set('projectId', projectId);
  //   return this.http.post(`${this.base}/clone`, null, {
  //     params,
  //     responseType: 'text',
  //   });
  // }

  /** ---------------- Enrich ด้วย Scan/Issue ---------------- */

  /** ดึง repo ทั้งหมด + เติมสรุป scan ล่าสุด */
  getRepositoriesWithScans(): Observable<Repository[]> {
    return this.getAllRepo().pipe(
      switchMap((repos) => {
        if (!repos.length) return of<Repository[]>([]);
        return forkJoin(
          repos.map((repo) =>
            this.scanService.getScansByProjectId(repo.project_id).pipe(
              map((scans) => {
                const latest = scans.length ? scans[scans.length - 1] : undefined;
                return {
                  ...repo,
                  status: latest ? latest.status : 'Active',
                  lastScan: latest?.completed_at
                    ? new Date(latest.completed_at).toLocaleString()
                    : '-',
                  scanningProgress: latest?.status === 'Scanning' ? 50 : 100,
                  qualityGate: latest?.quality_gate,
                  metrics: latest?.metrics,
                } as Repository;
              })
            )
          )
        );
      })
    );
  }

  // /** ดึง repo + scans + issues (ทุก scan) */
  // getFullRepository(project_id: string): Observable<Repository | undefined> {
  //   return this.getByIdRepo(project_id).pipe(
  //     switchMap((repo) => {
  //       if (!repo) return of<Repository | undefined>(undefined);

  //       return this.scanService.getScansByProjectId(project_id).pipe(
  //         switchMap((scans) => {
  //           const latest = scans.length ? scans[scans.length - 1] : undefined;

  //           if (!scans.length) {
  //             return of({
  //               ...repo,
  //               scans,
  //               issues: [],
  //               status: latest?.status === 'Scanning' ? 'Scanning' : 'Active',
  //               lastScan: latest?.completed_at
  //                 ? new Date(latest.completed_at).toLocaleString()
  //                 : '-',
  //               scanningProgress: latest?.status === 'Scanning' ? 50 : 100,
  //               qualityGate: latest?.quality_gate,
  //               metrics: latest?.metrics,
  //             } as Repository);
  //           }

  //           return forkJoin(scans.map((s) => this.issueService.getById(s.scans_id))).pipe(
  //             map((issueGroups) => {
  //               const issues = issueGroups.flat();
  //               return {
  //                 ...repo,
  //                 scans,
  //                 issues,
  //                 status: latest?.status === 'Scanning' ? 'Scanning' : 'Active',
  //                 lastScan: latest?.completed_at
  //                   ? new Date(latest.completed_at).toLocaleString()
  //                   : '-',
  //                 scanningProgress: latest?.status === 'Scanning' ? 50 : 100,
  //                 qualityGate: latest?.quality_gate,
  //                 metrics: latest?.metrics,
  //               } as Repository;
  //             })
  //           );
  //         })
  //       );
  //     })
  //   );
  // }

   /** ดึง repo + scans + issues (ทุก scan) */
   getFullRepository(project_id: string): Observable<Repository | undefined> {
    return this.getByIdRepo(project_id).pipe(
      switchMap((repo) => {
        if (!repo) return of<Repository | undefined>(undefined);

        return this.scanService.getScansByProjectId(project_id).pipe(
          switchMap((scans) => {
            const latest = scans.length ? scans[scans.length - 1] : undefined;

            if (!scans.length) {
              return of({
                ...repo,
                scans,
                issues: [],
                status: latest?.status === 'Scanning' ? 'Scanning' : 'Active',
                lastScan: latest?.completed_at
                  ? new Date(latest.completed_at).toLocaleString()
                  : '-',
                scanningProgress: latest?.status === 'Scanning' ? 50 : 100,
                qualityGate: latest?.quality_gate,
                metrics: latest?.metrics,
              } as Repository);
            }

            return forkJoin(scans.map((s) => this.issueService.getByScanId(s.scans_id))).pipe(
              map((issueGroups) => {
                const issues = issueGroups.flat();
                return {
                  ...repo,
                  scans,
                  issues,
                  status: latest ? latest.status : 'Active',
                  lastScan: latest?.completed_at
                    ? new Date(latest.completed_at).toLocaleString()
                    : '-',
                  scanningProgress: latest?.status === 'Scanning' ? 50 : 100,
                  qualityGate: latest?.quality_gate,
                  metrics: latest?.metrics,
                } as Repository;
              })
            );
          })
        );
      })
    );
  }
}
