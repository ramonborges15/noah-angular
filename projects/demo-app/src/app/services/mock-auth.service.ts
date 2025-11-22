import { Injectable } from '@angular/core';
import {
    AuthProvider,
    LoginCredentials,
    LoginResponse,
    LogoutResponse,
    RefreshTokenResponse,
    UserInfo
} from 'shared-components';

/**
 * Mock implementation do AuthProvider para demonstração
 */
@Injectable({
    providedIn: 'root'
})
export class MockAuthService implements AuthProvider {

    // Usuários de demonstração
    private readonly demoUsers = [
        {
            email: 'admin@demo.com',
            password: 'admin123',
            userInfo: {
                id: '1',
                nome: 'Administrador Demo',
                email: 'admin@demo.com',
                perfil: 'admin',
                permissoes: ['read', 'write', 'delete', 'admin'],
                avatar: 'https://ui-avatars.com/api/?name=Admin+Demo&background=7c3aed&color=fff'
            }
        },
        {
            email: 'prof@demo.com',
            password: 'prof123',
            userInfo: {
                id: '2',
                nome: 'Professor Demo',
                email: 'prof@demo.com',
                perfil: 'professor',
                permissoes: ['read', 'write'],
                avatar: 'https://ui-avatars.com/api/?name=Professor+Demo&background=059669&color=fff'
            }
        },
        {
            email: 'student@demo.com',
            password: 'student123',
            userInfo: {
                id: '3',
                nome: 'Estudante Demo',
                email: 'student@demo.com',
                perfil: 'student',
                permissoes: ['read'],
                avatar: 'https://ui-avatars.com/api/?name=Estudante+Demo&background=dc2626&color=fff'
            }
        }
    ];

    /**
     * Simula autenticação com delay para demonstrar loading
     */
    async login(credentials: LoginCredentials): Promise<LoginResponse> {
        console.log('MockAuthService: Attempting login with:', credentials);

        // Simula delay da rede
        await this.delay(1500);

        // Busca usuário
        const user = this.demoUsers.find(u =>
            u.email === credentials.email &&
            u.password === credentials.password
        );

        if (!user) {
            return {
                success: false,
                message: 'Credenciais inválidas',
                errors: ['Email ou senha incorretos']
            };
        }

        const response: LoginResponse = {
            success: true,
            accessToken: this.generateMockToken(user.userInfo),
            user: user.userInfo,
            expiresIn: 60, // 60 minutos
            message: 'Login realizado com sucesso'
        };

        console.log('MockAuthService: Login successful:', response);
        return response;
    }

    /**
     * Simula refresh do token
     */
    async refreshToken(): Promise<RefreshTokenResponse> {
        console.log('MockAuthService: Refreshing token');

        await this.delay(500);

        return {
            success: true,
            accessToken: this.generateMockToken({
                id: '1',
                nome: 'Usuário Demo',
                email: 'demo@example.com',
                perfil: 'user',
                permissoes: ['read']
            }),
            expiresIn: 60,
            message: 'Token renovado com sucesso'
        };
    }

    /**
     * Simula logout
     */
    async logout(): Promise<LogoutResponse> {
        console.log('MockAuthService: Logging out');

        await this.delay(300);

        return {
            success: true,
            message: 'Logout realizado com sucesso'
        };
    }

    /**
     * Simula validação de token
     */
    async validateToken(token: string): Promise<boolean> {
        console.log('MockAuthService: Validating token');

        await this.delay(200);

        try {
            // Simula decodificação de JWT
            const payload = this.decodeMockToken(token);

            const user = this.demoUsers.find(u => u.userInfo.id === payload.sub);
            return !!user;
        } catch (error) {
            return false;
        }
    }

    /**
     * Simula delay de rede
     */
    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Gera um mock token (base64 encoded)
     */
    private generateMockToken(userInfo: UserInfo): string {
        const header = {
            alg: 'HS256',
            typ: 'JWT'
        };

        const payload = {
            sub: userInfo.id,
            email: userInfo.email,
            nome: userInfo.nome,
            perfil: userInfo.perfil,
            permissoes: userInfo.permissoes,
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + 3600 // 1 hora
        };

        const signature = 'mock_signature_for_demo';

        // Simula estrutura JWT (header.payload.signature)
        return `${btoa(JSON.stringify(header))}.${btoa(JSON.stringify(payload))}.${btoa(signature)}`;
    }

    /**
     * Decodifica mock token
     */
    private decodeMockToken(token: string): any {
        try {
            const parts = token.split('.');
            if (parts.length !== 3) {
                throw new Error('Token format inválido');
            }

            const payload = JSON.parse(atob(parts[1]));

            // Verifica expiração
            if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
                throw new Error('Token expirado');
            }

            return payload;
        } catch (error) {
            throw new Error('Token inválido');
        }
    }

    /**
     * Obtém usuários de demonstração (apenas para demo)
     */
    getDemoUsers() {
        return this.demoUsers.map(user => ({
            email: user.email,
            perfil: user.userInfo.perfil,
            nome: user.userInfo.nome
        }));
    }
}