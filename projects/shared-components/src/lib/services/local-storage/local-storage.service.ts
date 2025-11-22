import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export type StorageType = 'localStorage' | 'sessionStorage';

export interface StorageOptions {
    encrypt?: boolean;
    compress?: boolean;
}

@Injectable({
    providedIn: 'root'
})
export class LocalStorageService {
    private storageAvailable = new BehaviorSubject<boolean>(this.isStorageAvailable());

    // Observable para monitorar disponibilidade do storage
    get storageAvailable$(): Observable<boolean> {
        return this.storageAvailable.asObservable();
    }

    /**
     * Salva item no storage com validação básica
     */
    async setItem<T>(key: string, value: T, storageType: StorageType = 'localStorage', options?: StorageOptions): Promise<boolean> {
        if (!this.isStorageAvailable(storageType)) {
            console.warn(`${storageType} não está disponível`);
            return false;
        }

        if (!this.validateKey(key)) {
            console.error('Chave inválida fornecida');
            return false;
        }

        try {
            const storage = this.getStorage(storageType);
            let serializedValue = this.safeJsonStringify(value);

            if (!serializedValue) {
                console.error('Falha na serialização segura dos dados');
                return false;
            }

            // Aplicar criptografia REAL se solicitada
            if (options?.encrypt) {
                serializedValue = await this.encryptData(serializedValue);
                if (!serializedValue) {
                    console.error('Falha na criptografia dos dados');
                    return false;
                }
            }

            // Validação de tamanho (localStorage tem limite ~5MB)
            if (serializedValue.length > 5000000) {
                console.error('Dados muito grandes para o storage');
                return false;
            }

            storage.setItem(this.sanitizeKey(key), serializedValue);
            return true;
        } catch (error) {
            console.error(`Erro ao salvar no ${storageType}:`, error);
            return false;
        }
    }

    /**
     * Recupera item do storage com tipo seguro
     */
    async getItem<T>(key: string, storageType: StorageType = 'localStorage', options?: StorageOptions): Promise<T | null> {
        if (!this.isStorageAvailable(storageType)) {
            return null;
        }

        try {
            const storage = this.getStorage(storageType);
            let item = storage.getItem(this.sanitizeKey(key));

            if (!item) return null;

            // Aplicar descriptografia REAL se necessário
            if (options?.encrypt && item) {
                item = await this.decryptData(item);
                if (!item) {
                    console.error('Falha ao descriptografar item');
                    return null;
                }
            }

            return item ? this.safeJsonParse(item) : null;
        } catch (error) {
            console.error(`Erro ao recuperar do ${storageType}:`, error);
            return null;
        }
    }

    /**
     * Remove item específico
     */
    removeItem(key: string, storageType: StorageType = 'localStorage'): boolean {
        if (!this.isStorageAvailable(storageType)) {
            return false;
        }

        try {
            const storage = this.getStorage(storageType);
            storage.removeItem(this.sanitizeKey(key));
            return true;
        } catch (error) {
            console.error(`Erro ao remover do ${storageType}:`, error);
            return false;
        }
    }

    /**
     * Limpa todo o storage
     */
    clear(storageType: StorageType = 'localStorage'): boolean {
        if (!this.isStorageAvailable(storageType)) {
            return false;
        }

        try {
            const storage = this.getStorage(storageType);
            storage.clear();
            return true;
        } catch (error) {
            console.error(`Erro ao limpar ${storageType}:`, error);
            return false;
        }
    }

    /**
     * Verifica se item existe
     */
    hasItem(key: string, storageType: StorageType = 'localStorage'): boolean {
        if (!this.isStorageAvailable(storageType)) {
            return false;
        }

        const storage = this.getStorage(storageType);
        return storage.getItem(this.sanitizeKey(key)) !== null;
    }

    /**
     * Salva item com expiração
     */
    async setItemWithExpiry<T>(key: string, value: T, expiryInMinutes: number, storageType: StorageType = 'localStorage'): Promise<boolean> {
        const now = new Date();
        const item = {
            value: value,
            expiry: now.getTime() + (expiryInMinutes * 60 * 1000)
        };
        return await this.setItem(key, item, storageType);
    }

    /**
     * Recupera item com verificação de expiração
     */
    async getItemWithExpiry<T>(key: string, storageType: StorageType = 'localStorage'): Promise<T | null> {
        const itemStr = await this.getItem<{ value: T, expiry: number }>(key, storageType);

        if (!itemStr) {
            return null;
        }

        const now = new Date();
        if (now.getTime() > itemStr.expiry) {
            this.removeItem(key, storageType);
            return null;
        }

        return itemStr.value;
    }

