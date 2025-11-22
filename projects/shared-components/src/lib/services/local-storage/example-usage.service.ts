import { Injectable } from '@angular/core';
import { LocalStorageService } from './local-storage.service';
import { AuthStorageService } from './auth-storage.service';

/**
 * Exemplo de uso dos services com todas as melhorias aplicadas
 */
@Injectable({
    providedIn: 'root'
})
export class ExampleUsageService {

    constructor(
        private localStorage: LocalStorageService,
        private authStorage: AuthStorageService
    ) {
        this.setupExamples();
    }

    private async setupExamples() {
        try {
            // 1. Uso básico do LocalStorageService
            await this.basicUsageExample();

            // 2. Uso com opções de segurança
            await this.securityOptionsExample();

            // 3. Uso do AuthStorageService
            await this.authServiceExample();

            // 4. Monitoramento de eventos
            this.storageEventsExample();

            // 5. Limpeza e manutenção
            await this.maintenanceExample();

            console.log('✅ Todos os exemplos executados com sucesso!');
        } catch (error) {
            console.error('❌ Erro ao executar exemplos:', error);
        }
    }

    /**
     * 1. Uso básico do LocalStorageService
     */
    private async basicUsageExample() {
        // Salvar dados
        const userData = { name: 'João', age: 30 };
        await this.localStorage.setItem('user', userData);

        // Recuperar dados
        const retrievedUser = await this.localStorage.getItem<typeof userData>('user');
        console.log('Usuário recuperado:', retrievedUser);

        // Verificar se existe
        const hasUser = this.localStorage.hasItem('user');
        console.log('Usuário existe:', hasUser);

        // Usar sessionStorage
        await this.localStorage.setItem('tempData', 'valor temporário', 'sessionStorage');
    }

    /**
     * 2. Uso com opções de segurança
     */
    private async securityOptionsExample() {
        const sensitiveData = { creditCard: '****-****-****-3456' }; // Mascarado para logs

        // Salvar com criptografia
        const saveSuccess = await this.localStorage.setItem('sensitive', sensitiveData, 'localStorage', {
            encrypt: true
        });
        console.log('Dados criptografados salvos:', saveSuccess);

        // Recuperar dados criptografados
        const decryptedData = await this.localStorage.getItem('sensitive', 'localStorage', {
            encrypt: true
        });
        console.log('Dados descriptografados recuperados:', !!decryptedData);

        // Salvar com expiração
        const expirySuccess = await this.localStorage.setItemWithExpiry('tempToken', 'abc123', 30); // 30 minutos
        console.log('Token com expiração salvo:', expirySuccess);

        // Recuperar com verificação de expiração
        const token = await this.localStorage.getItemWithExpiry('tempToken');
        console.log('Token válido:', !!token);
    }

    /**
     * 3. Uso do AuthStorageService SIMPLIFICADO
     */
    private async authServiceExample() {
        // Monitorar estado de autenticação
        this.authStorage.authState$.subscribe((isAuthenticated: boolean) => {
            console.log('Estado de autenticação:', isAuthenticated);
        });

        // Salvar token com expiração (backend já validou tudo)
        const success = await this.authStorage.setToken('jwt-token-here', 60); // 1 hora

        if (success) {
            // Salvar dados do usuário localmente para UI
            const userDataSaved = await this.authStorage.setUserData({
                id: 1,
                name: 'João',
                role: 'admin'
            });
            console.log('Dados do usuário salvos para UI:', userDataSaved);

            // Verificar se token expira em breve (só para UX)
            const isExpiringSoon = await this.authStorage.isTokenExpiringSoon(10); // 10 minutos
            if (isExpiringSoon) {
                console.log('Token expirando em breve - backend fará refresh automático!');
                // Não fazemos refresh no frontend - backend cuida disso
            }
        }
    }

