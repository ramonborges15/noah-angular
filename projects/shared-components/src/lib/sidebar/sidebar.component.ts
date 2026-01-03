import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, HostListener, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { BehaviorSubject, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { SidebarMenuItem, SidebarConfig, SidebarState, SidebarEvents } from '../types/sidebar.types';

@Component({
  selector: 'lib-sidebar',
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private router = inject(Router);

  // Configuração e dados
  @Input() config: Partial<SidebarConfig> = {};
  @Input() menuItems: SidebarMenuItem[] = [];
  @Input() isCollapsed: boolean = false;

  // Eventos
  @Output() itemClick = new EventEmitter<SidebarMenuItem>();
  @Output() toggle = new EventEmitter<boolean>();
  @Output() overlayToggle = new EventEmitter<boolean>();
  @Output() logoClick = new EventEmitter<void>();

  // Estado interno
  private state$ = new BehaviorSubject<SidebarState>({
    isCollapsed: false,
    isMobile: false,
    isOverlayOpen: false,
    activeItemId: undefined
  });

  // Configuração padrão
  defaultConfig: Required<SidebarConfig> = {
    width: '280px',
    collapsedWidth: '64px',
    position: 'left',
    collapsible: true,
    autoCollapse: true,
    overlay: true,
    logo: {
      src: '',
      alt: 'Logo',
      route: '/'
    },
    theme: 'light',
    customCssClass: ''
  };

  // Getters para o estado
  get currentState(): SidebarState {
    return this.state$.value;
  }

  get finalConfig(): Required<SidebarConfig> {
    return { ...this.defaultConfig, ...this.config };
  }

  get sidebarWidth(): string {
    return this.currentState.isCollapsed ? this.finalConfig.collapsedWidth : this.finalConfig.width;
  }

  ngOnInit(): void {
    this.initializeState();
    this.detectActiveRoute();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Detecta mudanças de tela
   */
  @HostListener('window:resize', ['$event'])
  onResize(event: any): void {
    this.checkMobileState();
  }

  /**
   * Inicializa o estado do sidebar
   */
  private initializeState(): void {
    this.checkMobileState();

    // Configura estado inicial baseado no input
    this.updateState({
      isCollapsed: this.isCollapsed
    });

    // Auto-collapse em mobile se configurado
    if (this.finalConfig.autoCollapse && this.currentState.isMobile) {
      this.updateState({ isCollapsed: true });
    }
  }

  /**
   * Verifica se está em modo mobile
   */
  private checkMobileState(): void {
    const isMobile = window.innerWidth < 768; // Breakpoint md
    this.updateState({ isMobile });

    if (isMobile && this.finalConfig.autoCollapse) {
      this.updateState({ isCollapsed: true });
    }
  }

  /**
   * Detecta rota ativa
   */
  private detectActiveRoute(): void {
    const currentUrl = this.router.url;
    const activeItem = this.findActiveItem(this.menuItems, currentUrl);

    if (activeItem) {
      this.updateState({ activeItemId: activeItem.id });
    }
  }

  /**
   * Encontra item ativo baseado na URL
   */
  private findActiveItem(items: SidebarMenuItem[], url: string): SidebarMenuItem | null {
    for (const item of items) {
      if (item.route && url.startsWith(item.route)) {
        return item;
      }

      if (item.children) {
        const childItem = this.findActiveItem(item.children, url);
        if (childItem) return childItem;
      }
    }

    return null;
  }

  /**
   * Atualiza o estado
   */
  private updateState(newState: Partial<SidebarState>): void {
    const current = this.currentState;
    this.state$.next({ ...current, ...newState });
  }

  /**
   * Toggle do sidebar
   */
  toggleSidebar(): void {
    const newCollapsedState = !this.currentState.isCollapsed;
    this.updateState({ isCollapsed: newCollapsedState });
    this.toggle.emit(!newCollapsedState);
  }

  /**
   * Toggle do overlay (mobile)
   */
  toggleOverlay(): void {
    const newOverlayState = !this.currentState.isOverlayOpen;
    this.updateState({ isOverlayOpen: newOverlayState });
    this.overlayToggle.emit(newOverlayState);
  }

  /**
   * Clique no item do menu
   */
  onItemClick(item: SidebarMenuItem, event: Event): void {
    if (item.disabled) {
      event.preventDefault();
      return;
    }

    // Se tem filhos, toggle expansão
    if (item.children && item.children.length > 0) {
      event.preventDefault();
      this.toggleItemExpansion(item);
      return;
    }

    // Ação personalizada
    if (item.action) {
      event.preventDefault();
      item.action();
    }

    // Navegação
    if (item.route) {
      this.updateState({ activeItemId: item.id });
      this.router.navigate([item.route]);

      // Fecha overlay em mobile após navegação
      if (this.currentState.isMobile && this.currentState.isOverlayOpen) {
        this.updateState({ isOverlayOpen: false });
      }
    }

    // Emite evento
    this.itemClick.emit(item);
  }

  /**
   * Toggle expansão de item com filhos
   */
  toggleItemExpansion(item: SidebarMenuItem): void {
    item.isExpanded = !item.isExpanded;
  }

  /**
   * Clique no logo
   */
  onLogoClick(): void {
    if (this.finalConfig.logo.route) {
      this.router.navigate([this.finalConfig.logo.route]);
    }
    this.logoClick.emit();
  }

  /**
   * Fecha overlay ao clicar fora (mobile)
   */
  closeOverlay(): void {
    if (this.currentState.isMobile && this.currentState.isOverlayOpen) {
      this.updateState({ isOverlayOpen: false });
    }
  }

  /**
   * Verifica se item está ativo
   */
  isItemActive(item: SidebarMenuItem): boolean {
    return this.currentState.activeItemId === item.id;
  }

  /**
   * Verifica se item tem filhos ativos
   */
  hasActiveChild(item: SidebarMenuItem): boolean {
    if (!item.children) return false;

    return item.children.some(child =>
      this.isItemActive(child) || this.hasActiveChild(child)
    );
  }

  /**
   * TrackBy function para performance
   */
  trackByItemId(index: number, item: SidebarMenuItem): string {
    return item.id;
  }
}