    /**
     * Obtém todas as chaves do storage
     */
    getAllKeys(storageType: StorageType = 'localStorage'): string[] {
        if (!this.isStorageAvailable(storageType)) {
            return [];
        }

        const storage = this.getStorage(storageType);
        const keys: string[] = [];
        for (let i = 0; i < storage.length; i++) {
            const key = storage.key(i);
            if (key) keys.push(key);
        }
        return keys;
    }

    /**
     * Obtém tamanho ocupado do storage em bytes (aproximado)
     */
    getStorageSize(storageType: StorageType = 'localStorage'): number {
        if (!this.isStorageAvailable(storageType)) {
            return 0;
        }

        const storage = this.getStorage(storageType);
        let total = 0;
        for (let key in storage) {
            if (storage.hasOwnProperty(key)) {
                total += storage[key].length + key.length;
            }
        }
        return total;
    }

    /**
     * Monitor de eventos de storage
     */
    monitorStorageEvents(): Observable<StorageEvent> {
        return new Observable(observer => {
            const handler = (event: StorageEvent) => {
                // Validação básica de segurança
                if (this.validateStorageEvent(event)) {
                    observer.next(event);
                }
            };

            window.addEventListener('storage', handler);

            return () => {
                window.removeEventListener('storage', handler);
            };
        });
    }

    /**
     * Limpa itens expirados do storage
     */
    async cleanExpiredItems(storageType: StorageType = 'localStorage'): Promise<number> {
        if (!this.isStorageAvailable(storageType)) {
            return 0;
        }

        const keys = this.getAllKeys(storageType);
        let cleanedCount = 0;

        for (const key of keys) {
            try {
                const item = await this.getItem<{ value: any, expiry: number }>(key, storageType);
                if (item && item.expiry) {
                    const now = new Date().getTime();
                    if (now > item.expiry) {
                        this.removeItem(key, storageType);
                        cleanedCount++;
                    }
                }
            } catch (error) {
                // Ignora erros de parsing - pode não ser um item com expiração
            }
        }

        return cleanedCount;
    }

    /**
     * Backup de todos os dados do storage
     */
    backup(storageType: StorageType = 'localStorage'): { [key: string]: any } {
        if (!this.isStorageAvailable(storageType)) {
            return {};
        }

        const storage = this.getStorage(storageType);
        const backup: { [key: string]: any } = {};

        for (let i = 0; i < storage.length; i++) {
            const key = storage.key(i);
            if (key) {
                backup[key] = storage.getItem(key);
            }
        }

        return backup;
    }

    /**
     * Restaura backup para o storage
     */
    restore(backup: { [key: string]: any }, storageType: StorageType = 'localStorage'): boolean {
        if (!this.isStorageAvailable(storageType)) {
            return false;
        }

        // Validação rigorosa do backup
        if (!backup || typeof backup !== 'object' || Array.isArray(backup)) {
            console.error('Backup inválido fornecido');
            return false;
        }

        try {
            const storage = this.getStorage(storageType);
            const keys = Object.keys(backup);

            // Limita número de itens para evitar DoS
            if (keys.length > 100) {
                console.error('Backup muito grande - máximo 100 itens');
                return false;
            }

            for (const key of keys) {
                // Validação rigorosa de cada chave
                if (!this.validateKey(key)) {
                    console.warn(`Chave inválida ignorada no backup: ${key}`);
                    continue;
                }

                const value = backup[key];

                // Validação do valor
                if (typeof value !== 'string') {
                    console.warn(`Valor inválido ignorado para chave: ${key}`);
                    continue;
                }

                // Validação de tamanho
                if (value.length > 50000) { // 50KB por item
                    console.warn(`Valor muito grande ignorado para chave: ${key}`);
                    continue;
                }

                storage.setItem(key, value);
            }

            return true;
        } catch (error) {
            console.error('Erro ao restaurar backup:', error);
            return false;
        }
    }

    /**
     * MÉTODOS PRIVADOS SIMPLIFICADOS
     */

    private isStorageAvailable(storageType: StorageType = 'localStorage'): boolean {
        try {
            const storage = this.getStorage(storageType);
            const test = '__storage_test__';
            storage.setItem(test, test);
            storage.removeItem(test);
            return true;
        } catch {
            return false;
        }
    }

    private getStorage(storageType: StorageType): Storage {
        return storageType === 'localStorage' ? localStorage : sessionStorage;
    }

    private sanitizeKey(key: string): string {
        if (!key || typeof key !== 'string') {
            return '';
        }

        return key
            .replace(/[^a-zA-Z0-9_.-]/g, '') // Remove caracteres especiais
            .substring(0, 50); // Limita tamanho
    }

    private validateKey(key: string): boolean {
        if (!key || typeof key !== 'string') {
            return false;
        }

        // Bloqueia chaves perigosas para prototype pollution
        const dangerousKeys = ['__proto__', 'constructor', 'prototype', 'toString', 'valueOf'];
        if (dangerousKeys.includes(key)) {
            return false;
        }

        // Validação de tamanho e caracteres
        if (key.length > 30 || key.length === 0) {
            return false;
        }

        // Apenas alfanumérico e underscore
        if (!/^[a-zA-Z0-9_]+$/.test(key)) {
            return false;
        }

        return true;
    }

