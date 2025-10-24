import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Repository, RepositoryService } from '../services/reposervice/repository.service';
import { AuthService } from '../services/authservice/auth.service';
import{ScanService} from '../services/scanservice/scan.service';
@Component({
  selector: 'app-addrepository',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, MatSnackBarModule],
  templateUrl: './addrepository.component.html',
  styleUrls: ['./addrepository.component.css'] // <- แก้จาก styleUrl เป็น styleUrls
})
export class AddrepositoryComponent implements OnInit {

  constructor(
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly repositoryService: RepositoryService,
    private readonly authService: AuthService,
    private readonly snack: MatSnackBar,
    private readonly scanService: ScanService
  ) {}
  authMethod: 'usernamePassword' | 'accessToken' | null = null;
  isEditMode: boolean = false;

  gitRepository: Repository = {
    projectId: undefined,
    user: '',
    name: '',
    projectType: undefined,
    repositoryUrl: '',
    sonarProjectKey: ''
  };

  credentials= {
    username: '',
    password: ''
  };

  sonarConfig = {
    projectKey: '',
    projectName: '',
    projectVersion: '',
    sources: 'src',
    serverUrl: 'http://localhost:9000',
    token: '',
    enableAutoScan: true,
    enableQualityGate: true
  };



  ngOnInit(): void {
    const projectId = this.route.snapshot.paramMap.get('projectId');

    if (projectId) {
      this.isEditMode = true;
      this.loadRepository(projectId);
    }

    // ตรวจสอบ userId จาก AuthService
    const userId = this.authService.userId;
    if (!userId) {
      this.router.navigate(['/login']);
      return;
    }

    // ตั้งค่า userId ให้ repository ที่จะเพิ่ม
    this.gitRepository.user = userId.toString();

    this.updateProjectKey();
  }

  /** โหลด repo สำหรับแก้ไข */
  loadRepository(projectId: string) {
    this.repositoryService.getByIdRepo(projectId).subscribe({
      next: (repo) => {
        if (!repo) {
          console.error('Repository not found');
          return;
        }

         const rawType = (repo.projectType || '').toLowerCase().trim();
      let normalizedType: 'Angular' | 'Spring Boot' | undefined;

      if (rawType.includes('angular')) {
        normalizedType = 'Angular';
      } else if (rawType.includes('spring')) {
        normalizedType = 'Spring Boot';
      } else {
        normalizedType = undefined;
      }

        this.gitRepository = {
          projectId: repo.projectId || '',
          user: repo.user || '',
          name: repo.name || '',
          repositoryUrl: repo.repositoryUrl || '',
          projectType: normalizedType,
          //branch: repo.branch || 'main',
          // createdAt: repo.createdAt ? new Date(repo.createdAt) : new Date(),
          // updatedAt: repo.updatedAt ? new Date(repo.updatedAt) : new Date(),
          sonarProjectKey: repo.sonarProjectKey || ''
          
        };
        this.updateProjectKey();

        console.log('Loaded projectType:',  normalizedType);

      },
      error: (err) => console.error('Failed to load repository', err)
    });
  }

  
  /** ฟังก์ชันอัปเดต projectKey ให้ตรงกับชื่อ repo */
  updateProjectKey() {
    this.sonarConfig.projectKey = this.gitRepository.name || '';
  }

  /** ฟังก์ชันเรียกตอนกรอกชื่อ repository แบบ real-time */
  onNameChange(newName: string) {
    this.gitRepository.name = newName;   // <- อัปเดตชื่อ repo
    this.updateProjectKey();             // <- อัปเดต projectKey ทันที
  }



