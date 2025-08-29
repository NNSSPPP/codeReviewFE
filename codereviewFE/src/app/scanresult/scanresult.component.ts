import { Component} from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { Router, RouterLink } from '@angular/router';

interface ScanCategory {
  name: string;
  status: 'Pass' | 'Warning' | 'Fail';
  score: number;
  details: string;
}

interface Scan {
  id: string;
  project: string;
  date: string;
  time: string;
  status: 'PASSED' | 'FAILED';
  grade: string;
  score: number;
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
  constructor(private router: Router) {}
  scanInfo: Scan = {
    id: '1',
    project: 'Angular-App',
    date: '2024-01-15 10:30 AM',
    time: '10:30 AM',
    status: 'PASSED',
    grade: 'A',
    score: 92,
    duration: '5 min 32 sec',
    scanner: 'npm sonar',
    technicalDebt: '2 days 4 hours',
    estimatedCost: 45000,
    categories: [
      { name: 'Code Style', status: 'Pass', score: 95, details: 'Well formatted' },
      { name: 'TypeScript Rules', status: 'Pass', score: 88, details: 'Minor issues' },
      { name: 'Security', status: 'Warning', score: 75, details: '3 vulnerabilities' },
      { name: 'Performance', status: 'Pass', score: 90, details: 'Good' },
      { name: 'Accessibility', status: 'Pass', score: 85, details: 'WCAG AA compliant' },
      { name: 'Bundle Size', status: 'Pass', score: 92, details: '1.2 MB' }
    ],
    metrics: {
      bugs: { total: 3, low: 2, medium: 1, high: 1 },
      vulns: 1,
      smells: { total: 45, minor: 30, major: 15 },
      coverage: 78.5
    }
  };

}
