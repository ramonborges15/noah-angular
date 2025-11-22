import { Inject, Injectable, InjectionToken, Optional } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  AuthProvider,
  LoginCredentials,
  LoginOptions,
  LoginResponse,
  LoginState,
  LoginStatus,
  LoginValidationErrors,
  LogoutResponse,
  UserInfo
} from '../../types/auth.types';
import { AuthStorageService } from '../local-storage/auth-storage.service';

/**
 * Token de injeção para o AuthProvider
 */
export const AUTH_PROVIDER = new InjectionToken<AuthProvider>('AuthProvider');

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  private readonly DEFAULT_OPTIONS: Required<LoginOptions> = {
    // Configurações visuais
    title: 'Login',
    subtitle: 'Entre na sua conta',
    logoUrl: '',
    backgroundUrl: '',
    footerText: '',

    // Funcionalidades
    redirectUrl: '/dashboard',
    showForgotPassword: true,
    showRegisterLink: true,
    passwordMinLength: 6,

    // Links personalizados
    links: {
      forgotPassword: '/forgot-password',
      register: '/register',
      termsOfService: '/terms',
      privacyPolicy: '/privacy'
    },

    // Personalização visual
    theme: 'light',
    primaryColor: '#3b82f6'
  };

  // Estado reativo do login
  private loginState$ = new BehaviorSubject<LoginState>({
    status: LoginStatus.IDLE,
    user: null,
    isAuthenticated: false,
    errors: {},
    lastAttempt: null
  });

  // Configurações atuais
  private currentOptions: Required<LoginOptions> = { ...this.DEFAULT_OPTIONS };

  constructor(
    private authStorage: AuthStorageService,
    @Optional() @Inject(AUTH_PROVIDER) private authProvider?: AuthProvider
  ) {
    this.initializeService();
  }

  /**
   * Observable do estado completo do login
   */
  get state$(): Observable<LoginState> {
    return this.loginState$.asObservable();
  }

  /**
   * Observable apenas do status de loading
   */
  get isLoading$(): Observable<boolean> {
    return this.loginState$.pipe(
      map(state => state.status === LoginStatus.LOADING)
    );
  }

  /**
   * Observable apenas do status de autenticação
   */
  get isAuthenticated$(): Observable<boolean> {
    return this.loginState$.pipe(
      map(state => state.isAuthenticated)
    );
  }

  /**
   * Observable apenas dos erros
   */
  get errors$(): Observable<LoginValidationErrors> {
    return this.loginState$.pipe(
      map(state => state.errors)
    );
  }

  /**
   * Observable do usuário atual
   */
  get currentUser$(): Observable<UserInfo | null> {
    return this.loginState$.pipe(
      map(state => state.user)
    );
  }

  /**
   * Configura opções do serviço de login
   */
  configure(options: Partial<LoginOptions>): void {
    this.currentOptions = { ...this.currentOptions, ...options };
  }

  /**
   * Realiza login com as credenciais fornecidas
   */
  async login(credentials: LoginCredentials): Promise<LoginResponse> {

    // Valida credenciais básicas
    const validationErrors = this.validateCredentials(credentials);
    if (Object.keys(validationErrors).length > 0) {
      this.updateState({
        status: LoginStatus.ERROR,
        errors: validationErrors
      });
      return { success: false, message: 'Dados inválidos', errors: Object.values(validationErrors).flat() };
    }

    // Inicia processo de login
    this.updateState({
      status: LoginStatus.LOADING,
      errors: {}
    });

    try {
      let response: LoginResponse;

      // if (this.authProvider) {
      //   // Usa provider customizado da aplicação
      //   response = await this.authProvider.login(credentials);
      // } else {
      //   // Simula resposta (para desenvolvimento/demo)
      //   response = await this.simulateLogin(credentials);
      // }

      response = await this.simulateLogin(credentials);

      if (response.success && response.accessToken && response.user) {
        // Login bem-sucedido
        await this.handleSuccessfulLogin(response);

        this.updateState({
          status: LoginStatus.SUCCESS,
          user: response.user,
          isAuthenticated: true,
          errors: {}
        });

        // Login bem-sucedido

        return response;
      } else {
        // Login falhou
        await this.handleFailedLogin();

        this.updateState({
          status: LoginStatus.ERROR,
          errors: { general: [response.message || 'Credenciais inválidas'] }
        });

        return response;
      }
    } catch (error) {
      console.error('Erro durante login:', error);

      await this.handleFailedLogin();

      const errorMessage = error instanceof Error ? error.message : 'Erro interno do servidor';

      this.updateState({
        status: LoginStatus.ERROR,
        errors: { general: [errorMessage] }
      });

      return { success: false, message: errorMessage };
    }
  }

  /**
   * Realiza logout
   */
  async logout(): Promise<LogoutResponse> {
    this.updateState({ status: LoginStatus.LOADING });

    try {
      let response: LogoutResponse = { success: true };

      if (this.authProvider?.logout) {
        // Notifica o backend
        response = await this.authProvider.logout();
      }

      // Limpa dados locais independente da resposta do backend
      this.authStorage.clearAuthData();

      this.updateState({
        status: LoginStatus.IDLE,
        user: null,
        isAuthenticated: false,
        errors: {},
        lastAttempt: null
      });

      return response;
    } catch (error) {
      console.error('Erro durante logout:', error);

      // Mesmo com erro, limpa dados locais
      this.authStorage.clearAuthData();

      this.updateState({
        status: LoginStatus.IDLE,
        user: null,
        isAuthenticated: false,
        errors: {}
      });

      return { success: true }; // Sempre considera logout como sucesso localmente
    }
  }


  /**
   * Verifica se o usuário atual está autenticado
   */
  async checkAuthenticationStatus(): Promise<boolean> {
    try {
      const hasToken = await this.authStorage.hasToken();

      if (!hasToken) {
        this.updateState({
          status: LoginStatus.IDLE,
          isAuthenticated: false,
          user: null
        });
        return false;
      }

      // Carrega dados do usuário se autenticado
      const userData = await this.authStorage.getUserData<UserInfo>();

      if (userData) {
        this.updateState({
          status: LoginStatus.SUCCESS,
          isAuthenticated: true,
          user: userData
        });
        return true;
      }

      return false;
    } catch (error) {
      console.error('Erro ao verificar autenticação:', error);
      return false;
    }
  }

  /**
   * Obtém informações do usuário atual
   */
  async getCurrentUser(): Promise<UserInfo | null> {
    return await this.authStorage.getUserData<UserInfo>();
  }

  /**
   * Verifica se token está expirando em breve
   * ⚠️ ATENÇÃO: Agora é assíncrono devido à criptografia
   */
  async isTokenExpiringSoon(minutesThreshold: number = 5): Promise<boolean> {
    return await this.authStorage.isTokenExpiringSoon(minutesThreshold);
  }

  /**
   * Limpa erros do estado atual
   */
  clearErrors(): void {
    this.updateState({ errors: {} });
  }

  /**
   * Reseta estado do login
   */
  async resetLoginState(): Promise<void> {
    this.updateState({
      status: LoginStatus.IDLE,
      errors: {}
    });
  }

  // ========== MÉTODOS PRIVADOS ==========

  /**
   * Inicializa o serviço
   */
  private async initializeService(): Promise<void> {
    // Inicialização simples sem controle de tentativas

    // Verifica autenticação atual
    await this.checkAuthenticationStatus();

    // Monitora mudanças de autenticação
    this.authStorage.authState$.subscribe(isAuthenticated => {
      if (!isAuthenticated && this.loginState$.value.isAuthenticated) {
        // Usuário perdeu autenticação
        this.updateState({
          status: LoginStatus.IDLE,
          user: null,
          isAuthenticated: false
        });
      }
    });
  }

  /**
   * Atualiza estado reativo
   */
  private updateState(updates: Partial<LoginState>): void {
    const currentState = this.loginState$.value;
    this.loginState$.next({
      ...currentState,
      ...updates,
      lastAttempt: updates.status === LoginStatus.LOADING ? new Date() : currentState.lastAttempt
    });
  }

  /**
   * Valida credenciais do formulário
   */
  private validateCredentials(credentials: LoginCredentials): LoginValidationErrors {
    const errors: LoginValidationErrors = {};

    // Validação de email
    if (!credentials.email) {
      errors.email = ['Email é obrigatório'];
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(credentials.email)) {
      errors.email = ['Email deve ter um formato válido'];
    }

    // Validação de senha
    if (!credentials.password) {
      errors.password = ['Senha é obrigatória'];
    } else if (credentials.password.length < 3) {
      errors.password = ['Senha deve ter pelo menos 3 caracteres'];
    }

    return errors;
  }

  /**
   * Trata login bem-sucedido
   */
  private async handleSuccessfulLogin(
    response: LoginResponse
  ): Promise<void> {
    if (!response.accessToken || !response.user) {
      throw new Error('Resposta de login inválida');
    }

    // Salva token
    const expiryMinutes = response.expiresIn || 60; // Default 1 hora
    await this.authStorage.setToken(response.accessToken, expiryMinutes);

    // Salva dados do usuário
    await this.authStorage.setUserData(response.user);

    // Credenciais salvas com sucesso
  }

  /**
   * Trata falha de login
   */
  private async handleFailedLogin(): Promise<void> {
    // Registra falha de login
    console.warn('Tentativa de login falhou');
  }

  /**
   * Simula resposta de login para desenvolvimento/demo
   */
  private async simulateLogin(credentials: LoginCredentials): Promise<LoginResponse> {
    // Simula delay da rede
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Credenciais de demo
    const demoUsers = [
      {
        email: 'admin@demo.com',
        password: 'admin',
        user: {
          id: '1',
          nome: 'Administrador',
          email: 'admin@demo.com',
          perfil: 'ADMIN',
          permissoes: ['TODAS'],
          avatar: 'https://via.placeholder.com/100'
        }
      },
      {
        email: 'professor@demo.com',
        password: 'professor',
        user: {
          id: '2',
          nome: 'Professor Demo',
          email: 'professor@demo.com',
          perfil: 'PROFESSOR',
          permissoes: ['CRIAR_PROVA', 'VER_RESULTADOS'],
          avatar: 'https://via.placeholder.com/100'
        }
      },
      {
        email: 'aluno@demo.com',
        password: 'aluno',
        user: {
          id: '3',
          nome: 'Aluno Demo',
          email: 'aluno@demo.com',
          perfil: 'ALUNO',
          permissoes: ['RESPONDER_PROVA'],
          avatar: 'https://via.placeholder.com/100'
        }
      }
    ];

    const validUser = demoUsers.find(
      user => user.email === credentials.email && user.password === credentials.password
    );

    if (validUser) {
      // Gera token fake
      const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
      const payload = btoa(JSON.stringify({
        sub: validUser.user.id,
        email: validUser.user.email,
        name: validUser.user.nome,
        roles: validUser.user.permissoes,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + (60 * 60) // 1 hora
      }));
      const fakeToken = `${header}.${payload}.fake-signature`;

      return {
        success: true,
        accessToken: fakeToken,
        user: validUser.user,
        expiresIn: 60,
        message: 'Login realizado com sucesso'
      };
    }

    return {
      success: false,
      message: 'Email ou senha incorretos'
    };
  }


}
