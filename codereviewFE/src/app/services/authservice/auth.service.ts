import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';

export interface LoginRequest { 
  email: string; 
  password: string; 
}
export interface RegisterRequest { 
  username: string;
  email: string;
  phoneNumber: string;
  password: string;
}
export interface AuthResponse { 
  token: string; 
  user?: { id?: string; email: string;}; 
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiUrl;

  get token(): string | null { return localStorage.getItem('token'); }
  get userId(): string | null { return localStorage.getItem('userId'); }
  get isLoggedIn(): boolean { return !!this.token; }

  login(payload: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.base}/auth/login`, payload).pipe(
      tap(res => { 
        if (res?.token) localStorage.setItem('token', res.token);
        if (res?.user?.id) localStorage.setItem('userId', res.user.id);
       })
    );
  }

  register(payload: RegisterRequest): Observable<AuthResponse | string> {
    // ถ้า BE คืนเป็น JSON ใช้ <AuthResponse>
    // ถ้า BE คืน "text/plain" ให้เปลี่ยนเป็นบรรทัดล่างนี้:
    // return this.http.post(`${this.base}/auth/register`, payload, { responseType: 'text' as 'json' });
    return this.http.post<AuthResponse>(`${this.base}/auth/register`, payload);
  }

  logout(): void { 
    localStorage.removeItem('token'); 
    localStorage.removeItem('userId');
  }
}