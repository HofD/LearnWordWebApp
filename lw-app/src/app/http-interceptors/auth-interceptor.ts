import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpHandler, HttpRequest, HttpErrorResponse, HttpEvent } from '@angular/common/http';

import { TokenStorageService } from '../shared/services/token-storage.service';
import { BehaviorSubject, Observable, catchError, filter, switchMap, take, throwError } from 'rxjs';
import { AuthService } from '../shared/services/auth.service';

const TOKEN_HEADER_KEY = 'Authorization';

function addTokenHeader(request: HttpRequest<any>, token: string): HttpRequest<string> {
    return request.clone({ headers: request.headers.set(TOKEN_HEADER_KEY, `Bearer ${token}`) });
}

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
    private isRefreshing = false;
    private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

    constructor(private tokenService: TokenStorageService, private authService: AuthService) { }

    intercept(req: HttpRequest<any>, next: HttpHandler) {
        let authReq = req;
        const token = this.tokenService.getToken();

        if (token != null) {
            authReq = addTokenHeader(req, token);
        }

        return next.handle(authReq).pipe(
            catchError((error) => {
                if (error instanceof HttpErrorResponse && !this.isAuthEndpoint(authReq)) {
                    if (error.status === 401) {
                        return this.handle401Error(authReq, next);
                    }
                }
                return throwError(() => error);
            }));
    }

    private handle401Error(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const refreshToken = this.tokenService.getRefreshToken();

        if (refreshToken === null) {
            this.authService.clearSession(['/login']);
            return throwError(() => new Error('Refresh token is missing.'));
        }

        if (!this.isRefreshing) {
            this.isRefreshing = true;
            this.refreshTokenSubject.next(null);

            return this.authService.refreshToken().pipe(
                switchMap((response: any) => {
                    this.isRefreshing = false;

                    this.authService.saveTokens(response);
                    this.refreshTokenSubject.next(response.token);

                    return next.handle(addTokenHeader(request, response.token));
                }),
                catchError((error) => {
                    this.isRefreshing = false;
                    this.refreshTokenSubject.error(error);
                    this.refreshTokenSubject = new BehaviorSubject<any>(null);

                    this.authService.clearSession(['/login']);

                    return throwError(() => error);
                })
            );
        }

        return this.refreshTokenSubject.pipe(
            filter(token => token !== null),
            take(1),
            switchMap((token) => next.handle(addTokenHeader(request, token)))
        );
    }

    private isAuthEndpoint(request: HttpRequest<any>): boolean {
        return request.url.includes('/api/auth/login')
            || request.url.includes('/api/auth/refresh-token')
            || request.url.includes('/api/auth/revoke-token');
    }
}
