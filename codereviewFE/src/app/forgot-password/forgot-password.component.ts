import { Component } from '@angular/core';
import { FormBuilder, Validators, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/authservice/auth.service';
import { Router } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-forgot-password',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './forgot-password.html',
  styleUrls: ['./forgot-password.scss'],
})
export class ForgotPasswordComponent {
  form: FormGroup;
  loading = false;
  msg = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  submit(): void {
    if (this.form.invalid) return;

    this.loading = true;
    this.msg = '';

    const email = this.form.get('email')?.value;

    // this.authService.request(email).subscribe({
    //   next: (res) => {
    //     this.msg = res?.message || 'ถ้ามีบัญชีนี้ เราได้ส่งลิงก์รีเซ็ตไปที่อีเมลแล้ว';
    //     this.loading = false;
    //     this.form.reset();
    //   },
    //   error: (err) => {
    //     this.msg = err.error?.message || 'เกิดข้อผิดพลาด กรุณาลองใหม่';
    //     this.loading = false;
    //   },
    // });
  }

  goBack(): void {
    this.router.navigate(['/login']);
  }
  
}
