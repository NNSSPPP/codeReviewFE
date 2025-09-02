import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';

interface SubmenuItem {
  label: string;
  icon: string;
  link: string;
}

interface MenuItem {
  label: string;
  icon: string;
  link?: string;
  submenu?: SubmenuItem[];
  key?: string; // ใช้สำหรับ toggle
}


@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
  
  navbarOpen = false;
  submenuOpen: { [key: string]: boolean } = {};

  menu: MenuItem[] = [
    { label: 'Dashboard', icon: 'bi-speedometer2', link: '/dashboard' },
    { label: 'Repositories', icon: 'bi-folder-fill', link: '/repositories' },
    { 
      label: 'Code Review', icon: 'bi-chat-left-text', key: 'codeReview', submenu: [
        { label: 'Active Scan', icon: 'bi-play-circle', link: '/activescan' },
        { label: 'Scan History', icon: 'bi-clock-history', link: '/scanhistory' },
      ] 
    },
    { 
      label: 'Report', icon: 'bi-file-earmark-text-fill', key: 'report', submenu: [
        { label: 'Generate Report', icon: 'bi-file-earmark-plus', link: '/generatereport' },
        { label: 'Report History', icon: 'bi-clock-history', link: '/reporthistory' },
      ] 
    },
    { label: 'Setting', icon: 'bi-gear-fill', link: '/setting' },
    { label: 'Logout', icon: 'bi-box-arrow-right', link: '/' }
  ];

  constructor(private readonly router: Router) {

    
    // ตั้ง submenu ให้เปิดตาม URL ตอนโหลดและเปลี่ยน route
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.menu.forEach(item => {
          if (item.submenu && item.key) {
            this.submenuOpen[item.key] = item.submenu.some(sub => event.urlAfterRedirects.startsWith(sub.link));
          }
        });
      }
    });
  }

  toggleNavbar() {
    this.navbarOpen = !this.navbarOpen;
  }

  closeNavbar() {
    this.navbarOpen = false;
  }

  toggleSubmenu(key: string) {
    this.submenuOpen[key] = !this.submenuOpen[key];
  }

  

    

}
