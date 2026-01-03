import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {

  // Dados de exemplo para o dashboard
  stats = [
    {
      title: 'Usuários Ativos',
      value: '1,247',
      change: '+12%',
      changeType: 'positive',
      icon: 'fa fa-users'
    },
    {
      title: 'Vendas do Mês',
      value: 'R$ 45,678',
      change: '+8%',
      changeType: 'positive',
      icon: 'fa fa-shopping-cart'
    },
    {
      title: 'Pedidos',
      value: '892',
      change: '-3%',
      changeType: 'negative',
      icon: 'fa fa-box'
    },
    {
      title: 'Conversão',
      value: '3.2%',
      change: '+0.5%',
      changeType: 'positive',
      icon: 'fa fa-chart-line'
    }
  ];

  recentActivities = [
    {
      user: 'João Silva',
      action: 'Criou um novo pedido',
      time: '2 minutos atrás',
      type: 'order'
    },
    {
      user: 'Maria Santos',
      action: 'Atualizou perfil',
      time: '15 minutos atrás',
      type: 'profile'
    },
    {
      user: 'Pedro Costa',
      action: 'Cancelou pedido #1234',
      time: '1 hora atrás',
      type: 'cancel'
    },
    {
      user: 'Ana Oliveira',
      action: 'Fez uma compra',
      time: '2 horas atrás',
      type: 'purchase'
    }
  ];

  /**
   * Retorna o ícone baseado no tipo de atividade
   */
  getActivityIcon(type: string): string {
    const icons: { [key: string]: string } = {
      'order': 'fa fa-shopping-cart',
      'profile': 'fa fa-user-edit',
      'cancel': 'fa fa-times-circle',
      'purchase': 'fa fa-credit-card'
    };
    return icons[type] || 'fa fa-circle';
  }

}
