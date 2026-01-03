import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SidebarComponent, SidebarMenuItem, SidebarConfig } from 'shared-components';

@Component({
  selector: 'app-sidebar-example',
  imports: [CommonModule, SidebarComponent, RouterModule],
  templateUrl: './sidebar-example.component.html',
  styleUrls: ['./sidebar-example.component.scss']
})
export class SidebarExampleComponent {

  // Configuração do sidebar
  sidebarConfig: Partial<SidebarConfig> = {
    width: '280px',
    collapsedWidth: '64px',
    collapsible: true,
    autoCollapse: true,
    logo: {
      src: 'https://upload.wikimedia.org/wikipedia/commons/6/67/Angular_gradient_logo.png',
      alt: 'Noah Angular',
      route: '/sidebar-example/dashboard'
    },
    theme: 'light'
  };

  // Itens do menu
  menuItems: SidebarMenuItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: 'fa fa-tachometer-alt',
      route: '/sidebar-example/dashboard'
    },
    {
      id: 'usuarios',
      label: 'Usuários',
      icon: 'fa fa-users',
      children: [
        {
          id: 'listar-usuarios',
          label: 'Listar',
          icon: 'fa fa-list',
          route: '/sidebar-example/usuarios/listar'
        },
        {
          id: 'criar-usuario',
          label: 'Criar',
          icon: 'fa fa-plus',
          route: '/sidebar-example/usuarios/criar'
        }
      ]
    },
    {
      id: 'relatorios',
      label: 'Relatórios',
      icon: 'fa fa-chart-bar',
      children: [
        {
          id: 'vendas',
          label: 'Vendas',
          icon: 'fa fa-shopping-cart',
          route: '/sidebar-example/relatorios/vendas'
        },
        {
          id: 'financeiro',
          label: 'Financeiro',
          icon: 'fa fa-dollar-sign',
          route: '/sidebar-example/relatorios/financeiro',
          badge: '3'
        }
      ]
    },
    {
      id: 'divider-1',
      label: '',
      icon: '',
      divider: true
    },
    {
      id: 'configuracoes',
      label: 'Configurações',
      icon: 'fa fa-cog',
      route: '/sidebar-example/configuracoes'
    },
    {
      id: 'ajuda',
      label: 'Ajuda & Suporte',
      icon: 'fa fa-question-circle',
      action: () => {
        alert('Função de ajuda executada!');
      }
    },
    {
      id: 'logout',
      label: 'Sair',
      icon: 'fa fa-sign-out-alt',
      action: () => {
        if (confirm('Deseja realmente sair?')) {
          alert('Logout executado!');
        }
      }
    }
  ];

  // Estado do sidebar
  isSidebarCollapsed = false;

  /**
   * Evento de clique em item do menu
   */
  onItemClick(item: SidebarMenuItem): void {
    console.log('Item clicado:', item);
  }

  /**
   * Evento de toggle do sidebar
   */
  onSidebarToggle(isExpanded: boolean): void {
    this.isSidebarCollapsed = !isExpanded;
    console.log('Sidebar expandido:', isExpanded);
  }

  /**
   * Evento de clique no logo
   */
  onLogoClick(): void {
    console.log('Logo clicado!');
  }
}
