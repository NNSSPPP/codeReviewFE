// src/app/repositoryservice/repository.service.ts
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
  created_at: string;   // <-- ใช้ string (ISO)
  updated_at: string;   // <-- ใช้ string (ISO)

  // enriched fields (เสริมจากบริการอื่น)
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
  private http = inject(HttpClient);
  private scanService = inject(ScanService);
  private issueService = inject(IssueService);

  private base = 'http://localhost:8080/api/repositories';


  /** POST /api/repositories */
  create(repo: Partial<Repository>): Observable<Repository> {
    return this.http.post<Repository>(this.base, repo);
  }

  /** GET /api/repositories */
  getAll(): Observable<Repository[]> {
    return this.http.get<Repository[]>(this.base);
  }

  /** GET /api/repositories/{id} */
  getById(id: string): Observable<Repository> {
    return this.http.get<Repository>(`${this.base}/${id}`);
  }

  /** PUT /api/repositories/{id} */
  update(id: string, repo: Partial<Repository>): Observable<Repository> {
    return this.http.put<Repository>(`${this.base}/${id}`, repo);
  }

  /** DELETE /api/repositories/{id} */
  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }

  /** POST /api/repositories/clone?projectId=UUID  (backend คืน text) */
  clone(projectId: string): Observable<string> {
    const params = new HttpParams().set('projectId', projectId);
    return this.http.post(`${this.base}/clone`, null, {
      params,
      responseType: 'text',
    });
  }

  /** ---------------- Enrich ด้วย Scan/Issue ---------------- */

  /** ดึง repo ทั้งหมด + เติมสรุป scan ล่าสุด */
  getRepositoriesWithScans(): Observable<Repository[]> {
    return this.getAll().pipe(
      switchMap((repos) => {
        if (!repos.length) return of<Repository[]>([]);
        return forkJoin(
          repos.map((repo) =>
            this.scanService.getScansByProjectId(repo.project_id).pipe(
              map((scans) => {
                const latest = scans.length ? scans[scans.length - 1] : undefined;
                return {
                  ...repo,
                  status: latest?.status === 'Scanning' ? 'Scanning' : 'Active',
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

  /** ดึง repo + scans + issues (ทุก scan) */
  getFullRepository(project_id: string): Observable<Repository | undefined> {
    return this.getById(project_id).pipe(
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

            return forkJoin(scans.map((s) => this.issueService.getById(s.scans_id))).pipe(
              map((issueGroups) => {
                const issues = issueGroups.flat();
                return {
                  ...repo,
                  scans,
                  issues,
                  status: latest?.status === 'Scanning' ? 'Scanning' : 'Active',
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
