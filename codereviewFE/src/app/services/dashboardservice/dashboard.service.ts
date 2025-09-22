// src/app/dashboard.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Dashboard {
  id: string;
  name: string;
  metrics: string;
}

export interface Scan {
  id: string;       
  name: string;
  createdAt: Date;
}

export interface Trends {
  id: string;       
  qualityGate: string;
}

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private http = inject(HttpClient);

  private base = 'http://localhost:8080/api/dashboard';

  /** GET /api/dashboard/{userId} */
  getOverview(userId: string | number): Observable<Dashboard[]> {
    return this.http.get<Dashboard[]>(`${this.base}/${userId}`);
  }

  /** GET /api/dashboard/{userId}/history */
  getHistory(userId: string | number): Observable<Scan[]> {
    return this.http.get<Scan[]>(`${this.base}/${userId}/history`);
  }

  /** GET /api/dashboard/{userId}/trends */
  getTrends(userId: string | number): Observable<Trends[]> {
    return this.http.get<Trends[]>(`${this.base}/${userId}/trends`);
  }
}