    private safeJsonStringify(obj: any): string | null {
        try {
            // Verifica se não é função ou undefined
            if (typeof obj === 'function' || obj === undefined) {
                return null;
            }

            // Limita profundidade para evitar referências circulares
            const seen = new WeakSet();
            const replacer = (key: string, value: any) => {
                // Bloqueia chaves perigosas
                if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
                    return undefined;
                }

                // Evita referências circulares
                if (typeof value === 'object' && value !== null) {
                    if (seen.has(value)) {
                        return '[Circular Reference]';
                    }
                    seen.add(value);
                }

                return value;
            };

            return JSON.stringify(obj, replacer);
        } catch (error) {
            console.error('Erro na serialização segura:', error);
            return null;
        }
    }

    private safeJsonParse(text: string): any {
        try {
            return JSON.parse(text, (key, value) => {
                // Bloqueia prototype pollution
                if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
                    return undefined;
                }
                return value;
            });
        } catch (error) {
            console.error('Erro no parsing seguro:', error);
            return null;
        }
    }

    private async encryptData(text: string): Promise<string | null> {
        try {
            // Gera chave simples baseada no contexto da aplicação
            const keyMaterial = await crypto.subtle.importKey(
                'raw',
                new TextEncoder().encode(window.location.hostname + '_secure_key'),
                'PBKDF2',
                false,
                ['deriveKey']
            );

            // Gera salt fixo baseado no hostname (para poder descriptografar)
            const salt = new TextEncoder().encode(window.location.hostname.padEnd(16, '0').substring(0, 16));

            const key = await crypto.subtle.deriveKey(
                {
                    name: 'PBKDF2',
                    salt: salt,
                    iterations: 10000,
                    hash: 'SHA-256'
                },
                keyMaterial,
                { name: 'AES-GCM', length: 256 },
                false,
                ['encrypt']
            );

            const iv = crypto.getRandomValues(new Uint8Array(12));
            const encoded = new TextEncoder().encode(text);

            const encrypted = await crypto.subtle.encrypt(
                { name: 'AES-GCM', iv: iv },
                key,
                encoded
            );

            // Combina IV + dados criptografados em base64
            const combined = new Uint8Array(iv.length + encrypted.byteLength);
            combined.set(iv);
            combined.set(new Uint8Array(encrypted), iv.length);

            return btoa(String.fromCharCode(...combined));
        } catch (error) {
            console.error('Erro na criptografia:', error);
            return null;
        }
    }

    private async decryptData(encryptedText: string): Promise<string | null> {
        try {
            // Mesmo processo para gerar a chave
            const keyMaterial = await crypto.subtle.importKey(
                'raw',
                new TextEncoder().encode(window.location.hostname + '_secure_key'),
                'PBKDF2',
                false,
                ['deriveKey']
            );

            const salt = new TextEncoder().encode(window.location.hostname.padEnd(16, '0').substring(0, 16));

            const key = await crypto.subtle.deriveKey(
                {
                    name: 'PBKDF2',
                    salt: salt,
                    iterations: 10000,
                    hash: 'SHA-256'
                },
                keyMaterial,
                { name: 'AES-GCM', length: 256 },
                false,
                ['decrypt']
            );

            // Decodifica base64 e separa IV dos dados
            const combined = new Uint8Array(atob(encryptedText).split('').map(c => c.charCodeAt(0)));
            const iv = combined.slice(0, 12);
            const encrypted = combined.slice(12);

            const decrypted = await crypto.subtle.decrypt(
                { name: 'AES-GCM', iv: iv },
                key,
                encrypted
            );

            return new TextDecoder().decode(decrypted);
        } catch (error) {
            console.error('Erro na descriptografia:', error);
            return null;
        }
    }

    private validateStorageEvent(event: StorageEvent): boolean {
        // Validação rigorosa de origem
        if (!event.url || event.url.trim() === '') {
            return false;
        }

        try {
            const eventOrigin = new URL(event.url).origin;
            const currentOrigin = window.location.origin;

            if (eventOrigin !== currentOrigin) {
                return false;
            }
        } catch {
            return false;
        }

        // Validação rigorosa de chave
        if (event.key && !this.validateKey(event.key)) {
            return false;
        }

        // Verificação adicional de integridade temporal
        const now = Date.now();
        if (!this.lastEventTime) {
            this.lastEventTime = now;
            return true;
        }

        // Rate limiting básico
        if (now - this.lastEventTime < 50) { // Máximo 20 eventos/segundo
            return false;
        }

        this.lastEventTime = now;
        return true;
    }

    private lastEventTime: number = 0;
}