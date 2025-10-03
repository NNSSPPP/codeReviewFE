import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { Repository, RepositoryService } from '../services/reposervice/repository.service';

@Component({
  selector: 'app-addrepository',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './addrepository.component.html',
  styleUrl: './addrepository.component.css'
})
export class AddrepositoryComponent implements OnInit {

  constructor(
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly repositoryService: RepositoryService
  ) { }
  authMethod: 'usernamePassword' | 'accessToken' | null = null;
  isEditMode: boolean = false;

  gitRepository: Repository = {
    project_id: '',
    user_id: '',
    name: '',
    project_type: undefined,
    repository_url: '',
    branch: 'main',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  sonarConfig = {
    projectKey: '',
    projectName: '',
    projectVersion: '',
    sources: 'src',
    serverUrl: 'https://code.pccth.com',
    token: '',
    enableAutoScan: true,
    enableQualityGate: true
  };

  ngOnInit(): void {
    const project_id = this.route.snapshot.paramMap.get('project_id');
    if (project_id) {
      this.isEditMode = true;
      this.loadRepository(project_id);
    }
  }

  // loadRepository(project_id: string) {
  //   const repo = this.repositoryService.getByIdRepo(project_id);
  //   if (repo) {
  //     this.gitRepository = { ...repo };
  //   }
  // }
  
  loadRepository(project_id: string) {
    this.repositoryService.getById(project_id).subscribe(repo => {
      if (repo) {
        this.gitRepository = { ...repo };
      }

    this.repositoryService.getByIdRepo(project_id).subscribe({
      next: (repo) => {
        if (!repo) {
          console.error('Repository not found');
          // ถ้า repo ไม่มีค่า ให้ reset form หรือ handle ตามต้องการ
          this.clearForm();
          return;
        }
  
        // แปลง object ให้ตรงกับ interface Repository
        this.gitRepository = {
          project_id: repo.project_id || '',   // ให้ default ''
          user_id: repo.user_id || '',
          name: repo.name || '',
          repository_url: repo.repository_url || '',
          project_type: repo.project_type,
          branch: repo.branch || 'main',
          created_at: repo.created_at ? new Date(repo.created_at) : new Date(),
          updated_at: repo.updated_at ? new Date(repo.updated_at) : new Date(),
          scans: repo.scans,
          issues: repo.issues
        };
      },
      error: (err) => console.error('Failed to load repository', err)
    });
  }
  
  

  onSubmit(form: NgForm) {
    if (form.valid) {
      if (this.isEditMode) {
        this.repositoryService.update(this.gitRepository.project_id, this.gitRepository).subscribe(() => {
          alert("Repository updated successfully!");
        });
        alert("Repository updated successfully!");
      } else {
        this.repositoryService.create(this.gitRepository).subscribe(() => {
          alert("Repository added successfully!");
        });
      }
      this.router.navigate(['/repositories']);
    } else {
      alert("Please fill all required fields correctly.");
    }
  }

  onTest() {
    console.log('Testing connection:', this.gitRepository, this.sonarConfig);
    alert('Connection OK!');
  }

  onCancel() {
    this.router.navigate(['/repositories']);
  }

  onDelete() {
    if (confirm('Are you sure to delete this repository?')) {
      this.repositoryService.delete(this.gitRepository.project_id).subscribe(() => {
        alert('Deleted successfully!');
        this.router.navigate(['/repositories']);
      });
      
    }
  }

  clearForm(form?: NgForm) {
    this.gitRepository = {
      project_id: '',
      user_id: '',
      name: '',
      project_type: undefined,
      repository_url: '',
      branch: 'main',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),

    };

    this.sonarConfig = {
      projectKey: '',
      projectName: '',
      projectVersion: '',
      sources: 'src',
      serverUrl: 'https://code.pccth.com',
      token: '',
      enableAutoScan: true,
      enableQualityGate: true
    };

    this.authMethod = null;

    if (form) {
      form.resetForm({
        name: '',
        repository_url: '',
        project_type: undefined,
        branch: 'main',
        serverUrl: 'https://code.pccth.com',
        projectKey: '',
        enableAutoScan: true,
        enableQualityGate: true
      });
    }
  }
}