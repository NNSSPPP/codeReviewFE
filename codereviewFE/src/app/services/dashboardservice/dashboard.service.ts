// src/app/dashboard.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from '../authservice/auth.service'

export interface Dashboard {
  id: string;
  name: string;
  metrics: {
    bugs: number;
    vulnerabilities: number;
    codeSmells: number;
    coverage: number;   
    duplications: number; 
  };

}

export interface History {
  projectId: string;
  projectName: string;
  projectType: string;
  createdAt: string;
}

export interface Trends {
  id: string;
  qualityGate: string;
}

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);
  private readonly base = environment.apiUrl + '/dashboard';

  private authOpts() {
    const token = this.auth.token;
     console.log('DashboardService: current token ->', token);
    return token
      ? { headers: new HttpHeaders({ Authorization: `Bearer ${token}` }) }
      : {};
  }
  getOverview(userId: string | number): Observable<Dashboard[]> {
    return this.http.get<Dashboard[]>(`${this.base}/${userId}`);
  }

  /** GET /api/dashboard/{userId}/history */ 
  getHistory(userId: string | number): Observable<History[]> {
    return this.http.get<History[]>(`${this.base}/${userId}/history`);
  }

  /** GET /api/dashboard/{userId}/trends */
  getTrends(userId: string | number): Observable<Trends[]> {
    return this.http.get<Trends[]>(`${this.base}/${userId}/trends`);
  }
}


