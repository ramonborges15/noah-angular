import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginComponent } from 'shared-components';

@Component({
  selector: 'app-login-example',
  standalone: true,
  imports: [CommonModule, LoginComponent],
  template: `
    <div class="container-fluid p-4">
      <div class="row">
        <div class="col-12">
          <div class="card">
            <div class="card-header">
              <h3 class="card-title mb-0">
                <i class="fas fa-sign-in-alt me-2"></i>
                Componente de Login
              </h3>
            </div>
            <div class="card-body">
              <p class="text-muted mb-4">
                Exemplo de uso do componente de login da biblioteca shared-components.
                Este componente fornece uma interface completa de autenticação com recursos avançados.
              </p>

              <!-- Características -->
              <div class="row mb-4">
                <div class="col-md-6">
                  <h5>
                    <i class="fas fa-check-circle text-success me-2"></i>
                    Características
                  </h5>
                  <ul class="list-unstyled">
                    <li><i class="fas fa-shield-alt text-primary me-2"></i> Validação de formulário reativa</li>
                    <li><i class="fas fa-mobile-alt text-primary me-2"></i> Design responsivo</li>
                    <li><i class="fas fa-eye text-primary me-2"></i> Mostrar/ocultar senha</li>
                    <li><i class="fas fa-image text-primary me-2"></i> Background personalizado</li>
                    <li><i class="fas fa-palette text-primary me-2"></i> Estilo padronizado</li>
                  </ul>
                </div>
                <div class="col-md-6">
                  <h5>
                    <i class="fas fa-cog text-info me-2"></i>
                    Configurações Disponíveis
                  </h5>
                  <ul class="list-unstyled">
                    <li><i class="fas fa-palette text-info me-2"></i> Temas personalizáveis</li>
                    <li><i class="fas fa-link text-info me-2"></i> Links personalizados</li>
                    <li><i class="fas fa-image text-info me-2"></i> Logo e branding</li>
                    <li><i class="fas fa-picture-o text-info me-2"></i> Background personalizado</li>
                    <li><i class="fas fa-text-width text-info me-2"></i> Footer customizado</li>
                  </ul>
                </div>
              </div>

              <!-- Configurações Aplicadas -->
              <div class="alert alert-info" role="alert">
                <h6>
                  <i class="fas fa-info-circle me-2"></i>
                  Configurações Aplicadas
                </h6>
                <div class="row">
                  <div class="col-md-6">
                    <strong>Visual:</strong><br>
                    • Título e subtítulo personalizados<br>
                    • Logo placeholder<br>
                    • Imagem de fundo do Unsplash<br>
                    • Footer customizado
                  </div>
                  <div class="col-md-6">
                    <strong>Funcionalidades:</strong><br>
                    • Links "Esqueci senha" e "Criar conta"<br>
                    • Validação de formulário reativa<br>
                    • Design seguindo padrões da biblioteca<br>
                    • Background image responsivo
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Componente de Login -->
      <div class="row mt-4">
        <div class="col-12">
          <div class="card">
            <div class="card-header">
              <h4 class="card-title mb-0">
                <i class="fas fa-desktop me-2"></i>
                Demonstração do Login
              </h4>
            </div>
            <div class="card-body p-0">
              <div style="background: #f8fafc; min-height: 600px;">
                <lib-login
                  [options]="{
                    title: 'Noah Angular',
                    subtitle: 'Sistema de Gestão Acadêmica',
                    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/6/67/Angular_gradient_logo.png',
                    backgroundUrl: 'https://miro.medium.com/v2/resize:fit:1400/1*Olk3bOpkfyVHNVSQopMeUQ.png',
                    footerText: '© 2025 Noah Angular. Todos os direitos reservados.',
                    showForgotPassword: true,
                    showRegisterLink: true,
                    links: {
                      forgotPassword: '/forgot-password',
                      register: '/register'
                    }
                  }"
                  (loginSuccess)="onLoginSuccess($event)"
                  (loginError)="onLoginError($event)">
                </lib-login>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Estado do Login -->
      <div class="row mt-4" *ngIf="loginResult">
        <div class="col-12">
          <div class="card">
            <div class="card-header">
              <h4 class="card-title mb-0">
                <i class="fas fa-code me-2"></i>
                Resultado do Login
              </h4>
            </div>
            <div class="card-body">
              <pre><code>{{ loginResult | json }}</code></pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .container-fluid {
      max-width: 1200px;
    }
    
    pre {
      background: #f8f9fa;
      border: 1px solid #dee2e6;
      border-radius: 0.375rem;
      padding: 1rem;
      font-size: 0.875rem;
    }
    
    code {
      color: #e83e8c;
      background: #f8f9fa;
      padding: 0.2rem 0.4rem;
      border-radius: 0.25rem;
    }
    
    pre code {
      color: inherit;
      background: none;
      padding: 0;
    }
  `]
})
export class LoginExampleComponent {
  loginResult: any = null;

  onLoginSuccess(result: any) {
    console.log('Login successful:', result);
    this.loginResult = {
      type: 'success',
      message: 'Login realizado com sucesso!',
      data: result,
      timestamp: new Date()
    };
  }

  onLoginError(error: any) {
    console.error('Login error:', error);
    this.loginResult = {
      type: 'error',
      message: 'Erro no login',
      error: error,
      timestamp: new Date()
    };
  }
}