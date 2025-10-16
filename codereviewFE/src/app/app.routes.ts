import { Routes } from '@angular/router';
import { LandingpageComponent } from './landingpage/landingpage.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { LayoutComponent } from './layout/layout.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { RepositoriesComponent } from './repositories/repositories.component';
import { AddrepositoryComponent } from './addrepository/addrepository.component';
import { DetailrepositoryComponent } from './detailrepository/detailrepository.component';
import { ScanhistoryComponent } from './scanhistory/scanhistory.component';
import { ScanresultComponent } from './scanresult/scanresult.component';
import { LogviewerComponent } from './logviewer/logviewer.component';
import { IssueComponent } from './issue/issue.component';
import { IssuedetailComponent } from './issuedetail/issuedetail.component';
import { AssignmentComponent } from './assignment/assignment.component';
import { AnalysisComponent } from './analysis/analysis.component';
import { SecuritydashboardComponent } from './securitydashboard/securitydashboard.component';
import { TechnicaldebtComponent } from './technicaldebt/technicaldebt.component';
import { GeneratereportComponent } from './generatereport/generatereport.component';
import { ReporthistoryComponent } from './reporthistory/reporthistory.component';
import { SonarqubeconfigComponent } from './sonarqubeconfig/sonarqubeconfig.component';
import { NotificationsettingComponent } from './notificationsetting/notificationsetting.component';
import { UsermanagementComponent } from './usermanagement/usermanagement.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';

export const routes: Routes = [

  { path: '', component: LandingpageComponent, pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'resetpassword', component: ResetPasswordComponent },
  { path: 'forgotpassword', component: ForgotPasswordComponent },

  {
    path: '',
    component: LayoutComponent, // Layout มี Navbar
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'repositories', component: RepositoriesComponent },
      { path: 'addrepository', component: AddrepositoryComponent },
      { path: 'settingrepo/:projectId', component: AddrepositoryComponent },
      { path: 'detailrepo/:projectId', component: DetailrepositoryComponent },
      { path: 'scanhistory', component: ScanhistoryComponent },
      { path: 'scanresult/:scanId', component: ScanresultComponent },
      { path: 'logviewer/:scanId', component: LogviewerComponent },
      { path: 'issue', component: IssueComponent },
      { path: 'issuedetail/:issuesId', component: IssuedetailComponent },
      { path: 'assignment', component: AssignmentComponent },
      { path: 'analysis', component: AnalysisComponent },
      { path: 'security-dashboard', component: SecuritydashboardComponent },
      { path: 'technical-debt', component: TechnicaldebtComponent },
      { path: 'generatereport', component: GeneratereportComponent },
      { path: 'reporthistory', component: ReporthistoryComponent },
      { path: 'sonarqubeconfig', component: SonarqubeconfigComponent },
      { path: 'notificationsetting', component: NotificationsettingComponent },
      { path: 'usermanagement', component: UsermanagementComponent },
    ]
  },

  // fallback
  { path: '**', redirectTo: '' }
];

