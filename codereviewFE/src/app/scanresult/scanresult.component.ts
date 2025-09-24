import { Component} from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { Router, RouterLink } from '@angular/router';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface ScanCategory {
  name: string;
  status: 'Pass' | 'Warning' | 'Fail';
  grade : string;
  details: string;
}

interface Scan {
  scan_id: string;
  project: string;
  date: string;
  time: string;
  status: 'PASSED' | 'FAILED';
  grade: string;
  categories: ScanCategory[];
  metrics: {
    bugs: { total: number; low: number; medium: number; high: number };
    vulns: number;
    smells: { total: number; minor: number; major: number };
    coverage: number;
  };
  duration: string;
  scanner: string;
  technicalDebt: string;
  estimatedCost: number;
}

@Component({
  selector: 'app-scanresult',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './scanresult.component.html',
  styleUrl: './scanresult.component.css'
})
export class ScanresultComponent {

  constructor(private readonly router: Router) {}

  scanInfo: Scan = {
    scan_id: '1',
    project: 'Angular-App',
    date: '2024-01-15 10:30 AM',
    time: '10:30 AM',
    status: 'PASSED',
    grade: 'A',
    duration: '5 min 32 sec',
    scanner: 'npm sonar',
    technicalDebt: '2 days 4 hours',
    estimatedCost: 45000,
    categories: [
      { name: 'Security', status: 'Pass', grade: 'A', details: 'No vulnerabilities' },
      { name: 'Reliability', status: 'Warning', grade: 'B', details: 'Minor stability issues' },
      { name: 'Maintainability', status: 'Pass', grade: 'A', details: 'Codebase easy to maintain' },
      { name: 'Security Hosts', status: 'Fail', grade: 'C', details: 'Host configuration issues' }
    ],
    metrics: {
      bugs: { total: 3, low: 2, medium: 1, high: 1 },
      vulns: 1,
      smells: { total: 45, minor: 30, major: 15 },
      coverage: 78.5
    }
  };

  private generatePDF(): jsPDF {
    const doc = new jsPDF();

    // Header
    doc.setFontSize(18);
    doc.text(`Scan Report: ${this.scanInfo.project}`, 14, 20);

    doc.setFontSize(12);
    doc.text(`Quality Gate: ${this.scanInfo.status}`, 14, 30);
    doc.text(`Overall Grade: ${this.scanInfo.grade}`, 14, 37);
    doc.text(`Date: ${this.scanInfo.date}`, 14, 47);
    doc.text(`Duration: ${this.scanInfo.duration}`, 14, 54);
    doc.text(`Scanner: ${this.scanInfo.scanner}`, 14, 61);

    // Over All Code
    autoTable(doc, {
      startY: 70,
      head: [['Topic', 'Status', 'Grade', 'Details']],
      body: this.scanInfo.categories.map(cat => [
        cat.name,
        cat.status,
        cat.grade,
        cat.details
      ])
    });

    // Metrics Overview
    const finalY1 = (doc as any).lastAutoTable?.finalY || 70;
    doc.text('Metrics Overview', 14, finalY1 + 15);
    autoTable(doc, {
      startY: finalY1 + 20,
      head: [['Metric', 'Value']],
      body: [
        [
          'Bugs',
          `${this.scanInfo.metrics.bugs.total} (Low: ${this.scanInfo.metrics.bugs.low}, Medium: ${this.scanInfo.metrics.bugs.medium}, High: ${this.scanInfo.metrics.bugs.high})`
        ],
        ['Vulns', this.scanInfo.metrics.vulns.toString()],
        [
          'Smells',
          `${this.scanInfo.metrics.smells.total} (Minor: ${this.scanInfo.metrics.smells.minor}, Major: ${this.scanInfo.metrics.smells.major})`
        ],
        ['Coverage', `${this.scanInfo.metrics.coverage}%`]
      ]
    });

    // Technical Debt & Cost
    const finalY2 = (doc as any).lastAutoTable?.finalY || finalY1 + 40;
    doc.text('Technical Debt & Cost', 14, finalY2 + 15);
    autoTable(doc, {
      startY: finalY2 + 20,
      head: [['Technical Debt', 'Estimated Cost']],
      body: [[this.scanInfo.technicalDebt, `฿${this.scanInfo.estimatedCost.toLocaleString()}`]]
    });

    return doc;
  }

 
  downloadReport() {
    const doc = this.generatePDF();

    const projectName = this.scanInfo.project.replace(/\s+/g, '_');
    const scanDate = new Date(this.scanInfo.date);
    const formattedDate = `${scanDate.getFullYear()}${(scanDate.getMonth() + 1)
      .toString()
      .padStart(2, '0')}${scanDate.getDate().toString().padStart(2, '0')}`;
  
    const fileName = `scan_report_${projectName}_${formattedDate}.pdf`;
    doc.save(fileName);
  }
  

  emailReport() {
    const doc = this.generatePDF();
    const pdfBlob = doc.output('blob');

    // TODO: ส่ง pdfBlob ไป backend เพื่อส่งอีเมลจริง
    console.log('PDF ready to send by email', pdfBlob);
    alert('Report prepared for email (demo only)');
  }

  viewIssues() {
    this.router.navigate(['/issues', this.scanInfo.scan_id]);
  }
}