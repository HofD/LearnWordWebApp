import { Injectable } from '@angular/core';
//import {User} from '../models/user.model';
import {JwtHelperService} from '@auth0/angular-jwt';

const TOKEN_KEY = 'auth-token';
const REFRESHTOKEN_KEY = 'auth-refreshtoken';

const jwtHelperService = new JwtHelperService();

@Injectable({
    providedIn: 'root'
})
export class TokenStorageService {
    constructor() { }

    public deleteToken(): void {
        window.sessionStorage.clear();
    }

    public saveToken(token: string): void {
        window.sessionStorage.removeItem(TOKEN_KEY);
        window.sessionStorage.setItem(TOKEN_KEY, token);
    }

    public getToken(): string | null {
        return window.sessionStorage.getItem(TOKEN_KEY);
    }

    public saveRefreshToken(token: string): void {
        window.sessionStorage.removeItem(REFRESHTOKEN_KEY);
        window.sessionStorage.setItem(REFRESHTOKEN_KEY, token);
    }

    public getRefreshToken(): string | null {
        return window.sessionStorage.getItem(REFRESHTOKEN_KEY);
    }

    //public getTokenDecoded(): User {
    //    const token = this.getToken();
    //    try {
    //        return jwtHelperService.decodeToken(token);
    //    } catch (e) {
    //        console.log(e);
    //    }
    //}

    public isTokenExpired(): boolean {
        const token = this.getToken();
        return jwtHelperService.isTokenExpired(token);
    }
}
