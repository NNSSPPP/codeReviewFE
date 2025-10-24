import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { AuthService } from '../authservice/auth.service';
import { Issue, IssueService } from '../issueservice/issue.service';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface AssignHistory {
  assignedTo: string;
  assignedToName: string;
  issueId: string;
  severity: string;
  message: string;
  status: string;
  dueDate: Date | null; // <-- เพิ่ม | null
  annotation: string;

}
export interface UpdateStatusRequest {
  status: string;
  annotation: string;
}


@Injectable({
  providedIn: 'root'
})
export class AssignhistoryService {

  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);
  private readonly baseissue = environment.apiUrl + '/issues';
  private readonly baseassign = environment.apiUrl + '/assign';

  private authOpts() {
    const token = this.auth.token;
    return token
      ? { headers: new HttpHeaders({ Authorization: `Bearer ${token}` }) }
      : {};
  }

  addassign(newassign: Partial<Issue>): Observable<Issue> {
  if (!newassign.issueId || !newassign.assignedTo || !newassign.dueDate) {
    throw new Error("issueId, assignedTo, and dueDate are required");
  }

  const url = `${this.baseissue}/assign/${newassign.issueId}`;

  // แปลง date → yyyy-MM-dd เพื่อให้ Spring Boot map เป็น LocalDate ได้
  const body = {
    assignTo: newassign.assignedTo,
    dueDate: newassign.dueDate instanceof Date
      ? newassign.dueDate.toISOString().split('T')[0]
      : newassign.dueDate
  };

  return this.http.put<Issue>(url, body);
}




 getAllAssign(userId: string): Observable<AssignHistory[]> {
  return this.http.get<AssignHistory[]>(`${this.baseassign}/${userId}`)
    .pipe(
      tap(data => console.log("Received data:", data)) // <-- log here
    );
}

updateStatus(userId: string, issueId: string, body: UpdateStatusRequest) {
  return this.http.put<AssignHistory[]>(
    `${this.baseassign}/update/${userId}/${issueId}`, // ลบ "assign" เพราะ backend ของคุณเป็น /update/{userId}/{issueId}
    body,
    this.authOpts() // เพิ่ม headers ถ้าต้องใช้ Authorization
  );
}





}