    /**
     * 4. Monitoramento SEGURO de eventos de storage com validação de origem
     */
    private storageEventsExample() {
        // Monitorar alterações de storage com validações de segurança
        this.localStorage.monitorStorageEvents().subscribe((event: StorageEvent) => {
            // CORREÇÃO CRÍTICA: Validar origem e integridade do evento
            if (!this.validateStorageEvent(event)) {
                console.warn('Evento de storage rejeitado por validação de segurança');
                return;
            }

            console.log('Storage alterado legitimamente:', {
                key: event.key,
                hasNewValue: !!event.newValue,
                origin: event.url
            });

            // Só processa eventos de auth se forem da mesma origem E válidos
            if (event.key === 'auth_token' && !event.newValue) {
                // Validação adicional antes de logout
                if (this.shouldTrustLogoutEvent(event)) {
                    console.log('Token removido legitimamente - fazer logout');
                    this.authStorage.clearAuthData();
                } else {
                    console.warn('Tentativa de logout maliciosa bloqueada');
                }
            }
        });
    }

    /**
     * Valida se o evento de storage é legítimo e seguro (VERSÃO MELHORADA)
     */
    private validateStorageEvent(event: StorageEvent): boolean {
        // OBRIGATÓRIO: URL válida e não vazia
        if (!event.url || event.url.trim() === '') {
            console.warn('Evento de storage sem URL válida rejeitado');
            return false;
        }

        try {
            // Verifica origem exata
            const eventOrigin = new URL(event.url).origin;
            const currentOrigin = window.location.origin;

            if (eventOrigin !== currentOrigin) {
                console.warn('Evento de origem diferente rejeitado:', eventOrigin);
                return false;
            }
        } catch (error) {
            console.warn('URL inválida no evento de storage:', error);
            return false;
        }

        // Validação rigorosa de chave
        if (event.key) {
            // Bloqueia chaves perigosas
            const dangerousKeys = ['__proto__', 'constructor', 'prototype', 'toString', 'valueOf'];
            if (dangerousKeys.includes(event.key)) {
                console.warn('Chave perigosa rejeitada:', event.key);
                return false;
            }

            // Apenas caracteres seguros
            if (!/^[a-zA-Z0-9_]+$/.test(event.key)) {
                console.warn('Chave com caracteres inválidos rejeitada:', event.key);
                return false;
            }

            // Limita tamanho da chave
            if (event.key.length > 30) {
                console.warn('Chave muito longa rejeitada');
                return false;
            }
        }

        // Rate limiting aprimorado
        const eventTime = Date.now();
        if (!this.lastEventTime) {
            this.lastEventTime = eventTime;
            return true;
        }

        // Máximo 20 eventos por segundo
        if (eventTime - this.lastEventTime < 50) {
            console.warn('Rate limit de eventos excedido');
            return false;
        }

        this.lastEventTime = eventTime;
        return true;
    }

    /**
     * Validação adicional específica para eventos de logout (MELHORADA)
     */
    private shouldTrustLogoutEvent(event: StorageEvent): boolean {
        // Deve ser uma remoção real (null)
        if (event.newValue !== null) {
            console.warn('Evento de logout suspeito - newValue não é null');
            return false;
        }

        // Valor anterior deve parecer um token válido
        if (!event.oldValue || typeof event.oldValue !== 'string') {
            console.warn('Evento de logout suspeito - oldValue inválido');
            return false;
        }

        // Token deve ter tamanho mínimo razoável
        if (event.oldValue.length < 20) {
            console.warn('Evento de logout suspeito - oldValue muito curto');
            return false;
        }

        // Verificação adicional: valor anterior deve parecer JSON válido
        try {
            const parsed = JSON.parse(event.oldValue);
            if (!parsed.value || typeof parsed.value !== 'string') {
                console.warn('Evento de logout suspeito - estrutura inválida');
                return false;
            }
        } catch {
            console.warn('Evento de logout suspeito - JSON inválido');
            return false;
        }

        // Timestamp do evento não deve ser muito antigo (previne replay attacks)
        const now = Date.now();
        if (this.lastEventTime && (now - this.lastEventTime) > 10000) { // 10 segundos
            console.warn('Evento de logout muito antigo - possível replay');
            return false;
        }

        return true;
    }

