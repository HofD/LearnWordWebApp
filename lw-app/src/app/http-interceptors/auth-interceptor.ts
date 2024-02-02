import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpHandler, HttpRequest } from '@angular/common/http';

import { TokenStorageService } from '../shared/services/token-storage.service';

const TOKEN_HEADER_KEY = 'Authorization';

function addTokenHeader(request: HttpRequest<any>, token: string): HttpRequest<string> {
    return request.clone({ headers: request.headers.set(TOKEN_HEADER_KEY, `Bearer ${token}`) });
}

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

    constructor(private tokenService: TokenStorageService) { }

    intercept(req: HttpRequest<any>, next: HttpHandler) {
        let authReq = req;
        const token = this.tokenService.getToken();

        if (token != null) {
            authReq = addTokenHeader(req, token);
        }

        return next.handle(authReq);
    }
}
