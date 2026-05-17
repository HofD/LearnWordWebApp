import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { TokenStorageService } from './token-storage.service';
import { User } from '../models/user.model'
import { EMPTY, Subject, catchError, finalize, lastValueFrom, switchMap, take, tap, throwError } from 'rxjs';
import { AlertService } from './alert.service';

const httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({
    providedIn: 'root'
})

export class AuthService {
    currentUser = {};
    private authChangeSub = new Subject<boolean>();
    public authChanged = this.authChangeSub.asObservable();

    constructor(
        private http: HttpClient,
        private tokenStorageService: TokenStorageService,
        private alertService: AlertService,
        public router: Router
    ) { }

    public register(user: User) {
        return this.http.post(`${environment.apiUrl}/api/account/register`, user, httpOptions).pipe(
            catchError(this.handleError)
        );
    }

    public forgotPassword(email: string) {
        return this.http.post(`${environment.apiUrl}/api/account/password/forgot`, { email }, httpOptions).pipe(
            catchError(this.handleError)
        );
    }

    public resetPassword(email: string, code: string, password: string) {
        return this.http.post(`${environment.apiUrl}/api/account/password/reset`, { email, code, password }, httpOptions).pipe(
            catchError(this.handleError)
        );
    }

    public async login(email: string, password: string) {
        type LoginResponse = {
            email: string,
            token: string,
            refreshToken: string
        }

        const response$ = this.http.post<LoginResponse>(`${environment.apiUrl}/api/auth/login`, { email, password }, httpOptions).pipe(
            catchError(this.handleError)
        );
        const result = await lastValueFrom(response$);
        this.tokenStorageService.saveToken(result.token);
        this.tokenStorageService.saveRefreshToken(result.refreshToken);
        this.sendAuthStateChangeNotification(true);
    }

    public refreshToken() {
        const refreshToken = this.tokenStorageService.getRefreshToken();

        if (refreshToken === null) {
            return throwError(() => new Error('Refresh token is missing.'));
        }

        return this.http.post<any>(`${environment.apiUrl}/api/auth/refresh-token`, { refreshToken }, httpOptions);
    }

    public saveTokens(response: { token: string, refreshToken: string }): void {
        this.tokenStorageService.saveToken(response.token);
        this.tokenStorageService.saveRefreshToken(response.refreshToken);
    }

    public revokeToken() {
        const refreshToken = this.tokenStorageService.getRefreshToken();

        if (refreshToken === null) {
            return EMPTY;
        }

        return this.http.post<any>(`${environment.apiUrl}/api/auth/revoke-token`, { refreshToken }, httpOptions);
    }

    public confirmEmail(userId: string, code: string) {
        return this.http.get(`${environment.apiUrl}/api/account/confirm?userId=${userId}&code=${code}`, httpOptions).pipe(
            catchError(this.handleError)
        );
    }

    public sendAuthStateChangeNotification = (isAuthenticated: boolean) => {
        this.authChangeSub.next(isAuthenticated);
    }

    public isLoggedIn(): boolean {
        return this.tokenStorageService.getToken() !== null;
    }

    public logout = () => {
        const revoke$ = this.tokenStorageService.isTokenExpired()
            ? this.refreshToken().pipe(
                tap(response => this.saveTokens(response)),
                switchMap(() => this.revokeToken())
            )
            : this.revokeToken();

        revoke$.pipe(
            take(1),
            catchError(() => EMPTY),
            finalize(() => this.clearSession(['/']))
        ).subscribe();
    }

    public clearSession = (redirectTo?: string[]): void => {
        this.tokenStorageService.deleteToken();
        this.sendAuthStateChangeNotification(false);

        if (redirectTo !== undefined) {
            this.router.navigate(redirectTo);
        }
    }

    private handleError = (error: HttpErrorResponse) => {
        if (error.status === 0) {
            // A client-side or network error occurred. Handle it accordingly.
            console.error('An error occurred:', error.error);
        } else if (error.status === 401) {
            this.alertService.error("Wrong username or password.");
        } else {
            // The backend returned an unsuccessful response code.
            // The response body may contain clues as to what went wrong.
            console.error(
                `Backend returned code ${error.status}, body was: `, error.error);
        }
        // Return an observable with a user-facing error message.
        return throwError(() => new Error(AuthService.getErrorMessage(error)));
    }

    private static getErrorMessage(error: HttpErrorResponse): string {
        if (Array.isArray(error.error)) {
            return error.error
                .map(item => item.description ?? item.code)
                .filter(Boolean)
                .join(' ');
        }

        if (typeof error.error === 'string' && error.error.length > 0) {
            return error.error;
        }

        return 'Something bad happened; please try again later.';
    }
}
