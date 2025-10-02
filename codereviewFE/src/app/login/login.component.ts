import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../services/authservice/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  email = '';
  password = '';
  loading = false;
  submitted = false;

  constructor(private readonly auth: AuthService, private readonly router: Router) {}
  
  onSubmit(form: NgForm) {
    if (!form.valid) return;
    this.loading = true;
    this.submitted = true;

    this.auth.login({ email: this.email, password: this.password }).subscribe({
      next: () => {
        this.loading = false;
        console.log('Login Success');
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading = false;
        console.log('Login Failed: Wrong credentials');
        alert('Invalid email or password');
      }
    });
  }
}
