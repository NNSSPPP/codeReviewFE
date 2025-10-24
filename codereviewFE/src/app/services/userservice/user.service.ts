import { inject, Injectable } from '@angular/core';
import { AuthService } from '../authservice/auth.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
export interface User{
  id : string;
  username: string;
}
@Injectable({
  providedIn: 'root'
})
export class UserService {

  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);
  private readonly base = environment.apiUrl + '/users';


  private authOpts() {
    const token = this.auth.token;
    return token
      ? { headers: new HttpHeaders({ Authorization: `Bearer ${token}` }) }
      : {};
  }

  getAllUser(): Observable< User[]> {
      return this.http.get< User[]>(`${this.base}/users`, this.authOpts());
    }



}
