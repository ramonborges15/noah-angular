/**
 * Interface para itens do menu lateral
 */
export interface SidebarMenuItem {
  id: string;
  label: string;
  icon: string;
  route?: string;
  action?: () => void;
  children?: SidebarMenuItem[];
  isExpanded?: boolean;
  isActive?: boolean;
  disabled?: boolean;
  badge?: string | number;
  divider?: boolean; // Adiciona linha divisória após o item
}

/**
 * Configurações do sidebar
 */
export interface SidebarConfig {
  // Visual
  width?: string;
  collapsedWidth?: string;
  position?: 'left' | 'right';
  
  // Comportamento
  collapsible?: boolean;
  autoCollapse?: boolean; // Colapsa automaticamente em telas pequenas
  overlay?: boolean; // Modo overlay em mobile
  
  // Branding
  logo?: {
    src: string;
    alt: string;
    route?: string;
  };
  
  // Customização
  theme?: 'light' | 'dark';
  customCssClass?: string;
}

/**
 * Estado do sidebar
 */
export interface SidebarState {
  isCollapsed: boolean;
  isMobile: boolean;
  isOverlayOpen: boolean;
  activeItemId?: string;
}

/**
 * Eventos emitidos pelo sidebar
 */
export interface SidebarEvents {
  itemClick: SidebarMenuItem;
  toggle: boolean; // true = expanded, false = collapsed
  overlayToggle: boolean;
  logoClick: void;
}