import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { ScanService } from '../scanservice/scan.service';

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

  // fields เพิ่มเติมเพื่อ map scan info
  status?: 'Active' | 'Scanning' | 'Paused' | 'Error';
  lastScan?: string;
  scanningProgress?: number;
  qualityGate?: string;
  metrics?: { coverage?: number; bugs?: number; vulnerabilities?: number };
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

  constructor(private readonly scanService: ScanService) {}

  // ดึง repository ทั้งหมด
  getAll(): Repository[] {
    return this.repositories;
  }

  // ดึง repository ตาม project_id
  getByIdRepo(project_id: string): Repository | undefined {
    return this.repositories.find(r => r.project_id === project_id);
  }

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

  // อัพเดตรายการ repository
  updateRepo(project_id: string, updatedRepo: Repository): void {
    const index = this.repositories.findIndex(r => r.project_id === project_id);
    if (index > -1) {
      updatedRepo.updated_at = new Date();
      updatedRepo.created_at = this.repositories[index].created_at; // เก็บ createdAt เดิม
      this.repositories[index] = { ...this.repositories[index], ...updatedRepo };
    }
  }

  // ลบ repository ตาม project_id
  deleteRepo(project_id: string): void {
    this.repositories = this.repositories.filter(r => r.project_id !== project_id);
  }

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

  // (Optional) ค้นหา repository ตาม keyword
  searchRepo(keyword: string): Repository[] {
    const lowerKeyword = keyword.toLowerCase();
    return this.repositories.filter(r =>
      r.name.toLowerCase().includes(lowerKeyword) ||
      r.repository_url.toLowerCase().includes(lowerKeyword)
    );
  }
}