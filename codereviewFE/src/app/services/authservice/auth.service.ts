
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { tap } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { jwtDecode } from 'jwt-decode';

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
  refreshToken?: string;
  user?: {
    id?: string,
    username: string
  };
}

const ACCESS_TOKEN_KEY = 'token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const USER_ID_KEY     = 'userId';
const USERNAME_KEY    = 'username';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiUrl;

    constructor() {
    // ✅ โหลด token/user จาก localStorage ทันทีที่เปิดแอป
    const token = localStorage.getItem(ACCESS_TOKEN_KEY);
    const userId = localStorage.getItem(USER_ID_KEY);
    const username = localStorage.getItem(USERNAME_KEY);
    if (token) this.setToken(token);
    if (userId) this.setUserId(userId);
    if (username) this.setUsername(username);
  }

  // -------- getters ----------
  get token(): string | null {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  }
  get refreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  }
  get userId(): string | null {
    return localStorage.getItem(USER_ID_KEY);
  }
  get username(): string | null {
    return localStorage.getItem(USERNAME_KEY);
  }
  get isLoggedIn(): boolean {
    return !!this.token;
  }

  // -------- setters ----------
  setToken(token: string | null) {
    if (token) localStorage.setItem(ACCESS_TOKEN_KEY, token);
    else localStorage.removeItem(ACCESS_TOKEN_KEY);
  }
  setRefreshToken(token: string | null) {
    if (token) localStorage.setItem(REFRESH_TOKEN_KEY, token);
    else localStorage.removeItem(REFRESH_TOKEN_KEY);
  }
  // เก็บเฉพาะ userId ให้ชัดเจน (โครงเดิม แต่ตัด logic username ออก)
  setUserId(id: string | null) {
    if (id) localStorage.setItem(USER_ID_KEY, id);
    else localStorage.removeItem(USER_ID_KEY);
  }
  // เพิ่มตัวนี้สำหรับ username โดยเฉพาะ
  setUsername(name: string | null) {
    if (name) localStorage.setItem(USERNAME_KEY, name);
    else localStorage.removeItem(USERNAME_KEY);
  }

  // -------- auth APIs ----------
  // login(payload: LoginRequest): Observable<AuthResponse> {
  //   return this.http.post<AuthResponse>(`${this.base}/auth/login`, payload).pipe(
  //     tap(res => {
  //       if (res?.token)         this.setToken(res.token);
  //       if (res?.refreshToken)  this.setRefreshToken(res.refreshToken);

  //       if (res?.user?.id)       this.setUserId(res.user.id);
  //       if (res?.user?.username) this.setUsername(res.user.username);

  //       // เผื่อ BE ไม่ส่ง user/username → ลองดึงจาก JWT
  //       if (!this.username && this.token) {
  //         const fromJwt = this.decodeJwtUsername(this.token);
  //         if (fromJwt) this.setUsername(fromJwt);
  //       }
  //     })
  //   );
  // }

   login(payload: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.base}/auth/login`, payload).pipe(
      tap(res => {
        if (res?.token) this.setToken(res.token);
        if (res?.refreshToken) this.setRefreshToken(res.refreshToken);
        if (res?.user?.id) this.setUserId(res.user.id);
        if (res?.user?.username) this.setUsername(res.user.username);

        // ถ้า backend ไม่ส่ง user → decode จาก JWT
        if (!this.userId && this.token) {
          const fromJwtId = this.decodeJwtUserId(this.token);
          if (fromJwtId) this.setUserId(fromJwtId);
        }
        if (!this.username && this.token) {
          const fromJwtName = this.decodeJwtUsername(this.token);
          if (fromJwtName) this.setUsername(fromJwtName);
        }

        // ✅ debug log ช่วยตรวจสอบตอน login
        console.log('Login success!');
        console.log('Token:', this.token);
        console.log('User ID:', this.userId);
        console.log('Username:', this.username);
      })
    );
  }


  register(payload: RegisterRequest): Observable<AuthResponse | string> {
    // ถ้า BE คืน text/plain ให้ใช้:
    // return this.http.post(`${this.base}/auth/register`, payload, { responseType: 'text' as 'json' });
    return this.http.post<AuthResponse>(`${this.base}/auth/register`, payload);
  }

  refresh(): Observable<string | null> {
    const rt = this.refreshToken;
    if (!rt) return of(null);
    // ปรับ payload/response ตามหลังบ้าน
    return this.http.post<{ accessToken: string }>(`${this.base}/auth/refresh`, { refreshToken: rt })
      .pipe(
        tap(res => this.setToken(res.accessToken)),
      ) as unknown as Observable<string | null>;
  }

 //logout
  logout(): Observable<any> {
  // ล้าง localStorage ก่อน
  this.setToken(null);
  this.setRefreshToken(null);
  this.setUserId(null);
  this.setUsername(null);

  // ส่ง request logout ไป backend
  return this.http.post(`${this.base}/auth/logout`, {});
}

  

  //resetpassword
  request(email: string): Observable<any> {
    return this.http.post(`${this.base}/auth/password-reset/request`, { email });
  }

  confirm(token: string, newPassword: string): Observable<any> {
    return this.http.post(`${this.base}/auth/password-reset/confirm`, { token, newPassword });
  }


  // ===== helper =====
  /** อ่าน username จาก JWT (พยายามดู username/preferred_username/sub/email) */
 private decodeJwtUsername(token: string | null): string | null {
  if (!token) return null;
  try {
    const payload: any = jwtDecode(token);
    return payload.username || payload.preferred_username || payload.sub || payload.email || null;
  } catch {
    return null;
  }
}

private decodeJwtUserId(token: string | null): string | null {
  if (!token) return null;
  try {
    const payload: any = jwtDecode(token);
    return payload.user_id || null;
  } catch {
    return null;
  }
}

getRoleFromToken(): string | null {
  const token = this.token;
  if (!token) return null;

  try {
    const payload: any = jwtDecode(token);

    // ดึงค่า roles ที่เป็น string ออกมาโดยตรง
    return payload.roles ? String(payload.roles) : null;
  } catch (error) {
    console.error('Error decoding token for role:', error);
    return null;
  }
}

}


