# Componente de Login

O componente de login fornece uma interface completa de autenticação com recursos avançados de segurança e usabilidade.

## Instalação

```bash
npm install shared-components
```

## Uso Básico

```typescript
import { Component } from '@angular/core';
import { LoginComponent, AuthProvider, LOGIN_OPTIONS } from 'shared-components';

@Component({
  selector: 'app-my-component',
  template: `
    <lib-login
      [options]="loginOptions"
      (loginSuccess)="onLoginSuccess($event)"
      (loginError)="onLoginError($event)">
    </lib-login>
  `,
  imports: [LoginComponent]
})
export class MyComponent {
  loginOptions = {
    title: 'Minha Aplicação',
    subtitle: 'Entre na sua conta',
    showRememberMe: true,
    showForgotPassword: true,
    showRegisterLink: true
  };

  onLoginSuccess(result: any) {
    console.log('Login successful:', result);
    // Redirecionar usuário ou atualizar estado
  }

  onLoginError(error: any) {
    console.error('Login error:', error);
    // Mostrar mensagem de erro
  }
}
```

## Configuração do AuthProvider

O componente requer um serviço que implemente a interface `AuthProvider`:

```typescript
import { Injectable } from '@angular/core';
import { AuthProvider, LoginCredentials, LoginResponse } from 'shared-components';

@Injectable({
  providedIn: 'root'
})
export class MyAuthService implements AuthProvider {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    // Implementar lógica de autenticação
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    
    return response.json();
  }

  async logout(): Promise<LogoutResponse> {
    const response = await fetch('/api/auth/logout', { method: 'POST' });
    return response.json();
  }

  async refreshToken?(): Promise<RefreshTokenResponse> {
    const response = await fetch('/api/auth/refresh', { method: 'POST' });
    return response.json();
  }

  async validateToken?(token: string): Promise<boolean> {
    const response = await fetch('/api/auth/validate', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.ok;
  }
}
```

### Configuração no app.config.ts

```typescript
import { ApplicationConfig } from '@angular/core';
import { AUTH_PROVIDER } from 'shared-components';
import { MyAuthService } from './services/auth.service';

export const appConfig: ApplicationConfig = {
  providers: [
    { provide: AUTH_PROVIDER, useClass: MyAuthService }
  ]
};
```

## Opções do Componente

```typescript
interface LoginOptions {
  // Configurações visuais
  title?: string;
  subtitle?: string;
  logoUrl?: string;
  backgroundUrl?: string;

  // Funcionalidades
  showRememberMe?: boolean;
  showForgotPassword?: boolean;
  showRegisterLink?: boolean;
  showPasswordStrength?: boolean;
  showDemoUsers?: boolean;

  // Segurança
  maxLoginAttempts?: number;
  lockoutDuration?: number; // em milissegundos
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
```

## Eventos

### loginSuccess
Emitido quando o login é realizado com sucesso.

```typescript
onLoginSuccess(result: LoginResponse) {
  // result.accessToken - Token de acesso
  // result.user - Informações do usuário
  // result.expiresIn - Tempo de expiração em minutos
}
```

### loginError
Emitido quando ocorre erro no login.

```typescript
onLoginError(error: any) {
  // error.message - Mensagem do erro
  // error.errors - Array de erros de validação
}
```

## Recursos Avançados

### Proteção contra Tentativas de Login
O componente inclui proteção automática contra múltiplas tentativas de login:
- Conta tentativas falhadas
- Bloqueia temporariamente após limite excedido
- Mostra tempo restante do bloqueio

### Validação de Força da Senha
Avalia automaticamente a força da senha com base em:
- Comprimento mínimo
- Caracteres especiais
- Números e letras
- Combinação de maiúsculas/minúsculas

### Indicadores Visuais
- Loading states durante autenticação
- Mensagens de erro contextuais
- Feedback visual para validações
- Animações suaves

### Acessibilidade
- Labels e descrições para screen readers
- Navegação por teclado completa
- Contraste adequado de cores
- Suporte a tecnologias assistivas

## Usuários de Demonstração

Para desenvolvimento e testes, o componente pode ser configurado com usuários demo:

```typescript
const loginOptions = {
  showDemoUsers: true
};
```

Usuários disponíveis:
- **Admin**: admin@demo.com / admin123
- **Professor**: prof@demo.com / prof123  
- **Estudante**: student@demo.com / student123

## Personalização de Estilos

O componente usa CSS custom properties que podem ser customizadas:

```css
lib-login {
  --login-primary-color: #3b82f6;
  --login-primary-hover: #2563eb;
  --login-background: #f8fafc;
  --login-card-background: #ffffff;
  --login-border-radius: 12px;
}
```

## Integração com Roteamento

```typescript
import { Router } from '@angular/router';

export class LoginPageComponent {
  constructor(private router: Router) {}

  onLoginSuccess(result: LoginResponse) {
    // Redirecionar baseado no perfil do usuário
    const redirectUrl = this.getRedirectUrl(result.user.perfil);
    this.router.navigate([redirectUrl]);
  }

  private getRedirectUrl(perfil: string): string {
    switch (perfil) {
      case 'admin': return '/admin/dashboard';
      case 'professor': return '/professor/dashboard';
      case 'student': return '/student/dashboard';
      default: return '/dashboard';
    }
  }
}
```

## Tratamento de Erros

```typescript
onLoginError(error: any) {
  if (error.status === 429) {
    // Rate limiting
    this.showMessage('Muitas tentativas. Tente novamente mais tarde.');
  } else if (error.status === 401) {
    // Credenciais inválidas
    this.showMessage('Email ou senha incorretos.');
  } else if (error.status === 423) {
    // Conta bloqueada
    this.showMessage('Conta temporariamente bloqueada.');
  } else {
    // Erro genérico
    this.showMessage('Erro no servidor. Tente novamente.');
  }
}
```

## Exemplo Completo

```typescript
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { LoginComponent, LoginResponse } from 'shared-components';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [LoginComponent],
  template: `
    <div class="login-container">
      <lib-login
        [options]="{
          title: 'Sistema Acadêmico',
          subtitle: 'Acesse sua conta institucional',
          logoUrl: '/assets/logo.png',
          showRememberMe: true,
          showForgotPassword: true,
          maxLoginAttempts: 3,
          lockoutDuration: 300000,
          links: {
            forgotPassword: '/auth/forgot-password',
            register: '/auth/register'
          }
        }"
        (loginSuccess)="onLoginSuccess($event)"
        (loginError)="onLoginError($event)">
      </lib-login>
    </div>
  `,
  styles: [`
    .login-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }
  `]
})
export class LoginPageComponent {
  constructor(private router: Router) {}

  onLoginSuccess(result: LoginResponse) {
    console.log('Login successful:', result);
    
    // Salvar token se necessário
    localStorage.setItem('accessToken', result.accessToken || '');
    
    // Redirecionar
    this.router.navigate(['/dashboard']);
  }

  onLoginError(error: any) {
    console.error('Login error:', error);
    // Tratar erro conforme necessário
  }
}
```