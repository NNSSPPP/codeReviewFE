import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import{RepositoryService,Repository} from '../services/reposervice/repository.service';

interface Project {
  name: string;
  selected: boolean;
}

interface Section {
  name: string;
  selected: boolean;
}

interface OutputFormat {
  value: string;
  label: string;
  icon: string;
}


@Component({
  selector: 'app-generatereport',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './generatereport.component.html',
  styleUrl: './generatereport.component.css'
})
export class GeneratereportComponent {

  reportType: string = '';
  projects: Project[] = [];  // จะเติมมาจาก backend
  dateFrom?: string;
  dateTo?: string;
  outputFormat: string = '';
  email: string = '';

 
  sections = [
    { name: 'Quality Gate Summary', selected: true },
    { name: 'Issue Breakdown', selected: true },
    { name: 'Security Analysis', selected: true },
    { name: 'Technical Debt', selected: true },
    { name: 'Trend Analysis', selected: true },
    { name: 'Recommendations', selected: true }
  ];

  constructor(private readonly route: ActivatedRoute,private readonly repositoryService: RepositoryService) {} 

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['reportType']) {
        this.reportType = params['reportType']; 
      }
    });
    this.repositoryService.getAllRepo().subscribe(repos => {
      this.projects = repos.map(repo => ({
        name: repo.name,
        selected: false
      }));
    });
  }

  hasSelectedProjects(): boolean {
    return this.projects.some(p => p.selected);
  }

  selectAllProjects(select: boolean) {
    this.projects.forEach(p => p.selected = select);
  }

  onPreview(form: any) {
    if (this.isFormValid(form)) {
      this.previewReport();
    }
  }

  onGenerate(form: any) {
    if (this.isFormValid(form)) {
      this.generateReport();
    }
  }

  isFormValid(form: any): boolean {
    form.control.markAllAsTouched();
    if (!this.reportType) return false;
    if (!this.hasSelectedProjects()) return false;
    if (!this.dateFrom || !this.dateTo) return false;
    if (this.dateFrom > this.dateTo) return false;
    if (!this.outputFormat) return false;
    if (this.email && form.controls['email']?.invalid) return false;
    return true;
  }

  previewReport() {
    console.log('Previewing report...');
  }

  generateReport() {
    console.log('Generating report...');
  }

  cancel() {
    console.log('Cancelled.');
  }

 

 

}
