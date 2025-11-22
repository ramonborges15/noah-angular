# 🚀 Guia de Uso - Auth Storage Simplificado

## 📋 Configuração no App Principal

### 1. Instalar a Biblioteca
```bash
npm install shared-components
```

### 2. Configurar o Interceptor
```typescript
// src/app/app.config.ts
import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { AuthInterceptor } from 'shared-components';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([
        // Adiciona o interceptor de autenticação
        (req, next) => new AuthInterceptor(inject(AuthStorageService)).intercept(req, { handle: next })
      ])
    )
  ]
};
```

### 3. Ou usando Providers (Angular < 17)
```typescript
// src/app/app.module.ts
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from 'shared-components';

@NgModule({
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }
  ]
})
export class AppModule { }
```

## 🔑 Uso Básico

### Login
```typescript
import { AuthStorageService } from 'shared-components';

@Component({...})
export class LoginComponent {
  constructor(private authStorage: AuthStorageService) {}

  async login(email: string, password: string) {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();
    
    if (data.accessToken) {
      // Backend já validou tudo - apenas salva o token
      await this.authStorage.setToken(data.accessToken, 60);
      await this.authStorage.setUserData(data.user);
      
      this.router.navigate(['/dashboard']);
    }
  }
}
```

### Guard de Autenticação
```typescript
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthStorageService } from 'shared-components';

export const authGuard = () => {
  const authStorage = inject(AuthStorageService);
  const router = inject(Router);

  return authStorage.isAuthenticated().then(isAuth => {
    if (isAuth) {
      return true;
    } else {
      router.navigate(['/login']);
      return false;
    }
  });
};
```

### Exibição de Dados do Usuário
```typescript
@Component({
  template: `
    <div *ngIf="user">
      <h1>Bem-vindo, {{ user.name }}!</h1>
      <p>Email: {{ user.email }}</p>
      <p>Roles: {{ user.roles?.join(', ') }}</p>
    </div>
  `
})
export class HeaderComponent implements OnInit {
  user: any = null;

  constructor(private authStorage: AuthStorageService) {}

  ngOnInit() {
    // Decodifica token APENAS para UI - backend valida segurança
    this.user = this.authStorage.decodeTokenPayload();
  }
}
```

### Estado Reativo de Autenticação
```typescript
@Component({
  template: `
    <ng-container *ngIf="isAuthenticated$ | async; else loginTemplate">
      <app-dashboard></app-dashboard>
    </ng-container>
    
    <ng-template #loginTemplate>
      <app-login></app-login>
    </ng-template>
  `
})
export class AppComponent {
  isAuthenticated$ = this.authStorage.authState$;

  constructor(private authStorage: AuthStorageService) {}
}
```

## ⚠️ Importantes Lembranças

### ✅ O QUE FAZER
- ✅ Use `decodeTokenPayload()` apenas para UI
- ✅ Use `authState$` para reatividade
- ✅ Use `isTokenExpiringSoon()` para UX
- ✅ Deixe o backend validar todas as permissões

### ❌ O QUE NÃO FAZER
- ❌ Nunca tome decisões de segurança baseadas no token decodificado
- ❌ Nunca confie apenas na verificação `isAuthenticated()`
- ❌ Nunca implemente lógica de autorização no frontend

## 🔄 Fluxo de Autenticação

```
1. Login → Backend valida credenciais
2. Backend gera Access Token + Refresh Token
3. Cliente recebe APENAS Access Token
4. Interceptor adiciona token em todas as requisições
5. Backend valida token a cada requisição
6. Se 401 → Backend tenta refresh automaticamente
7. Se refresh falha → Cliente limpa dados e redireciona
```

## 🛡️ Segurança

- **Frontend**: Apenas armazena e envia token
- **Backend**: Faz TODAS as validações de segurança
- **Refresh Token**: SEMPRE no servidor, nunca no cliente
- **Permissões**: SEMPRE validadas no backend

Esta abordagem é **mais simples, mais segura e mais performática**! 🚀