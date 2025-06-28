# NoahAngular

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 19.2.3.

É uma excelente ideia criar um projeto Angular reutilizável para componentes de UI, gestão de cookies e uma tela de login! Usar componentes *standalone* é a abordagem moderna e simplificada, perfeita para bibliotecas reutilizáveis.

Vamos detalhar como você pode estruturar e desenvolver esse projeto:


## Estrutura do Projeto e Reusabilidade

Para criar um projeto Angular que seja facilmente reutilizável, a melhor abordagem é transformá-lo em uma **biblioteca Angular (Angular Library)**. Isso permite que você empacote seus componentes, serviços e módulos em um formato que pode ser instalado e importado em outros projetos Angular via npm.

## Como importar no meu projeto

1. Precisa ter instalado "@popperjs/core", "bootstrap" e "material-icons".
2. Precisa configurar o `angular.json` para incluir os estilos e scripts do Bootstrap:
```json
  "builder": "@angular-devkit/build-angular:application",
  "options": {
    "outputPath": "dist/demo-app",
    "index": "projects/demo-app/src/index.html",
    "browser": "projects/demo-app/src/main.ts",
    "polyfills": [
      "zone.js"
    ],
    "tsConfig": "projects/demo-app/tsconfig.app.json",
    "inlineStyleLanguage": "scss",
    "assets": [
      {
        "glob": "**/*",
        "input": "projects/demo-app/public"
      }
    ],
    "styles": [
      "node_modules/bootstrap/dist/css/bootstrap.min.css",
      "node_modules/material-icons/iconfont/material-icons.css",
      "projects/demo-app/src/styles.scss"
    ],
    "scripts": [
      "node_modules/bootstrap/dist/js/bootstrap.bundle.min.js"
    ]
  },
```

### Passos para Criar sua Biblioteca Angular

1.  **Crie um Novo Workspace Angular (se ainda não tiver um):**
    ```bash
    ng new my-reusable-project --no-create-application
    ```
    O `--no-create-application` cria um workspace vazio, ideal para bibliotecas.

2.  **Adicione a Biblioteca ao seu Workspace:**
    ```bash
    cd my-reusable-project
    ng generate library ui-library
    ```
    Substitua `ui-library` pelo nome que você deseja dar à sua biblioteca (por exemplo, `shared-components`, `core-ui`, etc.). Isso irá gerar a estrutura básica da sua biblioteca dentro da pasta `projects/ui-library`.

3.  **Desenvolvimento dos Componentes e Serviços:**
    Dentro de `projects/ui-library/src/lib/`, você irá criar seus componentes, serviços e outros recursos.

    * **Componentes de UI:** Crie seus componentes *standalone* aqui.
        ```bash
        ng generate component my-button --standalone --project=ui-library
        ng generate component custom-input --standalone --project=ui-library
        ```
    * **Serviço de Gestão de Cookies:**
        ```bash
        ng generate service cookie-manager --project=ui-library
        ```
    * **Componente de Tela de Login:**
        ```bash
        ng generate component login-screen --standalone --project=ui-library
        ```

4.  **Exporte os Recursos da Biblioteca:**
    Para que outros projetos possam usar seus componentes e serviços, você precisa exportá-los no arquivo `projects/ui-library/src/public-api.ts`.
    ```typescript
    /*
     * Public API Surface of ui-library
     */

    export * from './lib/ui-library.service'; // Se você tiver um serviço principal
    export * from './lib/ui-library.component'; // Se você tiver um componente principal
    export * from './lib/components/my-button/my-button.component'; // Exemplo
    export * from './lib/components/custom-input/custom-input.component'; // Exemplo
    export * from './lib/services/cookie-manager/cookie-manager.service'; // Exemplo
    export * from './lib/components/login-screen/login-screen.component'; // Exemplo
    ```

5.  **Compilar e Publicar a Biblioteca:**
    ```bash
    ng build ui-library
    ```
    Isso irá compilar sua biblioteca para a pasta `dist/ui-library`. A partir daqui, você pode:
    * **Publicar no npm:** Se for uma biblioteca pública ou privada via npm.
        ```bash
        cd dist/ui-library
        npm publish
        ```
    * **Usar Localmente:** Em outros projetos Angular na sua máquina, você pode instalar a biblioteca localmente:
        ```bash
        npm install path/to/my-reusable-project/dist/ui-library
        ```
        Ou, para desenvolvimento, usar `npm link` na pasta `dist/ui-library` e depois `npm link ui-library` (substitua `ui-library` pelo nome do pacote) no outro projeto.

---

## Implementação dos Componentes e Serviços

### 1. Componentes de UI (Standalone)

Ao gerar um componente com `--standalone`, ele não precisa ser declarado em um `NgModule`. Você apenas o importa diretamente onde for usá-lo.

