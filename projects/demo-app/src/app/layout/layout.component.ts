import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
    selector: 'app-layout',
    imports: [RouterLink, RouterLinkActive, RouterOutlet],
    template: `
    <div class="d-flex">
      <!-- Sidebar -->
      <nav class="sidebar bg-dark text-white p-3" [class.sidebar-open]="sidebarOpen">
        <div class="sidebar-header mb-4">
          <h4>Noah Components</h4>
          <button class="btn btn-sm btn-outline-light d-md-none" (click)="toggleSidebar()">
            <i class="material-icons" style="vertical-align: bottom;">close</i>
          </button>
        </div>
        
        <ul class="nav flex-column">
          <li class="nav-item mb-4">
            <a routerLink="/home" 
               routerLinkActive="active" 
               class="nav-link text-white"
               (click)="closeSidebarOnMobile()">
              <i class="material-icons me-2" style="vertical-align: bottom;">home</i>
              Início
            </a>
          </li>
          
          <li class="nav-item mb-2">
            <h6 class="text-uppercase small mb-2">Componentes</h6>
          </li>
          
          <li class="nav-item mb-2">
            <a routerLink="/dropdown" 
               routerLinkActive="active" 
               class="nav-link text-white"
               (click)="closeSidebarOnMobile()">
              <i class="material-icons me-2" style="vertical-align: bottom;">arrow_drop_down</i>
              Dropdown
            </a>
          </li>
          
          <li class="nav-item mb-2">
            <a href="#" class="nav-link text-muted disabled">
              <i class="material-icons me-2" style="vertical-align: bottom;">input</i>
              Input (Em breve)
            </a>
          </li>
          
          <li class="nav-item mb-2">
            <a href="#" class="nav-link text-muted disabled">
              <i class="material-icons me-2" style="vertical-align: bottom;">smart_button</i>
              Button (Em breve)
            </a>
          </li>
        </ul>
      </nav>

      <!-- Overlay para mobile -->
      <div class="sidebar-overlay d-md-none" 
           [class.show]="sidebarOpen" 
           (click)="closeSidebar()"></div>

      <!-- Main Content -->
      <main class="main-content flex-grow-1">
        <!-- Header -->
        <header class="bg-white border-bottom p-3 d-flex justify-content-between align-items-center">
          <button class="btn btn-outline-primary d-md-none" (click)="toggleSidebar()">
            <i class="material-icons" style="vertical-align: bottom;">menu</i>
          </button>
          <h5 class="mb-0">Documentação dos Componentes</h5>
        </header>
        
        <!-- Page Content -->
        <div class="p-4">
          <router-outlet></router-outlet>
        </div>
      </main>
    </div>
  `,
    styles: [`
    .sidebar {
      width: 280px;
      min-height: 100vh;
      position: fixed;
      top: 0;
      left: 0;
      z-index: 1000;
      transform: translateX(-100%);
      transition: transform 0.3s ease;
    }
    
    .sidebar-open {
      transform: translateX(0);
    }
    
    .sidebar-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      z-index: 999;
      opacity: 0;
      visibility: hidden;
      transition: all 0.3s ease;
    }
    
    .sidebar-overlay.show {
      opacity: 1;
      visibility: visible;
    }
    
    .main-content {
      margin-left: 0;
      transition: margin-left 0.3s ease;
    }
    
    .nav-link.active {
      background-color: rgba(255, 255, 255, 0.1);
      border-radius: 0.375rem;
    }
    
    .nav-link:hover:not(.disabled) {
      background-color: rgba(255, 255, 255, 0.05);
      border-radius: 0.375rem;
    }
    
    /* Desktop styles */
    @media (min-width: 768px) {
      .sidebar {
        position: static;
        transform: translateX(0);
      }
      
      .main-content {
        margin-left: 0;
      }
      
      .sidebar-overlay {
        display: none;
      }
    }
  `]
})
export class LayoutComponent {
    sidebarOpen = false;

    toggleSidebar() {
        this.sidebarOpen = !this.sidebarOpen;
    }

    closeSidebar() {
        this.sidebarOpen = false;
    }

    closeSidebarOnMobile() {
        // Fecha sidebar apenas em mobile
        if (window.innerWidth < 768) {
            this.closeSidebar();
        }
    }
}
