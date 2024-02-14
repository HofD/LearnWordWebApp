import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { catchError, lastValueFrom, throwError } from 'rxjs';

const httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({
    providedIn: 'root'
})

export class CollectionHttpService {
    constructor(
        private http: HttpClient,
        private router: Router
    ) { }

    public add(name: string) {
        return this.http.post(`${environment.apiUrl}/api/collections`, { name: name }, httpOptions).pipe(
            catchError(this.handleError)
        );
    }

    public delete(id: number) {
        return this.http.delete(`${environment.apiUrl}/api/collections/${id}`, httpOptions).pipe(
            catchError(this.handleError)
        )
    }

    public rename(id: number, name: string) {
        return this.http.put(`${environment.apiUrl}/api/collections/${id}`, { name: name }).pipe(
            catchError(this.handleError)
        )
    }

    public getList() {
        return this.http.get(`${environment.apiUrl}/api/collections`, httpOptions).pipe(
            catchError(this.handleError)
        );
    }

    public get(id: number) {
        return this.http.get(`${environment.apiUrl}/api/collections/${id}`, httpOptions).pipe(
            catchError(this.handleError)
        );
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