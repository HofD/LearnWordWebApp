import { HttpClient, HttpErrorResponse, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { environment } from "../../environments/environment";
import { catchError, throwError } from "rxjs";
import { Card } from "./card";

const httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({
    providedIn: 'root'
})

export class CardHttpService {
    constructor(
        private http: HttpClient,
        private router: Router
    ){}

    public add(card: Card) {
        return this.http.post(`${environment.apiUrl}/api/cards`, card, httpOptions).pipe(
            catchError(this.handleError)
        );
    }

    public get(id: number) {
        return this.http.get(`${environment.apiUrl}/api/cards/${id}`, httpOptions).pipe(
            catchError(this.handleError)
        );
    }

    public delete(id: number) {
        return this.http.delete(`${environment.apiUrl}/api/cards/${id}`, httpOptions).pipe(
            catchError(this.handleError)
        )
    }

    private handleError(error: HttpErrorResponse) {
        if (error.status === 0) {
            // A client-side or network error occurred. Handle it accordingly.
            console.error('An error occurred:', error.error);
        } else if (error.status === 401) {
            this.router.navigate(['login'], { queryParams: { returnUrl: this.router.url } });
        }
        else {
            // The backend returned an unsuccessful response code.
            // The response body may contain clues as to what went wrong.
            console.error(
                `Backend returned code ${error.status}, body was: `, error.error);
        }
        // Return an observable with a user-facing error message.
        return throwError(() => new Error('Something bad happened; please try again later.'));
    }
}