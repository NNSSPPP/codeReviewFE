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

 
  checkUsername(): boolean {
    const takenUsernames = ['user12345', 'admin2025', 'testuser1']; // mock
    return takenUsernames.includes(this.username); // true = error
  }
  
  checkEmail(): boolean {
    const takenEmails = ['hello@gmail.com', 'admin@test.com', 'user@example.com'];
    return takenEmails.includes(this.email); // true = error
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

  clearForm(form: any) {
    this.username = '';
    this.email = '';
    this.telephone = '';
    this.password = '';
    this.confirmPassword = '';
    form.resetForm();
    this.submitted = false;
  }

  submitted = false;

onSubmit(form: any) {
  this.submitted = true;

  if (form.invalid || this.checkUsername() || this.checkEmail() || this.passwordError || this.passwordsMismatch) {
    return; 
  }

  //console.log("Form Submitted:", form.value);
  console.log('Submit Success!');
  alert('Register Success!');
  this.clearForm(form);
}

  
  
}
