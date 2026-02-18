import { Component, OnInit, OnDestroy, Input, Output, EventEmitter, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { LoginService } from '../../services/login/login.service';
import {
  LoginCredentials,
  LoginResponse,
  LoginStatus,
  LoginState,
  LoginOptions
} from '../../types/auth.types';

@Component({
  selector: 'lib-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private fb = inject(FormBuilder);

  // Configurações do componente
  @Input() options: Partial<LoginOptions> = {};
  @Input() showHeader: boolean = true;
  @Input() showFooter: boolean = true;
  @Input() logoUrl?: string;
  @Input() backgroundImageUrl?: string;
  @Input() customCssClass?: string;

  // Eventos
  @Output() loginSuccess = new EventEmitter<LoginResponse>();
  @Output() loginError = new EventEmitter<string>();
  @Output() formChange = new EventEmitter<LoginCredentials>();

  // Estado do componente
  loginForm!: FormGroup;
  loginState$!: import('rxjs').Observable<LoginState>;
  isLoading$!: import('rxjs').Observable<boolean>;
  errors$!: import('rxjs').Observable<any>;

  // Estados locais
  showPassword = false;
  LoginStatus = LoginStatus; // Para usar no template

  constructor(private loginService: LoginService) {
    this.createForm();
    this.initializeObservables();
  }

  /**
   * Inicializa os observables
   */
  private initializeObservables(): void {
    this.loginState$ = this.loginService.state$;
    this.isLoading$ = this.loginService.isLoading$;
    this.errors$ = this.loginService.errors$;
  }

  ngOnInit(): void {
    // Configura opções do serviço
    if (this.options) {
      this.loginService.configure(this.options);
    }

    // Monitora mudanças do estado
    this.loginState$
      .pipe(takeUntil(this.destroy$))
      .subscribe(state => this.handleStateChange(state));

    // Monitora mudanças do formulário
    this.loginForm.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(value => {
        this.formChange.emit(value as LoginCredentials);
      });

    // Limpa erros quando usuário começa a digitar
    this.loginForm.get('email')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.loginService.clearErrors());

    this.loginForm.get('password')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.loginService.clearErrors());
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Cria o formulário reativo
   */
  private createForm(): void {
    this.loginForm = this.fb.group({
      email: ['', [
        Validators.required,
        Validators.email,
        Validators.maxLength(255)
      ]],
      password: ['', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(100)
      ]]
    });
  }

  /**
   * Manipula mudanças de estado do login
   */
  private handleStateChange(state: LoginState): void {
    if (state.status === LoginStatus.SUCCESS && state.user) {
      this.loginSuccess.emit({
        success: true,
        user: state.user,
        accessToken: '', // Não expor token no evento
        message: 'Login realizado com sucesso'
      });
    }

    if (state.status === LoginStatus.ERROR && state.errors.general) {
      this.loginError.emit(state.errors.general[0]);
    }
  }

  /**
   * Submete o formulário de login
   */
  async onSubmit(): Promise<void> {
    if (this.loginForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    const credentials = this.loginForm.value as LoginCredentials;

    try {
      const response = await this.loginService.login(credentials);

      if (!response.success) {
        // Erro já tratado pelo serviço via observable
        console.warn('Login falhou:', response.message);
      }
    } catch (error) {
      console.error('Erro no componente de login:', error);
    }
  }

  /**
   * Alterna visibilidade da senha
   */
  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }



  /**
   * Marca todos os campos como tocados para mostrar erros
   */
  private markFormGroupTouched(): void {
    Object.keys(this.loginForm.controls).forEach(key => {
      const control = this.loginForm.get(key);
      control?.markAsTouched();
    });
  }

  /**
   * Verifica se campo tem erro específico
   */
  hasFieldError(fieldName: string, errorType: string): boolean {
    const field = this.loginForm.get(fieldName);
    return !!(field?.hasError(errorType) && (field?.dirty || field?.touched));
  }

  /**
   * Obtém mensagem de erro do campo
   */
  getFieldErrorMessage(fieldName: string): string {
    const field = this.loginForm.get(fieldName);

    if (!field || !field.errors || (!field.dirty && !field.touched)) {
      return '';
    }

    const errors = field.errors;

    if (errors['required']) {
      return `${this.getFieldLabel(fieldName)} é obrigatório`;
    }

    if (errors['email']) {
      return 'Email deve ter um formato válido';
    }

    if (errors['minlength']) {
      return `${this.getFieldLabel(fieldName)} deve ter pelo menos ${errors['minlength'].requiredLength} caracteres`;
    }

    if (errors['maxlength']) {
      return `${this.getFieldLabel(fieldName)} deve ter no máximo ${errors['maxlength'].requiredLength} caracteres`;
    }

    return 'Campo inválido';
  }

  /**
   * Obtém label do campo
   */
  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      email: 'Email',
      password: 'Senha'
    };
    return labels[fieldName] || fieldName;
  }

  /**
   * Reseta o formulário
   */
  resetForm(): void {
    this.loginForm.reset();
    this.showPassword = false;
    this.loginService.clearErrors();
  }

  /**
   * Tenta fazer login com credenciais de demonstração
   */
  async loginWithDemo(userType: 'admin' | 'professor' | 'aluno'): Promise<void> {
    const demoCredentials: { [key: string]: LoginCredentials } = {
      admin: {
        email: 'admin@demo.com',
        password: 'admin'
      },
      professor: {
        email: 'professor@demo.com',
        password: 'professor'
      },
      aluno: {
        email: 'aluno@demo.com',
        password: 'aluno'
      }
    };

    const credentials = demoCredentials[userType];
    if (credentials) {
      // Preenche formulário
      this.loginForm.patchValue(credentials);

      // Executa login
      await this.onSubmit();
    }
  }

  /**
   * Manipula esqueci minha senha
   */
  onForgotPassword(): void {
    // Implementação específica da aplicação
    console.log('Forgot password clicked');
  }

  /**
   * Manipula criação de conta
   */
  onCreateAccount(): void {
    // Implementação específica da aplicação
    console.log('Create account clicked');
  }
}
