import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../services/authservice/auth.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { jwtDecode } from 'jwt-decode';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, MatSnackBarModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  email = '';
  password = '';
  loading = false;
  submitted = false;

  constructor(
    private readonly auth: AuthService,
    private readonly router: Router,
    private readonly snack: MatSnackBar
  ) {}

  onSubmit(form: NgForm) {
    this.submitted = true;
    this.loading = true;
    
     if (form.invalid ) {
      this.snack.open('Login Failed. Please fill in all fields.', '', {
        duration: 2500,
        horizontalPosition: 'right',
        verticalPosition: 'top',
        panelClass: ['app-snack', 'app-snack-red'], 
      });
      return;
    }

     this.loading = true;
    this.auth.login({ email: this.email, password: this.password }).subscribe({
      next: () => {
        this.loading = false;
        this.snack.open('Login Successfully!', '', {
          duration: 2500,
          horizontalPosition: 'center',
          verticalPosition: 'top',
          panelClass: ['app-snack', 'app-snack-blue'],
        });
      console.log('Token:',this.auth.token)
     console.log('Username:', this.auth.username);
console.log('User ID:', this.auth.userId);
console.log('Role:', this.auth.role);
console.log('Email:', this.auth.email);

        this.router.navigate(['/dashboard']);
      },
      error: () => {
        this.loading = false;
        this.snack.open('Login Failed. Please try again.', '', {
          duration: 2500,
          horizontalPosition: 'right',
          verticalPosition: 'top',
          panelClass: ['app-snack', 'app-snack-red'],
        });
      },
    });
  }
}
