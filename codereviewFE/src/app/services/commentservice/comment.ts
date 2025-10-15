import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../authservice/auth.service';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class CommentService {
    private readonly http = inject(HttpClient);
    private readonly auth = inject(AuthService)
    
}