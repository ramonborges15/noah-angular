import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { LocalStorageService } from './local-storage.service';

@Injectable({
    providedIn: 'root'
})
export class AuthStorageService {
    private readonly TOKEN_KEY = 'access_token';
    private readonly USER_DATA_KEY = 'user_data';

    // Observable para monitorar estado de autenticação
    private isAuthenticated$ = new BehaviorSubject<boolean>(false);

    get authState$(): Observable<boolean> {
        return this.isAuthenticated$.asObservable();
    }

    constructor(private storage: LocalStorageService) {
        // Inicializa o estado de autenticação de forma assíncrona
        this.initAuthState();
    }

    private async initAuthState(): Promise<void> {
        const hasToken = await this.hasToken();
        this.isAuthenticated$.next(hasToken);
    }

    /**
     * Salva Access Token COM CRIPTOGRAFIA (backend fará todas as validações)
     */
    async setToken(token: string, expiryInMinutes: number = 60): Promise<boolean> {
        if (!token || token.trim().length === 0) {
            return false;
        }

        // 🔐 SEMPRE criptografar tokens para máxima segurança
        // Criamos estrutura com expiração manualmente para usar criptografia
        const now = new Date();
        const item = {
            value: token,
            expiry: now.getTime() + (expiryInMinutes * 60 * 1000)
        };

        const success = await this.storage.setItem(
            this.TOKEN_KEY,
            item,
            'localStorage',
            { encrypt: true }
        );

        if (success) {
            this.isAuthenticated$.next(true);
        }
        return success;
    }

    /**
     * Recupera Access Token COM DESCRIPTOGRAFIA e validação de expiração
     */
    async getToken(): Promise<string | null> {
        try {
            // 🔓 SEMPRE descriptografar tokens
            const item = await this.storage.getItem<{ value: string, expiry: number }>(
                this.TOKEN_KEY,
                'localStorage',
                { encrypt: true }
            );

            if (!item || !item.value) {
                this.isAuthenticated$.next(false);
                return null;
            }

            // Verificar expiração
            const now = Date.now();
            if (item.expiry && now > item.expiry) {
                // Token expirado - remover
                this.storage.removeItem(this.TOKEN_KEY, 'localStorage');
                this.isAuthenticated$.next(false);
                return null;
            }

            return item.value;
        } catch (error) {
            console.warn('Erro ao recuperar token criptografado:', error);
            this.isAuthenticated$.next(false);
            return null;
        }
    }

    // REMOVIDO: Refresh Token methods - ficam no servidor
    // O backend gerencia refresh automaticamente via interceptors

    /**
     * Salva dados do usuário COM CRIPTOGRAFIA e validação básica
     */
    async setUserData(userData: any): Promise<boolean> {
        if (!userData || typeof userData !== 'object') {
            return false;
        }

        // Validação básica de tamanho
        try {
            const serialized = JSON.stringify(userData);
            if (serialized.length > 100000) { // 100KB limite
                return false;
            }
        } catch {
            return false;
        }

        // 🔐 SEMPRE criptografar dados do usuário também
        return await this.storage.setItem(
            this.USER_DATA_KEY,
            userData,
            'localStorage',
            { encrypt: true }
        );
    }

    /**
     * Recupera dados do usuário COM DESCRIPTOGRAFIA
     */
    async getUserData<T = any>(): Promise<T | null> {
        try {
            // 🔓 SEMPRE descriptografar dados do usuário
            return await this.storage.getItem<T>(
                this.USER_DATA_KEY,
                'localStorage',
                { encrypt: true }
            );
        } catch (error) {
            console.warn('Erro ao recuperar dados do usuário criptografados:', error);
            return null;
        }
    }

    /**
     * Verifica apenas se possui token (backend validará se é válido)
     */
    async hasToken(): Promise<boolean> {
        const token = await this.getToken();
        return !!token && token.length > 0;
    }

    /**
     * Verifica se está "aparentemente" autenticado (token existe)
     */
    async isAuthenticated(): Promise<boolean> {
        return await this.hasToken();
    }

    /**
     * Limpa APENAS dados do cliente (não afeta refresh token no servidor)
     */
    clearAuthData(): void {
        this.storage.removeItem(this.TOKEN_KEY, 'sessionStorage');
        this.storage.removeItem(this.TOKEN_KEY, 'localStorage');
        this.storage.removeItem(this.USER_DATA_KEY, 'sessionStorage');
        this.storage.removeItem(this.USER_DATA_KEY, 'localStorage');

        this.isAuthenticated$.next(false);
    }

    /**
     * Decodifica payload do JWT (SEM validação - apenas para UI)
     * IMPORTANTE: Use apenas para exibição, nunca para lógica de segurança
     * 
     * ⚠️ ATENÇÃO: Agora requer token como parâmetro ou uso assíncrono
     */
    decodeTokenPayload(token?: string): any {
        try {
            // Se não foi passado token, não podemos usar getTokenSync (descontinuado)
            if (!token) {
                console.warn(
                    '⚠️ decodeTokenPayload(): Passe o token como parâmetro ou use ' +
                    'await getToken() primeiro, pois tokens são criptografados.'
                );
                return null;
            }

            const jwt = token;
            if (!jwt || typeof jwt !== 'string') return null;

            // Validação básica do formato JWT
            const parts = jwt.split('.');
            if (parts.length !== 3) return null;

            // Validação base64url
            const base64UrlPattern = /^[A-Za-z0-9_-]+$/;
            if (!base64UrlPattern.test(parts[1])) return null;

            // Validação de tamanho razoável
            if (parts[1].length > 10000) return null;

            const payload = parts[1];
            const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));

            // Parse seguro com proteção contra prototype pollution
            return JSON.parse(decoded, (key, value) => {
                if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
                    return undefined;
                }
                return value;
            });
        } catch (error) {
            console.warn('Erro ao decodificar token para UI:', error);
            return null;
        }
    }

    /**
     * Versão síncrona DESATUALIZADA (tokens agora são criptografados)
     * ⚠️ AVISO: Esta versão não funciona mais com tokens criptografados
     * Use getToken() async para acessar tokens de forma segura
     */
    private getTokenSync(): string | null {
        console.warn(
            '⚠️ getTokenSync() DESCONTINUADO: Tokens agora são criptografados. ' +
            'Use getToken() async para descriptografia segura.'
        );

        // Não é possível descriptografar sincronamente
        // A criptografia AES-GCM requer operações assíncronas
        return null;
    }

    /**
     * Verifica se token está próximo de expirar (para UI)
     * ⚠️ ATENÇÃO: Agora é assíncrono devido à criptografia
     */
    async isTokenExpiringSoon(minutesThreshold: number = 5): Promise<boolean> {
        try {
            const token = await this.getToken();
            if (!token) return true;

            const tokenData = this.decodeTokenPayload(token);
            if (!tokenData || !tokenData.exp) return true;

            const now = Math.floor(Date.now() / 1000);
            const timeUntilExpiry = tokenData.exp - now;
            return timeUntilExpiry < (minutesThreshold * 60);
        } catch (error) {
            console.warn('Erro ao verificar expiração do token:', error);
            return true; // Em caso de erro, assumir que está expirando
        }
    }

    /**
     * Método utilitário: Obtém e decodifica token em uma operação
     * Ideal para componentes que precisam dos dados do token para UI
     */
    async getDecodedTokenData(): Promise<any> {
        try {
            const token = await this.getToken();
            if (!token) return null;

            return this.decodeTokenPayload(token);
        } catch (error) {
            console.warn('Erro ao obter dados decodificados do token:', error);
            return null;
        }
    }
}