  onSubmit(form: NgForm) {
  if (!form.valid) {
    this.snack.open('Please fill in all required fields', '', {
      duration: 2500,
      horizontalPosition: 'right',
      verticalPosition: 'top',
      panelClass: ['app-snack', 'app-snack-red']
    });
    return;
  }

  // อัปเดต projectKey ก่อน submit
  this.updateProjectKey();

  const payload = this.gitRepository;

  const saveOrUpdate$ = this.isEditMode
    ? this.repositoryService.updateRepo(this.gitRepository.projectId!, payload)
    : this.repositoryService.addRepo(payload);

  saveOrUpdate$.subscribe({
    next: (savedRepo) => {
      // toast success save/update
      const msg = this.isEditMode ? 'Repository updated successfully!' : 'Repository added successfully!';
      this.snack.open(msg, '', {
        duration: 2500,
        horizontalPosition: 'right',
        verticalPosition: 'top',
        panelClass: ['app-snack', 'app-snack-blue']
      });

      // กลับหน้า repository management ทันที
      this.router.navigate(['/repositories']);

      // เรียก scan หลัง 5 วินาที
      setTimeout(() => {
        this.scanService.startScan(savedRepo.projectId!, {
  repoUrl: savedRepo.repositoryUrl || '',
  projectKey: savedRepo.sonarProjectKey || '',
  username: this.credentials.username || '',
  password: this.credentials.password || ''
})
.subscribe({
          next: () => {
            this.snack.open('Scan started successfully!', '', {
              duration: 2500,
              horizontalPosition: 'right',
              verticalPosition: 'top',
              panelClass: ['app-snack', 'app-snack-green']
            });
          },
          error: (err) => {
            console.error('Scan failed:', err);
            this.snack.open('Scan failed to start', '', {
              duration: 2500,
              horizontalPosition: 'right',
              verticalPosition: 'top',
              panelClass: ['app-snack', 'app-snack-red']
            });
          }
        });
      }, 5000);
    },
    error: (err) => {
      console.error('Failed to save repository', err);
      this.snack.open('Failed to save repository', '', {
        duration: 2500,
        horizontalPosition: 'right',
        verticalPosition: 'top',
        panelClass: ['app-snack', 'app-snack-red']
      });
    }
  });
}


  // onSubmit(form: NgForm) {
  //   if (!form.valid) {
  //     alert('Please fill in all required fields');
  //     return;
  //   }

  //   // <- อัปเดต projectKey อีกครั้งก่อน submit
  //   this.updateProjectKey();
  //   if (form.valid) {
  //     const payload = this.gitRepository;
  //     if (this.isEditMode) {
  //       this.repositoryService.updateRepo(this.gitRepository.projectId!, this.gitRepository)
  //         .subscribe({
  //           next: () => {
  //             this.snack.open("Repository updated successfully!", '', {
  //               duration: 2500,
  //               horizontalPosition: 'right',
  //               verticalPosition: 'top',
  //               panelClass: ['app-snack', 'app-snack-blue'], 
  //             });
  //             this.router.navigate(['/repositories']);
  //           },
  //           error: (err) => {
  //             console.error('Failed to update repository', err);
  //             this.snack.open('Failed to update repository', '', {
  //               duration: 2500,
  //               horizontalPosition: 'right',
  //               verticalPosition: 'top',
  //               panelClass: ['app-snack', 'app-snack-red'], 
  //             });
  //           }
  //         });
  //     } else {
  //       this.repositoryService.addRepo(this.gitRepository)
  //         .subscribe({
  //           next: () => {
  //             this.snack.open("Repository added successfully!", '', {
  //               duration: 2500,
  //               horizontalPosition: 'right',
  //               verticalPosition: 'top',
  //               panelClass: ['app-snack', 'app-snack-blue'], 
  //             });
  //             this.router.navigate(['/repositories']);
  //           },
  //           error: (err) => {
  //             console.error('Failed to add repository', err);
  //             this.snack.open('Failed to add repository', '', {
  //               duration: 2500,
  //               horizontalPosition: 'right',
  //               verticalPosition: 'top',
  //               panelClass: ['app-snack', 'app-snack-red'], 
  //             });
  //           }
  //         });
  //     }
  //   } else {
  //     alert('Please fill in all required fields');
  //   }
  // }

  // onTest() {
  //   console.log('Testing connection:', this.gitRepository, this.sonarConfig);
  //   alert('Connection OK!');
  // }

  onCancel() {
    this.router.navigate(['/repositories']);
  }

  onDelete() {
    if (confirm('Are you sure to delete this repository?')) {
      this.repositoryService.deleteRepo(this.gitRepository.projectId!).subscribe(() => {        this.snack.open('Deleted successfully!', '', {
          duration: 2500,
          horizontalPosition: 'right',
          verticalPosition: 'top',
          panelClass: ['app-snack', 'app-snack-red'], 
        });
        this.router.navigate(['/repositories']);
      });
    }
  }

  clearForm(form?: NgForm) {
    this.gitRepository = {
      projectId: '',
      user: '',
      name: '',
      projectType: undefined,
      repositoryUrl: '',
      // createdAt: new Date(),
      // updatedAt: new Date()
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
        repositoryUrl: '',
        projectType: undefined,
        branch: 'main',
        serverUrl: 'https://code.pccth.com',
        projectKey: '',
        enableAutoScan: true,
        enableQualityGate: true
      });
    }
  }

}
