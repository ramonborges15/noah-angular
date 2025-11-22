/**
 * Tipos e interfaces para autenticação
 */

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface LoginResponse {
    success: boolean;
    accessToken?: string;
    user?: UserInfo;
    expiresIn?: number; // em minutos
    message?: string;
    errors?: string[];
}

export interface UserInfo {
    id: string;
    nome: string;
    email: string;
    perfil: string;
    permissoes: string[];
    avatar?: string;
    lastLogin?: Date;
}

export interface LogoutResponse {
    success: boolean;
    message?: string;
}

export interface RefreshTokenResponse {
    success: boolean;
    accessToken?: string;
    expiresIn?: number;
    message?: string;
}

/**
 * Estados do processo de login
 */
export enum LoginStatus {
    IDLE = 'IDLE',
    LOADING = 'LOADING',
    SUCCESS = 'SUCCESS',
    ERROR = 'ERROR'
}

/**
 * Configurações opcionais para o login
 */
export interface LoginOptions {
    // Configurações visuais
    title?: string;
    subtitle?: string;
    logoUrl?: string;
    backgroundUrl?: string;
    footerText?: string;

    // Funcionalidades
    redirectUrl?: string;
    showForgotPassword?: boolean;
    showRegisterLink?: boolean;
    passwordMinLength?: number;

    // Links personalizados
    links?: {
        forgotPassword?: string;
        register?: string;
        termsOfService?: string;
        privacyPolicy?: string;
    };

    // Personalização visual
    theme?: 'light' | 'dark' | 'auto';
    primaryColor?: string;
}

/**
 * Interface que a aplicação deve implementar para comunicação com o backend
 */
export interface AuthProvider {
    /**
     * Realiza login no backend
     */
    login(credentials: LoginCredentials): Promise<LoginResponse>;

    /**
     * Realiza logout no backend
     */
    logout(): Promise<LogoutResponse>;

    /**
     * Renova o access token (opcional - se não implementado, usa apenas frontend)
     */
    refreshToken?(): Promise<RefreshTokenResponse>;

    /**
     * Verifica se o token ainda é válido no backend (opcional)
     */
    validateToken?(token: string): Promise<boolean>;
}

/**
 * Dados de erro de validação de formulário
 */
export interface LoginValidationErrors {
    email?: string[];
    password?: string[];
    general?: string[];
}

/**
 * Estado completo do login para uso reativo
 */
export interface LoginState {
    status: LoginStatus;
    user: UserInfo | null;
    isAuthenticated: boolean;
    errors: LoginValidationErrors;
    lastAttempt: Date | null;
}