import { Routes } from '@angular/router';
import { LandingpageComponent } from './landingpage/landingpage.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { LayoutComponent } from './layout/layout.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { RepositoriesComponent } from './repositories/repositories.component';
import {AddrepositoryComponent} from './addrepository/addrepository.component';
import { CodereviewComponent } from './codereview/codereview.component';
import { IssueComponent } from './issue/issue.component';
import { AnalysisComponent } from './analysis/analysis.component';
import { ReportComponent } from './report/report.component';
import { SettingComponent } from './setting/setting.component';

export const routes: Routes = [
 
  { path: '', component: LandingpageComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },

  
  {
    path: '',
    component: LayoutComponent, // Layout มี Navbar
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'repositories', component: RepositoriesComponent },
      { path: 'addrepository', component: AddrepositoryComponent },
      { path: 'codereview', component: CodereviewComponent },
      { path: 'issue', component: IssueComponent },
      { path: 'analysis', component: AnalysisComponent },
      { path: 'report', component: ReportComponent },
      { path: 'setting', component: SettingComponent },
    ]
  },

  // fallback
  { path: '**', redirectTo: '' }
];

