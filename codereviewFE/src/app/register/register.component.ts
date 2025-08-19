import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  username = '';
  email = '';
  telephone = '';
  password = '';
  confirmPassword = '';

  existingUsernames = ['user12345', 'admin2025', 'testuser1'];
  existingEmails = ['hello@gmail.com', 'admin@test.com', 'user@example.com'];

  checkUsername() {
    return this.existingUsernames.includes(this.username);
  }

  checkEmail() {
    return this.existingEmails.includes(this.email);
  }

  get passwordError() {
    const pattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%&*]).{8,}$/;
    return this.password && !pattern.test(this.password)
      ? 'Password must be at least 8 characters and include uppercase, lowercase, number, and special character'
      : '';
  }

  get passwordsMismatch() {
    return this.password && this.confirmPassword && this.password !== this.confirmPassword;
  }

  onSubmit() { 
    if (this.checkUsername() || this.checkEmail() || this.passwordError || this.passwordsMismatch) {
      alert('Register Failed!');
      return;
    } 
    console.log({ 
      username: this.username,
      email: this.email, 
      telephone: this.telephone, 
      password: this.password 
    }); 
    alert('Register Success!'); 
  }
  
}
