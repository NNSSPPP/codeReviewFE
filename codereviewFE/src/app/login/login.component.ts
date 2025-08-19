import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms'; // สำหรับ ngModel
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

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

  constructor() {}

  onSubmit() {
    console.log('Email:', this.email, 'Password:', this.password);
    alert(`Logging in with email: ${this.email}`);
    // หลัง login สำเร็จ ไป dashboard
    // this.router.navigate(['/dashboard']);
  }


}
