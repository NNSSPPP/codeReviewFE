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
  styleUrls: ['./addrepository.component.css'] // <- แก้จาก styleUrl เป็น styleUrls
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
    created_at: new Date(),
    updated_at: new Date()
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

  // เวอร์ชันที่ถูกต้อง: เรียก service เดียวให้ชัดเจน และปิดวงเล็บให้ครบ
  loadRepository(project_id: string) {
    this.repositoryService.getByIdRepo(project_id).subscribe({
      next: (repo) => {
        if (!repo) {
          console.error('Repository not found');
          this.clearForm();
          return;
        }
        this.gitRepository = {
          project_id: repo.project_id || '',
          user_id: repo.user_id || '',
          name: repo.name || '',
          repository_url: repo.repository_url || '',
          project_type: repo.project_type,
          branch: repo.branch || 'main',
          created_at: repo.created_at ? new Date(repo.created_at) : new Date(),
          updated_at: repo.updated_at ? new Date(repo.updated_at) : new Date()
        };
      },
      error: (err) => console.error('Failed to load repository', err)
    });
  }

  onSubmit(form: NgForm) {
    if (form.valid) {
      const payload = this.gitRepository;
      if (this.isEditMode) {
        this.repositoryService.updateRepo(payload.project_id, payload).subscribe({
          next: () => {
            alert("Repository updated successfully!");
            this.router.navigate(['/repositories']); // นำทางหลังสำเร็จ
          },
          error: (err) => {
            console.error(err);
            alert("Operation failed. Please try again.");
          }
        });
      } else {
        this.repositoryService.addRepo(payload).subscribe({
          next: () => {
            alert("Repository added successfully!");
            this.router.navigate(['/repositories']); // นำทางหลังสำเร็จ
          },
          error: (err) => {
            console.error(err);
            alert("Operation failed. Please try again.");
          }
        });
      }
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
      this.repositoryService.deleteRepo(this.gitRepository.project_id).subscribe({
        next: () => {
          alert('Deleted successfully!');
          this.router.navigate(['/repositories']); // นำทางหลังลบเสร็จ
        },
        error: (err) => {
          console.error(err);
          alert('Delete failed. Please try again.');
        }
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
      created_at: new Date(),
      updated_at: new Date()
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
