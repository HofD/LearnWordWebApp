import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { TokenStorageService } from './token-storage.service';
import { User } from '../models/user.model'
import { Subject, catchError, lastValueFrom, throwError } from 'rxjs';
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

        return this.http.post<any>(`${environment.apiUrl}/api/auth/refresh-token`, { refreshToken }, httpOptions).pipe(
            catchError(this.handleError)
        );
    }

    public revokeToken() {
        const refreshToken = this.tokenStorageService.getRefreshToken();

        return this.http.post<any>(`${environment.apiUrl}/api/auth/revoke-token`, { refreshToken }, httpOptions).pipe(
            catchError(this.handleError)
        );
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
        this.revokeToken();
        this.tokenStorageService.deleteToken();
        this.sendAuthStateChangeNotification(false);
    }

    private handleError(error: HttpErrorResponse) {
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
        return throwError(() => new Error('Something bad happened; please try again later.'));
    }
}