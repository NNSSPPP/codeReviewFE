import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import{FormsModule} from '@angular/forms';
import {RouterLink, ActivatedRoute} from '@angular/router';

interface Issue {
  id_issue: string;
  type: string;
  severity: string;
  title: string;
  details: string;
  project: string;
  assignee: string;
  status: string;
  selected?: boolean;
  //scanId: string | null ;
}

@Component({
  selector: 'app-issue',
  standalone: true,
  imports: [CommonModule,FormsModule,RouterLink],
  templateUrl: './issue.component.html',
  styleUrl: './issue.component.css'
})
export class IssueComponent {
  issueId: string | null = null;

  constructor(private readonly route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.filterType = params['type'] || 'All Types';
      this.filterProject = params['project'] || 'All Projects';
      this.filterSeverity = params['severity'] || 'All Severity';
      this.filterStatus = params['status'] || 'All Status';
      this.searchText = params['search'] || '';

      this.currentPage = 1;
    });
  }

  // Filters
  filterType = 'All Types';
  filterSeverity = 'All Severity';
  filterStatus = 'All Status';
  filterProject = 'All Projects';
  searchText = '';
  selectAllCheckbox = false;

  // Pagination
  currentPage = 1;
  pageSize = 5;

  // Issues
  issues: Issue[] = [
    {id_issue: '1', type: 'bug', severity: 'high', title: 'Null Pointer Exception', details: 'Line 245 in UserService.java', project: 'API-Service', assignee: '@john.dev', status: 'in-progress' },
    {id_issue: '2', type: 'security', severity: 'critical', title: 'SQL Injection Risk', details: 'Line 89 in database.service.ts', project: 'Angular-App', assignee: '@jane.dev', status: 'open' },
    {id_issue: '3', type: 'code-smell', severity: 'medium', title: 'Duplicate Code Block', details: 'Lines 120-150 in util.ts', project: 'Web-Portal', assignee: 'Unassigned', status: 'open' },
    {id_issue: '4', type: 'bug', severity: 'low', title: 'Missing null check', details: 'Line 67 in helper.java', project: 'Auth-Service', assignee: '@mike.dev', status: 'resolved' },
    {id_issue: '5', type: 'bug', severity: 'low', title: 'Missing null check', details: 'Line 67 in helper.java', project: 'Auth-Service', assignee: '@mike.dev', status: 'resolved' },
    {id_issue: '6', type: 'code-smell', severity: 'low', title: 'Missing null check', details: 'Line 67 in helper.java', project: 'Auth-Service', assignee: '@mike.dev', status: 'resolved' },
  ];

  // Filtered & Paginated
  filterIssues() {
    return this.issues.filter(i =>
      (this.filterType === 'All Types' || i.type === this.filterType) &&
      (this.filterSeverity === 'All Severity' || i.severity === this.filterSeverity) &&
      (this.filterStatus === 'All Status' || i.status === this.filterStatus) &&
      (this.filterProject === 'All Projects' || i.project === this.filterProject) &&
      (this.searchText === '' || i.title.toLowerCase().includes(this.searchText.toLowerCase()))
    );
  }

  get filteredIssues() {
    return this.filterIssues();
  }

  get paginatedIssues() {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredIssues.slice(start, start + this.pageSize);
  }

  nextPage() {
    if (this.currentPage * this.pageSize < this.filteredIssues.length) {
      this.currentPage++;
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  selectAll(event: any) {
    this.selectAllCheckbox = event.target.checked;
    this.paginatedIssues.forEach(i => i.selected = event.target.checked);
  }

  selectedCount() {
    return this.issues.filter(i => i.selected).length;
  }

  // Assign Developer
  assignDeveloper() {
    const selectedIssues = this.issues.filter(i => i.selected);
    if (!selectedIssues.length) {
      alert("กรุณาเลือก Issue ก่อน");
      return;
    }

    const developers = ["Developer A", "Developer B", "Developer C"];
    const dev = prompt("เลือก Developer: " + developers.join(", "));

    if (!dev || !developers.includes(dev)) {
      alert("Developer ไม่ถูกต้อง");
      return;
    }

    selectedIssues.forEach(issue => issue.assignee = dev);
    alert(`Assigned ${selectedIssues.length} issue(s) to ${dev}`);
  }

  // Change Status
  changeStatus() {
    const selectedIssues = this.issues.filter(i => i.selected);
    if (!selectedIssues.length) {
      alert("กรุณาเลือก Issue ก่อน");
      return;
    }

    const statusSteps = ["open", "in-progress", "resolved"];
    selectedIssues.forEach(issue => {
      const idx = statusSteps.indexOf(issue.status);
      if (idx < statusSteps.length - 1) {
        issue.status = statusSteps[idx + 1];
      }
    });

    alert(`Changed status for ${selectedIssues.length} issue(s)`);
  }

  // Export CSV
  exportData() {
    const selectedIssues = this.issues.filter(i => i.selected);
    if (!selectedIssues.length) {
      alert("กรุณาเลือก Issue ก่อน");
      return;
    }

    const csvContent = [
      ["ID", "Title", "Severity", "Status", "Assignee"].join(","),
      ...selectedIssues.map(i => [i.id_issue, i.title, i.severity, i.status, i.assignee || "-"].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "issues.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  }

  clearFilters() {
    this.filterType = 'All Types';
    this.filterSeverity = 'All Severity';
    this.filterStatus = 'All Status';
    this.filterProject = 'All Projects';
    this.searchText = '';
    this.currentPage = 1;
    this.selectAllCheckbox = false;
    this.issues.forEach(i => i.selected = false);
  }

  // Helper for icons & styles
  typeIcon(type: string) {
    switch(type.toLowerCase()) {
      case 'bug': return 'bi-bug';
      case 'security': return 'bi-shield-lock';
      case 'code-smell': return 'bi-code-slash';
      default: return '';
    }
  }

  severityClass(severity: string) {
    switch(severity.toLowerCase()) {
      case 'critical':
      case 'high': return 'text-danger';
      case 'medium': return 'text-warning';
      case 'low': return 'text-success';
      default: return '';
    }
  }

  statusClass(status: string) {
    switch(status.toLowerCase()) {
      case 'open': return 'text-danger';
      case 'in-progress': return 'text-warning';
      case 'resolved': return 'text-success';
      default: return '';
    }
  }

}
