import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
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
  projects = [
    { name: 'Angular-App', selected: false },
    { name: 'API-Service', selected: false },
    { name: 'Web-Portal', selected: false },
    { name: 'Auth-Servic', selected: false },
    { name: 'Mobile-App', selected: false }
  ];
  sections = [
    { name: 'Quality Gate Summary', selected: true },
    { name: 'Issue Breakdown', selected: true },
    { name: 'Security Analysis', selected: true },
    { name: 'Technical Debt', selected: true },
    { name: 'Trend Analysis', selected: true },
    { name: 'Recommendations', selected: true }
  ];
  dateFrom?: string;
  dateTo?: string;
  outputFormat: string = '';
  email: string = '';
  constructor(private readonly route: ActivatedRoute) {} // ✅ inject route ที่นี่

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['type']) {
        this.reportType = params['type']; // แก้ให้ตรงกับ property
      }
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
  cancel(form?: any) {
    if (form) {
      form.resetForm();  // เคลียร์ค่าฟอร์ม
    }
    this.reportType = '';
    this.projects.forEach(p => p.selected = false);
    this.sections.forEach(s => s.selected = true); // หรือ false ตาม default
    this.dateFrom = '';
    this.dateTo = '';
    this.outputFormat = '';
    this.email = '';
    
    console.log('Form cancelled and cleared.');
  }
  

  previewReport() {
    console.log('Previewing report...');
  }

  generateReport() {
    console.log('Generating report...');
  }

 

 

 

}
