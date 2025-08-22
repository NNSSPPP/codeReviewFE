import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-addrepository',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './addrepository.component.html',
  styleUrl: './addrepository.component.css'
})
export class AddrepositoryComponent {

  authMethod: 'usernamePassword' | 'accessToken' = 'usernamePassword';

  gitRepository = {
    id: '',
    name: '',
    url: '',
    type: '',
    branch: '',
    credentials: {
      username: '',
      password: '',
      token: ''
    },
    createdAt: new Date(),
    updatedAt: new Date()
  };

  sonarConfig = {
    projectKey: '',
    projectName: '',
    projectVersion: '',
    sources: 'src',
    serverUrl: 'https://code.pccth.com',
    token: '',
    enableAutoScan: true,
    enableQualityGate: true
  };

  onSubmit(form: any) {
    if (form.valid) {
      console.log("Repository Data:", this.gitRepository);
      console.log("SonarQube Config:", this.sonarConfig);
      alert("Form submitted successfully!");
    } else {
      alert("Please fill all required fields correctly.");
    }
  }

  
  onTest() {
    console.log('Testing connection:', this.gitRepository, this.sonarConfig);
    alert('Connection OK!');
  }
  
}
