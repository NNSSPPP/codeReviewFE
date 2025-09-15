import { Component, OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule} from '@angular/forms';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { Repository, RepositoryService } from '../services/repository.service';

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
  ) {}

  authMethod: 'usernamePassword' | 'accessToken' | null = null;
  isEditMode: boolean = false;
  gitRepository: Repository = {
    project_id: '',
    name: '',
    type: undefined ,        
    language: '',
    repoUrl: '',
    branch: 'main',
    status: 'Active',
    credentials: { username: '', password: '', token: '' },
    createdAt: new Date(),
    updatedAt: new Date(),
    lastScan: undefined,
    scanningProgress: undefined,
    qualityGate: undefined,
    previousGrade: undefined,
    bugs: undefined,
    vulnerabilities: undefined,
    coverage: undefined
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

  loadRepository(project_id: string) {
    const repo = this.repositoryService.getByIdRepo(project_id);
    if (repo) {
      this.gitRepository = { ...repo };
    }
  }

  onSubmit(form: any) {
    if (form.valid) {
      if (this.isEditMode) {
        this.repositoryService.updateRepo(this.gitRepository.project_id, this.gitRepository);
        alert("Repository updated successfully!");
      } else {
        this.repositoryService.addRepo(this.gitRepository);
        alert("Repository added successfully!");
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
      this.repositoryService.deleteRepo(this.gitRepository.project_id);
      alert('Deleted successfully!');
      this.router.navigate(['/repositories']);
    }
  }
  

  clearForm(form: any) {
    this.gitRepository = {
      project_id: '',
      name: '',
      type: undefined,
      language: '',
      repoUrl: '',
      branch: 'main',
      status: 'Active',
      credentials: { username: '', password: '', token: '' },
      createdAt: new Date(),
      updatedAt: new Date(),
      lastScan: undefined,
      scanningProgress: undefined,
      qualityGate: undefined,
      previousGrade: undefined,
      bugs: undefined,
      vulnerabilities: undefined,
      coverage: undefined
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
        url: '',
        type: undefined,
        branch: 'main',
        username: '',
        password: '',
        token: '',
        serverUrl: 'https://code.pccth.com',
        projectKey: '',
        enableAutoScan: true,
        enableQualityGate: true
      });
    }
  }
}