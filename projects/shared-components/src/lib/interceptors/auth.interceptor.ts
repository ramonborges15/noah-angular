import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, from } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';
import { AuthStorageService } from '../services/local-storage/auth-storage.service';

/**
 * Interceptor HTTP para autenticação automática
 * Adiciona o Access Token nas requisições e trata erros 401
 */
@Injectable()
export class AuthInterceptor implements HttpInterceptor {

    constructor(private authStorage: AuthStorageService) { }

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        // Converte para Observable para trabalhar com async
        return from(this.authStorage.getToken()).pipe(
            switchMap(token => {
                // Clona a requisição e adiciona o token se disponível
                let authReq = req;

                if (token) {
                    authReq = req.clone({
                        setHeaders: {
                            Authorization: `Bearer ${token}`
                        }
                    });
                }

                // Processa a requisição
                return next.handle(authReq).pipe(
                    catchError((error: HttpErrorResponse) => {
                        // Se receber 401, limpa os dados de autenticação
                        // O backend já fez o refresh automaticamente, se falhou é porque não tem mais sessão válida
                        if (error.status === 401) {
                            this.authStorage.clearAuthData();
                        }

                        // Re-propaga o erro para ser tratado pelos componentes
                        return throwError(() => error);
                    })
                );
            })
        );
    }
}