**Exemplo: `my-button.component.ts`**
```typescript
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common'; // Importe CommonModule para ngIf, ngFor etc.

@Component({
  selector: 'lib-my-button',
  standalone: true,
  imports: [CommonModule], // Importe módulos necessários
  template: `
    <button [ngClass]="buttonClass" (click)="onClick.emit()">
      {{ label }}
    </button>
  `,
  styles: [`
    button {
      padding: 10px 20px;
      border: none;
      border-radius: 5px;
      cursor: pointer;
    }
    .primary { background-color: blue; color: white; }
    .secondary { background-color: gray; color: white; }
  `]
})
export class MyButtonComponent {
  @Input() label: string = 'Click Me';
  @Input() type: 'primary' | 'secondary' = 'primary';
  @Output() onClick = new EventEmitter<void>();

  get buttonClass(): string {
    return this.type;
  }
}
```

**Como usar em outro projeto:**
```typescript
import { MyButtonComponent } from 'ui-library'; // Importe da sua biblioteca

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [MyButtonComponent], // Importe o componente standalone
  template: `
    <lib-my-button label="Meu Botão" type="primary" (onClick)="handleButtonClick()"></lib-my-button>
  `,
})
export class AppComponent {
  handleButtonClick() {
    console.log('Botão clicado!');
  }
}
```

---

### 2. Gestão de Cookies (Serviço)

Crie um serviço para encapsular a lógica de gestão de cookies. Isso garante que a forma como você interage com cookies seja consistente em toda a sua aplicação e projetos.

**Exemplo: `cookie-manager.service.ts`**
```typescript
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root' // Disponível em toda a aplicação
})
export class CookieManagerService {
  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  /**
   * Salva um cookie.
   * @param name Nome do cookie.
   * @param value Valor do cookie.
   * @param days Validade em dias (opcional).
   */
  setCookie(name: string, value: string, days?: number): void {
    if (!this.isBrowser) {
      return;
    }

    let expires = '';
    if (days) {
      const date = new Date();
      date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
      expires = `; expires=${date.toUTCString()}`;
    }
    document.cookie = `${name}=${value || ''}${expires}; path=/`;
  }

  /**
   * Obtém o valor de um cookie.
   * @param name Nome do cookie.
   * @returns Valor do cookie ou null se não encontrado.
   */
  getCookie(name: string): string | null {
    if (!this.isBrowser) {
      return null;
    }

    const nameEQ = name + '=';
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') {
        c = c.substring(1, c.length);
      }
      if (c.indexOf(nameEQ) === 0) {
        return c.substring(nameEQ.length, c.length);
      }
    }
    return null;
  }

  /**
   * Remove um cookie.
   * @param name Nome do cookie a ser removido.
   */
  deleteCookie(name: string): void {
    if (!this.isBrowser) {
      return;
    }
    document.cookie = `${name}=; Max-Age=-99999999;`; // Define uma data de expiração no passado
  }

  /**
   * Limpa todos os cookies (exemplo, cuidado ao usar em produção).
   */
  clearAllCookies(): void {
    if (!this.isBrowser) {
      return;
    }
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i];
      const eqPos = cookie.indexOf('=');
      const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
      this.deleteCookie(name.trim());
    }
  }
}
```

**Observações:**
* **SSR (Server-Side Rendering):** O serviço inclui o `PLATFORM_ID` para verificar se o código está sendo executado no navegador. Isso é crucial para evitar erros se você usar SSR, já que `document` não existe no ambiente do servidor.
* **`providedIn: 'root'`:** Torna o serviço um *singleton* disponível em toda a aplicação que o importar.

**Como usar em outro projeto:**
```typescript
import { Component } from '@angular/core';
import { CookieManagerService } from 'ui-library'; // Importe o serviço

@Component({
  selector: 'app-home',
  standalone: true,
  template: `
    <button (click)="saveToken()">Salvar Token</button>
    <button (click)="getToken()">Obter Token</button>
    <button (click)="clearToken()">Limpar Token</button>
  `,
})
export class HomeComponent {
  constructor(private cookieManager: CookieManagerService) {}

  saveToken() {
    this.cookieManager.setCookie('authToken', 'mySecretToken123', 7); // Expira em 7 dias
    console.log('Token salvo!');
  }

  getToken() {
    const token = this.cookieManager.getCookie('authToken');
    console.log('Token:', token);
  }

  clearToken() {
    this.cookieManager.deleteCookie('authToken');
    console.log('Token limpo!');
  }
}
```

---

### 3. Tela de Login (Componente Standalone)

A tela de login é um componente mais complexo que geralmente envolve formulários, validação e comunicação com um serviço de autenticação.

