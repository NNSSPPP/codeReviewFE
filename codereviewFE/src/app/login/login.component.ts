import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  email: string = '';
  password: string = '';

  constructor(private router: Router) { }


  submitted = false;

  onSubmit(form: any) {
    this.submitted = true;

    if (form.invalid) {
      console.log('Login Failed');
      return;
    }

    if (this.email === 'admin@example.com' && this.password === '123456') {
      console.log('Login Success');
      this.router.navigate(['/dashboard']);
    } else {
      console.log('Login Failed: Wrong credentials');
      alert('Invalid email or password');
    }
  }


}
