import { Injectable } from '@angular/core';
import { AuthStorageService } from './auth-storage.service';

/**
 * Exemplo de uso dos services simplificados alinhados com backend
 */
@Injectable({
    providedIn: 'root'
})
export class ExampleUsageSimplifiedService {

    constructor(private authStorage: AuthStorageService) { }

    /**
     * 1. Login simplificado - Backend faz todas as validações
     */
    async loginExample() {
        // Usuário faz login e recebe apenas o Access Token
        const loginResponse = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'user@example.com', password: 'password' })
        });

        const data = await loginResponse.json();

        if (data.accessToken) {
            // Salva apenas o Access Token (sem validação no frontend)
            await this.authStorage.setToken(data.accessToken, 60); // 1 hora
            console.log('✅ Login realizado - Token salvo');

            // Salva dados do usuário para UI
            if (data.user) {
                await this.authStorage.setUserData(data.user);
                console.log('✅ Dados do usuário salvos');
            }
        }
    }

    /**
     * 2. Uso de dados do token para UI (sem validação de segurança)
     */
    displayUserInfo() {
        // Decodifica token APENAS para exibição na UI
        const tokenPayload = this.authStorage.decodeTokenPayload();

        if (tokenPayload) {
            console.log('Nome do usuário:', tokenPayload.name);
            console.log('Email:', tokenPayload.email);
            console.log('Roles:', tokenPayload.roles);

            // ⚠️ IMPORTANTE: NUNCA tome decisões de segurança baseadas nestes dados!
            // O backend sempre valida permissões
        }
    }

    /**
     * 3. Verificação de expiração para UX
     */
    async checkTokenExpiration() {
        // Verifica se está próximo de expirar para mostrar aviso na UI
        if (await this.authStorage.isTokenExpiringSoon(10)) { // 10 minutos
            console.log('⚠️ Token expira em breve - mostrar aviso na UI');
            // Mostrar modal ou toast para o usuário
        }
    }

    /**
     * 4. Estado de autenticação para navegação
     */
    async handleNavigation() {
        const isAuthenticated = await this.authStorage.isAuthenticated();

        if (isAuthenticated) {
            console.log('✅ Usuário parece autenticado - permitir navegação');
            // Redirecionar para dashboard
        } else {
            console.log('❌ Sem token - redirecionar para login');
            // Redirecionar para página de login
        }
    }

    /**
     * 5. Logout simplificado
     */
    async logout() {
        // Chama endpoint de logout no backend (limpa Refresh Token do servidor)
        try {
            await fetch('/api/auth/logout', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${await this.authStorage.getToken()}` }
            });
        } catch (error) {
            console.log('Erro no logout do servidor, mas continuando...');
        }

        // Limpa dados do cliente
        this.authStorage.clearAuthData();
        console.log('✅ Logout realizado - dados limpos');
    }

    /**
     * 6. Monitoramento de estado para UI reativa
     */
    observeAuthState() {
        this.authStorage.authState$.subscribe((isAuthenticated: boolean) => {
            if (isAuthenticated) {
                console.log('🔓 Estado: Autenticado');
                // Atualizar UI para usuário logado
                // Carregar dados do usuário
                // Mostrar menu completo
            } else {
                console.log('🔒 Estado: Não autenticado');
                // Atualizar UI para visitante
                // Limpar dados sensíveis da tela
                // Mostrar apenas menu público
            }
        });
    }
}