**Exemplo: `login-screen.component.ts`**
```typescript
import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';

// Importe o serviço de cookie manager para uso direto no componente, se necessário
import { CookieManagerService } from '../../services/cookie-manager/cookie-manager.service';

// Mock de um serviço de autenticação, você substituiria isso pela sua API real
import { AuthService } from '../../services/auth/auth.service'; // Crie este serviço na sua biblioteca

@Component({
  selector: 'lib-login-screen',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="login-container">
      <h2>Login</h2>
      <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
        <div class="form-group">
          <label for="username">Usuário:</label>
          <input id="username" type="text" formControlName="username" />
          <div *ngIf="loginForm.get('username')?.invalid && loginForm.get('username')?.touched" class="error">
            Usuário é obrigatório.
          </div>
        </div>

        <div class="form-group">
          <label for="password">Senha:</label>
          <input id="password" type="password" formControlName="password" />
          <div *ngIf="loginForm.get('password')?.invalid && loginForm.get('password')?.touched" class="error">
            Senha é obrigatória e deve ter pelo menos 6 caracteres.
          </div>
        </div>

        <button type="submit" [disabled]="loginForm.invalid">Entrar</button>

        <div *ngIf="errorMessage" class="error-message">
          {{ errorMessage }}
        </div>
      </form>
    </div>
  `,
  styles: [`
    .login-container { /* Estilos para o container */ }
    .form-group { /* Estilos para grupos de formulário */ }
    .error { color: red; font-size: 0.8em; }
    .error-message { color: red; margin-top: 10px; }
  `]
})
export class LoginScreenComponent {
  loginForm: FormGroup;
  errorMessage: string | null = null;

  @Output() loginSuccess = new EventEmitter<void>();
  @Output() loginFailed = new EventEmitter<string>();

  constructor(
    private authService: AuthService,
    private cookieManager: CookieManagerService // Exemplo de uso
  ) {
    this.loginForm = new FormGroup({
      username: new FormControl('', Validators.required),
      password: new FormControl('', [Validators.required, Validators.minLength(6)])
    });
  }

  async onSubmit() {
    this.errorMessage = null;
    if (this.loginForm.valid) {
      const { username, password } = this.loginForm.value;
      try {
        const response = await this.authService.login(username, password);
        // Supondo que a resposta inclua um token
        if (response && response.token) {
          this.cookieManager.setCookie('authToken', response.token, 7); // Salva o token
          this.loginSuccess.emit();
        } else {
          this.errorMessage = 'Erro de autenticação desconhecido.';
          this.loginFailed.emit(this.errorMessage);
        }
      } catch (error: any) {
        this.errorMessage = error.message || 'Falha ao fazer login. Tente novamente.';
        this.loginFailed.emit(this.errorMessage);
      }
    } else {
      this.loginForm.markAllAsTouched(); // Marca todos os campos como tocados para exibir erros
      this.errorMessage = 'Por favor, preencha todos os campos obrigatórios.';
    }
  }
}
```

**Observações:**
* **`ReactiveFormsModule`:** Essencial para formulários reativos.
* **Serviço de Autenticação:** Você precisará criar um serviço `AuthService` dentro da sua biblioteca para lidar com a lógica de chamada de API para login. Este serviço *não* será standalone, mas sim `providedIn: 'root'`.
* **Eventos de Saída:** `loginSuccess` e `loginFailed` permitem que o componente pai reaja ao resultado da tentativa de login.
* **Validação:** Validação básica com `Validators.required` e `Validators.minLength`.

**Como usar em outro projeto:**
```typescript
import { Component } from '@angular/core';
import { LoginScreenComponent } from 'ui-library'; // Importe o componente

@Component({
  selector: 'app-auth-page',
  standalone: true,
  imports: [LoginScreenComponent],
  template: `
    <lib-login-screen
      (loginSuccess)="onLoginSuccess()"
      (loginFailed)="onLoginFailed($event)">
    </lib-login-screen>
  `,
})
export class AuthPageComponent {
  onLoginSuccess() {
    console.log('Login bem-sucedido! Redirecionando...');
    // Lógica para redirecionar o usuário
  }

  onLoginFailed(error: string) {
    console.error('Login falhou:', error);
    // Lógica para exibir mensagens de erro para o usuário
  }
}
```

---

## Considerações Importantes

* **Testes:** Crie testes unitários para seus componentes e serviços para garantir que funcionem corretamente e permaneçam estáveis com o tempo.
* **Documentação:** Documente sua biblioteca! Explique como instalar, como usar cada componente e serviço, e quais são as propriedades de entrada (`@Input()`) e eventos de saída (`@Output()`). Ferramentas como o Compodoc podem ajudar a gerar documentação automaticamente.
* **Versionamento Semântico:** Ao publicar sua biblioteca, use versionamento semântico (MAJOR.MINOR.PATCH) para indicar mudanças.
* **Estilos:** Pense em como você vai gerenciar os estilos. Você pode incluir os estilos nos próprios componentes ou ter um arquivo de estilos global que a biblioteca exporta. Para reusabilidade máxima, pode ser melhor que os componentes tenham estilos básicos e permitam fácil *override* via classes CSS ou *inputs* de estilo.
* **Internacionalização (i18n):** Se você planeja que sua biblioteca seja usada em diferentes idiomas, considere implementar i18n desde o início.
* **Acessibilidade (a11y):** Certifique-se de que seus componentes de UI sejam acessíveis (usando ARIA, foco, etc.).

Ao seguir essas diretrizes, você estará bem no caminho para criar uma biblioteca Angular reutilizável e robusta, que economizará muito tempo e esforço em seus futuros projetos!