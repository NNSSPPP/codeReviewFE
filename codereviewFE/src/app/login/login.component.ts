import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

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

  // mock user
  mockUser = {
    email: 'test@example.com',
    password: '123456'
  };

  constructor(private readonly router: Router) {}

  onSubmit(form: NgForm) {
    if (!form.valid) return;
    this.loading = true;
    this.submitted = true;

    // mock delay ให้เหมือน async call
    setTimeout(() => {
      if (
        this.email === this.mockUser.email &&
        this.password === this.mockUser.password
      ) {
        console.log('Login Success');
        this.loading = false;
        this.router.navigate(['/dashboard']);
      } else {
        console.log('Login Failed: Wrong credentials');
        this.loading = false;
        alert('Invalid email or password');
      }
    }, 1000);
  }
}