    // Variável para controle temporal de eventos
    private lastEventTime: number = 0;

    /**
     * 5. Limpeza e manutenção
     */
    private async maintenanceExample() {
        // Limpar itens expirados
        const cleanedCount = await this.localStorage.cleanExpiredItems();
        console.log(`${cleanedCount} itens expirados removidos`);

        // Verificar tamanho do storage
        const storageSize = this.localStorage.getStorageSize();
        console.log(`Tamanho do storage: ${storageSize} bytes`);

        // Fazer backup
        const backup = this.localStorage.backup();
        console.log('Backup criado:', Object.keys(backup).length, 'itens');

        // Verificar disponibilidade do storage
        this.localStorage.storageAvailable$.subscribe((available: boolean) => {
            if (!available) {
                console.warn('Storage não disponível - modo privado?');
            }
        });
    }

    /**
     * REMOVIDO: Refresh de token (backend faz automaticamente)
     * Em caso de token expirado, backend retorna 401 e interceptor limpa dados
     */
    private handleTokenExpiry() {
        console.log('Token expirado - backend gerencia refresh automaticamente');
        console.log('Se 401 ocorrer, interceptor limpará dados e redirecionará');
        // Não fazemos refresh manual - arquitectura backend-first
    }

    /**
     * Método para logout completo
     */
    logout() {
        this.authStorage.clearAuthData();
        console.log('Logout realizado, dados limpos');
    }

    /**
     * Método para verificar dados do token (só para UI)
     */
    async checkTokenInfo() {
        const tokenData = this.authStorage.decodeTokenPayload();

        if (tokenData) {
            console.log('Dados do token para UI:', {
                userId: tokenData.sub,
                expiresAt: new Date(tokenData.exp * 1000),
                roles: tokenData.roles
            });
        } else {
            console.log('Nenhum token encontrado');
        }
    }

    /**
     * Exemplo público de login seguro
     */
    async secureLogin(jwtToken: string, userData: any): Promise<boolean> {
        try {
            // Salvar token de forma segura
            const tokenSaved = await this.authStorage.setToken(jwtToken, 60);

            if (tokenSaved) {
                // Salvar dados do usuário
                const userDataSaved = await this.authStorage.setUserData(userData);

                if (userDataSaved) {
                    console.log('✅ Login realizado com sucesso');
                    return true;
                }
            }

            console.error('❌ Falha ao salvar dados de login');
            return false;
        } catch (error) {
            console.error('❌ Erro durante login:', error);
            return false;
        }
    }

    /**
     * Exemplo público de manipulação segura de dados sensíveis
     */
    async handleSensitiveData(data: any): Promise<boolean> {
        try {
            // Salvar dados criptografados
            const saved = await this.localStorage.setItem('sensitive_data', data, 'sessionStorage', {
                encrypt: true
            });

            if (saved) {
                // Recuperar dados descriptografados
                const retrieved = await this.localStorage.getItem('sensitive_data', 'sessionStorage', {
                    encrypt: true
                });

                console.log('✅ Dados sensíveis manipulados com segurança');
                return retrieved !== null;
            }

            return false;
        } catch (error) {
            console.error('❌ Erro ao manipular dados sensíveis:', error);
            return false;
        }
    }

    /**
     * Exemplo de verificação periódica de expiração do token (só UX)
     */
    startTokenExpirationCheck(): void {
        setInterval(async () => {
            const isExpiringSoon = await this.authStorage.isTokenExpiringSoon(5);

            if (isExpiringSoon) {
                console.warn('⚠️ Token expirando em breve');
                console.log('Backend fará refresh automático ou retornará 401');
                // Não fazemos refresh manual - interceptor cuida dos 401s
            }
        }, 60000); // Verifica a cada minuto
    }
}