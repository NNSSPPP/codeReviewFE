import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { IssueService } from '../services/issueservice/issue.service';
import { AuthService } from '../services/authservice/auth.service';
import { Repository, RepositoryService } from '../services/reposervice/repository.service';

interface Issue {
  issuesId: string;
  type: string;        // 'bug' | 'security' | 'code-smell'
  severity: string;    // 'critical' | 'high' | 'medium' | 'low'
  message: string;       // from message
  details: string;     // from component
  projectName: string;     // project name or id (fallback)
  assignee: string;    // '@user' | 'Unassigned'
  status: string;      // 'open' | 'in-progress' | 'resolved' | 'closed'
  selected?: boolean;
}

@Component({
  selector: 'app-issue',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './issue.component.html',
  styleUrls: ['./issue.component.css'] 
})
export class IssueComponent {
  issueId: string | null = null;
  repositories: Repository[] = [];
  filteredRepositories: Repository[] = [];
  projects: { name: string }[] = [];

  constructor(
    private readonly router: Router,
    private readonly issueApi: IssueService,
    private readonly auth: AuthService,
    private readonly repositoryService: RepositoryService
  ) {}

  ngOnInit(): void {
    const userId = this.auth.userId;
    if (!userId) { this.router.navigate(['/login']); return; }

    // อ่านค่า filter จาก query param (โครงเดิม)
    // this.route.queryParams.subscribe(params => {
    //   this.filterType     = params['type']     || 'All Types';
    //   this.filterProject  = params['project']  || 'All Projects';
    //   this.filterSeverity = params['severity'] || 'All Severity';
    //   this.filterStatus   = params['status']   || 'All Status';
    //   this.searchText     = params['search']   || '';
    //   this.currentPage = 1;
    // });

    this.loadIssues(String(userId));
    console.log(`Issue ID: ${this.issueId}`);

    this.repositoryService.getAllRepo().subscribe(repos => {
  const uniqueNames = Array.from(new Set(repos.map(repo => repo.name)));
  this.projects = uniqueNames.map(name => ({ name }));
});

  }

  // ---------- Filters ----------
  filterType = 'All Types';
  filterSeverity = 'All Severity';
  filterStatus = 'All Status';
  filterProject = 'All Projects';
  searchText = '';
  selectAllCheckbox = false;

  // ---------- Pagination ----------
  currentPage = 1;
  pageSize = 5;

  get totalPages(): number {
    return Math.ceil(this.filteredIssues.length / this.pageSize) || 1;
  }

  // ---------- State ----------
  loading = false;
  errorMsg = '';

  // ดาต้าจริง (แทน mock)
  issues: Issue[] = [];

  // ---------- Fetch ----------
  private loadIssues(userId: string) {
    this.loading = true; this.errorMsg = '';
    this.issueApi.getAllIssue(userId).subscribe({
      next: (rows) => {
        // map backend Issue -> UI Issue
        this.issues = (rows || []).map(r => this.mapApiIssueToUi(r));
        // เติมรายการ project ให้ filter ถ้าต้องการใช้ใน template ภายหลัง
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.errorMsg = 'Failed to load issues.';
        this.loading = false;
      }
    });
  }

  private mapApiIssueToUi(r: import('../services/issueservice/issue.service').Issue): Issue {
    // type mapping: 'Bug' | 'Vulnerability' | 'Code Smell'  ->  'bug' | 'security' | 'code-smell'
    const typeMap: Record<string, string> = {
      'BUG': 'bug',
      'VULNERABILITY': 'security',
      'CODE SMELL': 'code-smell',
      'CODE_SMELL': 'code-smell'
    };
    const uiType = typeMap[(r.type || '').toUpperCase()] || (r.type || '').toLowerCase();

    // severity mapping: Blocker->critical, Critical->high, Major->medium, Minor->low
    const sevMap: Record<string, string> = {
      'BLOCKER': 'critical',
      'CRITICAL': 'high',
      'MAJOR': 'medium',
      'MINOR': 'low'
    };
    const uiSeverity = sevMap[(r.severity || '').toUpperCase()] || (r.severity || '').toLowerCase();

    // status mapping: 'Open' | 'In Progress' | 'Resolved' | 'Closed' -> 'open' | 'in-progress' | 'resolved' | 'closed'
    const st = (r.status || '').toLowerCase();
    const uiStatus =
    st.includes('open')      ? 'open':
      st.includes('in progress') ? 'in-progress' :
      st.includes('done')    ? 'done' :
      st.includes('reject')      ? 'reject':
      'open';

    // assignee: ใช้ user_id/assignedTo ถ้ามี
    const rawAssignee = r.assignedTo || r.userId || '';
    const assignee = rawAssignee ? `@${rawAssignee}` : 'Unassigned';

    // project: ถ้าไม่มีชื่อให้ fallback เป็น project_id

    return {
      issuesId: r.issueId,
      type: uiType,
      severity: uiSeverity,
      message: r.message || '(no message)',
      details: r.component || '',
      projectName: r.projectName,
      assignee,
      status: uiStatus,
      selected: false
    };
  }

