import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
  

  navbarOpen = false;
  submenuOpen: { [key: string]: boolean } = {
    codeReview: false,
    report: false
  };
  
  constructor(private readonly router: Router) {

    // ปิด submenu ถ้าไปหน้าอื่นที่ไม่ใช่ submenu
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        const url = event.urlAfterRedirects;
        if (!url.startsWith('/activescan') && !url.startsWith('/scanhistory')) {
          this.submenuOpen['codeReview'] = false;
        }
        if (!url.startsWith('/generatereport') && !url.startsWith('/reporthistory')) {
          this.submenuOpen['report'] = false;
        }
      }
    });
  }

  toggleNavbar() {
    this.navbarOpen = !this.navbarOpen;
  }

  closeNavbar() {
    this.navbarOpen = false;
  }

  codeReviewOpen = false;

  toggleSubmenu(menu: string) {
    this.submenuOpen[menu] = !this.submenuOpen[menu];
  }


}
