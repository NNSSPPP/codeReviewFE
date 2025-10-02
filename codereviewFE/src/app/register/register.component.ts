import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../services/authservice/auth.service';
import { HttpErrorResponse } from '@angular/common/http';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, MatSnackBarModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  username = '';
  email = '';
  phoneNumber = '';
  password = '';
  confirmPassword = '';
  loading = false;
  submitted = false;

  constructor(
    private readonly auth: AuthService,
    private readonly router: Router,
    private readonly snack: MatSnackBar) { }

  get passwordError() {
    const pattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%&*]).{8,}$/;
    return this.password && !pattern.test(this.password)
      ? 'Password must be at least 8 characters and include uppercase, lowercase, number, and special character'
      : '';
  }

  get passwordsMismatch() {
    return this.password && this.confirmPassword && this.password !== this.confirmPassword;
  }

  clearForm(form: NgForm) {
    this.username = '';
    this.email = '';
    this.phoneNumber = '';
    this.password = '';
    this.confirmPassword = '';
    form.resetForm();
    this.submitted = false;
  }

  checkUsername(ctrl: any): boolean {
    return !!ctrl?.errors?.duplicate;
  }

  checkEmail(ctrl: any): boolean {
    return !!ctrl?.errors?.duplicate;
  }

  checkPhoneNumber(ctrl: any): boolean {
    return !!ctrl?.errors?.duplicate;
  }




  onSubmit(form: NgForm) {
    this.snack.open('✅ Registered', 'OK', {
  duration: 2500,
  horizontalPosition: 'right',
  verticalPosition: 'top',
  panelClass: ['app-snack', 'app-snack-blue'], // ฟ้า-ขาว รองรับ dark mode
});

    this.submitted = true; // ให้ UI แสดง validation ทันทีตอนกด

    if (form.invalid || this.passwordsMismatch) {
      return;
    }

    this.loading = true;

    this.auth.register({
      username: this.username.trim(),
      email: this.email.trim(),
      phoneNumber: this.phoneNumber.trim(),
      password: this.password.trim()
    }).subscribe({
      next: (res: any) => {
        this.loading = false;
        this.snack.open(res?.message || 'Registered', 'OK', {
          duration: 2000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
          panelClass: ['toast-success', 'toast'],
        });
        this.router.navigate(['/login']);
      },
      error: (err: HttpErrorResponse) => {
        this.loading = false;

        // กรณี BE ส่ง { fields: [...] }
        if (err.status === 409 && Array.isArray(err.error?.fields)) {
          (err.error.fields as Array<'username' | 'email' | 'phoneNumber'>).forEach(f => {
            const ctrl = form.controls[f];
            ctrl?.setErrors({ ...(ctrl.errors || {}), duplicate: true });
            ctrl?.markAsTouched();
          });
          return;
        }

        // กรณี BE ส่งแค่ { message: "Username already exists" } ไม่มี fields
        if (err.status === 409 && err.error?.message) {
          const msg = String(err.error.message).toLowerCase();
          if (msg.includes('username')) form.controls['username']?.setErrors({ ...(form.controls['username']?.errors || {}), duplicate: true });
          if (msg.includes('email')) form.controls['email']?.setErrors({ ...(form.controls['email']?.errors || {}), duplicate: true });
          if (msg.includes('phone')) form.controls['phoneNumber']?.setErrors({ ...(form.controls['phoneNumber']?.errors || {}), duplicate: true });
          return;
        }
      }
    });
  }

}