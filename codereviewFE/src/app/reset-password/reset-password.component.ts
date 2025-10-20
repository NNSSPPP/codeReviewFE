import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../services/authservice/auth.service';

@Component({
  standalone: true,
  selector: 'app-reset-password',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './reset-password.html',
  styleUrls: ['./reset-password.scss']
})
export class ResetPasswordComponent implements OnInit {
  token: string | null = null;
  loading = false;
  msg = '';
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private svc: AuthService
  ) {
    this.form = this.fb.group({
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
  this.route.queryParamMap.subscribe(p => {
    const tk = p.get('token');
    if (tk) {
      this.token = tk; // เก็บ token ไว้ใน state
      this.router.navigate([], {
        queryParams: { token: null }, 
        queryParamsHandling: 'merge',
        replaceUrl: true
      });
    }
  });
}

  submit() {
    // const { newPassword, confirmPassword } = this.form.value;
    // if (!this.token) { this.msg = 'ลิงก์ไม่ถูกต้อง (ไม่มี token)'; return; }
    // if (this.form.invalid || newPassword !== confirmPassword) {
    //   this.msg = 'รหัสผ่านไม่ตรงกันหรือไม่ถูกต้อง';
    //   return;
    // }
    // this.loading = true; this.msg = '';
    // this.svc.confirm(this.token, newPassword!)
    //   .subscribe({
    //     next: () => { this.msg = 'ตั้งรหัสผ่านใหม่สำเร็จ!'; this.loading = false; setTimeout(() => this.router.navigateByUrl('/login'), 1200); },
    //     error: (err: any) => { this.msg = err?.error?.message || 'โทเคนหมดอายุหรือไม่ถูกต้อง'; this.loading = false; }
    //   });
  }
}
