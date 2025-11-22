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
     * Salva Access Token (backend fará todas as validações)
     */
    async setToken(token: string, expiryInMinutes: number = 60): Promise<boolean> {
        if (!token || token.trim().length === 0) {
            return false;
        }

        const success = await this.storage.setItemWithExpiry(this.TOKEN_KEY, token, expiryInMinutes, 'sessionStorage');
        if (success) {
            this.isAuthenticated$.next(true);
        }
        return success;
    }

    /**
     * Recupera Access Token com validação de expiração
     */
    async getToken(): Promise<string | null> {
        const token = await this.storage.getItemWithExpiry<string>(this.TOKEN_KEY, 'sessionStorage');
        if (!token) {
            this.isAuthenticated$.next(false);
        }
        return token;
    }

    // REMOVIDO: Refresh Token methods - ficam no servidor
    // O backend gerencia refresh automaticamente via interceptors

    /**
     * Salva dados do usuário com validação básica
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

        return await this.storage.setItem(this.USER_DATA_KEY, userData, 'sessionStorage');
    }

    /**
     * Recupera dados do usuário
     */
    async getUserData<T = any>(): Promise<T | null> {
        return await this.storage.getItem<T>(this.USER_DATA_KEY, 'sessionStorage');
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
        this.storage.removeItem(this.USER_DATA_KEY, 'sessionStorage');
        this.isAuthenticated$.next(false);
    }

    /**
     * Decodifica payload do JWT (SEM validação - apenas para UI)
     * IMPORTANTE: Use apenas para exibição, nunca para lógica de segurança
     */
    decodeTokenPayload(token?: string): any {
        try {
            const jwt = token || this.getTokenSync();
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
     * Versão síncrona para UI (não recomendada para lógica crítica)
     */
    private getTokenSync(): string | null {
        try {
            const item = sessionStorage.getItem(this.TOKEN_KEY);
            if (!item) return null;

            // Parse seguro com proteção contra prototype pollution
            const parsed = JSON.parse(item, (key, value) => {
                if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
                    return undefined;
                }
                return value;
            });

            // Validação adicional da estrutura
            if (!parsed || typeof parsed !== 'object' || !parsed.value) {
                return null;
            }

            const now = Date.now();

            if (parsed.expiry && now > parsed.expiry) {
                sessionStorage.removeItem(this.TOKEN_KEY);
                return null;
            }

            return parsed.value;
        } catch (error) {
            console.warn('Erro ao acessar token sync:', error);
            return null;
        }
    }

    /**
     * Verifica se token está próximo de expirar (para UI)
     */
    isTokenExpiringSoon(minutesThreshold: number = 5): boolean {
        const tokenData = this.decodeTokenPayload();
        if (!tokenData || !tokenData.exp) return true;

        const now = Math.floor(Date.now() / 1000);
        const timeUntilExpiry = tokenData.exp - now;
        return timeUntilExpiry < (minutesThreshold * 60);
    }
}