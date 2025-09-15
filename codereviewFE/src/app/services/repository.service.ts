import { Injectable } from '@angular/core';

export interface Repository {
  project_id: string;          
  name: string;
  type?: 'Angular' | 'Spring Boot'; 
  language: string;            
  repoUrl: string;             
  branch: string;
  status: 'Active' | 'Scanning' | 'Paused';
  lastScan?: string;
  scanningProgress?: number;
  qualityGate?: string;
  previousGrade?: string;
  bugs?: number;
  vulnerabilities?: number;
  coverage?: number;
  credentials: {
    username?: string;
    password?: string; 
    token?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class RepositoryService {

  private repositories: Repository[] = [
    {
      project_id: '1',
      name: 'E-Commerce Platform',
      type: 'Angular',
      language: 'TypeScript',
      repoUrl: 'https://github.com/pccth/ecommerce-frontend.git',
      branch: 'main',
      status: 'Active',
      lastScan: '2 hours ago',
      qualityGate: 'Grade A',
      bugs: 12,
      vulnerabilities: 3,
      coverage: 85,
      credentials: { username: 'admin', password: 'encrypted' },
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      project_id: '2',
      name: 'Payment API Service',
      type: 'Spring Boot',
      language: 'Java',
      repoUrl: 'https://github.com/pccth/payment-service.git',
      branch: 'develop',
      status: 'Scanning',
      scanningProgress: 45,
      previousGrade: 'Grade B',
      bugs: 8,
      vulnerabilities: 3,
      coverage: 72,
      credentials: { username: 'payuser', password: 'encrypted' },
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      project_id: '3',
      name: 'Inventory Management',
      type: 'Angular',
      language: 'TypeScript',
      repoUrl: 'https://github.com/pccth/inventory-frontend.git',
      branch: 'main',
      status: 'Paused',
      previousGrade: 'Grade C',
      bugs: 20,
      vulnerabilities: 5,
      coverage: 65,
      credentials: { username: 'inventory', password: 'encrypted' },
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      project_id: '4',
      name: 'User Authentication Service',
      type: 'Spring Boot',
      language: 'Java',
      repoUrl: 'https://github.com/pccth/auth-service.git',
      branch: 'main',
      status: 'Active',
      lastScan: '30 minutes ago',
      qualityGate: 'Grade A',
      bugs: 5,
      vulnerabilities: 1,
      coverage: 90,
      credentials: { username: 'authadmin', password: 'encrypted' },
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      project_id: '5',
      name: 'Marketing Dashboard',
      type: 'Angular',
      language: 'TypeScript',
      repoUrl: 'https://github.com/pccth/marketing-dashboard.git',
      branch: 'feature/analytics',
      status: 'Scanning',
      scanningProgress: 60,
      previousGrade: 'Grade B',
      bugs: 7,
      vulnerabilities: 2,
      coverage: 78,
      credentials: { username: 'marketing', password: 'encrypted' },
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];
  
  constructor() {}

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
    repository.createdAt = new Date();
    repository.updatedAt = new Date();
    repository.status = repository.status || 'Active';
    this.repositories.push(repository);
  }

  // อัพเดตรายการ repository
  updateRepo(project_id: string, updatedRepo: Repository): void {
    const index = this.repositories.findIndex(r => r.project_id === project_id);
    if (index > -1) {
      updatedRepo.updatedAt = new Date();
      updatedRepo.createdAt = this.repositories[index].createdAt; // เก็บ createdAt เดิม
      this.repositories[index] = { ...this.repositories[index], ...updatedRepo };
    }
  }

  // ลบ repository ตาม project_id
  deleteRepo(project_id: string): void {
    this.repositories = this.repositories.filter(r => r.project_id !== project_id);
  }

  // (Optional) ค้นหา repository ตาม keyword
  searchRepo(keyword: string): Repository[] {
    const lowerKeyword = keyword.toLowerCase();
    return this.repositories.filter(r =>
      r.name.toLowerCase().includes(lowerKeyword) ||
      r.repoUrl.toLowerCase().includes(lowerKeyword)
    );
  }
}