  // ---------- Filter / Page ----------
 filterIssues() {
  return this.issues.filter(i =>
    (this.filterType === 'All Types'     || i.type === this.filterType) &&
    (this.filterSeverity === 'All Severity' || i.severity === this.filterSeverity) &&
    (this.filterStatus === 'All Status'  || i.status === this.filterStatus) &&
    (
      this.filterProject === 'All Projects' ||
      i.projectName?.toLowerCase().trim() === this.filterProject.toLowerCase().trim()
    ) &&
    (this.searchText === '' || i.message.toLowerCase().includes(this.searchText.toLowerCase()))
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

  // ---------- Selection ----------
  isPageAllSelected(): boolean {
    return this.paginatedIssues.length > 0 && this.paginatedIssues.every(i => !!i.selected);
  }

  selectAll(event: any) {
    const checked = event.target.checked;
    this.paginatedIssues.forEach(i => i.selected = checked);
  }

  selectedCount() {
    return this.issues.filter(i => i.selected).length;
  }

  // ---------- Actions (ยังคงเค้าโครงเดิม) ----------
   assignDeveloper() {
  //   const selectedIssues = this.issues.filter(i => i.selected);
  //   if (!selectedIssues.length) { alert('กรุณาเลือก Issue ก่อน'); return; }

  //   const developers = ['userA', 'userB', 'userC']; // สมมุติ user_id; ถ้ามี list จริงให้แทนที่
  //   const dev = prompt('เลือก Developer (พิมพ์ user id): ' + developers.join(', '));
  //   if (!dev || !developers.includes(dev)) { alert('Developer ไม่ถูกต้อง'); return; }

  //   // call API แบบทีละรายการ (คงโครงเดิมให้เบา ๆ)
  //   let ok = 0;
  //   selectedIssues.forEach(row => {
  //     this.issueApi.assignDeveloper(row.issuesId, dev).subscribe({
  //       next: () => {
  //         row.assignee = `@${dev}`;
  //         ok++;
  //       },
  //       error: (e) => console.error('assign failed', e)
  //     });
  //   });

  //   alert(`Sent assign requests for ${selectedIssues.length} issue(s).`); // แจ้งแบบง่าย ๆ
   }

  changeStatus() {
    // const selectedIssues = this.issues.filter(i => i.selected);
    // if (!selectedIssues.length) { alert('กรุณาเลือก Issue ก่อน'); return; }

    // const statusSteps = ['open', 'in-progress', 'resolved', 'closed'];
    // selectedIssues.forEach(row => {
    //   const idx = statusSteps.indexOf(row.status);
    //   const next = statusSteps[Math.min(idx + 1, statusSteps.length - 1)];
    //   // แปลงกลับเป็นรูปแบบ API
    //   const apiStatus =
    //     next === 'in-progress' ? 'In Progress' :
    //     next === 'resolved'    ? 'Resolved' :
    //     next === 'closed'      ? 'Closed' : 'Open';

    //   this.issueApi.updateStatus(row.issuesId, apiStatus as any).subscribe({
    //     next: () => row.status = next,
    //     error: (e) => console.error('update status failed', e)
    //   });
    // });

    // alert(`Requested status change for ${selectedIssues.length} issue(s).`);
  }

  exportData() {
    const selectedIssues = this.issues.filter(i => i.selected);
    const exportIssues = selectedIssues.length ? selectedIssues : this.issues;

    const datenow = new Date();
    const dateStr = datenow.toISOString().split('T')[0].replaceAll('-', '');
    const fileType = selectedIssues.length ? 'selected' : 'all';
    const fileName = `issues_${fileType}_${dateStr}.csv`;

    const csvContent = [
      ['No.', 'Title', 'Severity', 'Status', 'Assignee'].join(','),
      ...exportIssues.map((i, idx) => [
        idx + 1,
        `"${i.message.replaceAll('"','""')}"`,
        i.severity,
        i.status,
        i.assignee || '-'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = fileName; a.click();
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

  // ---------- Helpers (โครงเดิม) ----------
  typeIcon(type: string) {
    switch (type.toLowerCase()) {
      case 'bug': return 'bi-bug';
      case 'security': return 'bi-shield-lock';
      case 'code-smell': return 'bi-code-slash';
      default: return '';
    }
  }

  severityClass(severity: string) {
    switch (severity.toLowerCase()) {
      case 'critical':
      case 'high': return 'text-danger';
      case 'medium': return 'text-warning';
      case 'low': return 'text-success';
      default: return '';
    }
  }

  statusClass(status: string) {
    switch (status.toLowerCase()) {
      case 'open': return 'text-danger';
      case 'in-progress': return 'text-warning';
      case 'done': return 'text-success';
      case 'reject': return 'text-secondary';
      default: return '';
    }
  }
}
