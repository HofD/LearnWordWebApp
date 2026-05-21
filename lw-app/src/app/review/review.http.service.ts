import { HttpClient, HttpErrorResponse, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { environment } from "../../environments/environment";
import { catchError, throwError } from "rxjs";

export type ReviewOutcome = 'Again' | 'Hard' | 'Good' | 'Easy';

const httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({
    providedIn: 'root'
})
export class ReviewHttpService {
    constructor(
        private http: HttpClient,
        private router: Router
    ) { }

    public getCardsForReview(collectionId: number) {
        return this.http.get(`${environment.apiUrl}/api/collections/${collectionId}/review`, httpOptions).pipe(
            catchError((error) => this.handleError(error))
        );
    }

    public reviewCard(cardId: number, outcome: ReviewOutcome) {
        return this.http.post(
            `${environment.apiUrl}/api/review/cards/${cardId}/review`,
            { outcome },
            httpOptions
        ).pipe(
            catchError((error) => this.handleError(error))
        );
    }

    private handleError(error: HttpErrorResponse) {
        if (error.status === 0) {
            console.error('An error occurred:', error.error);
        } else if (error.status === 401) {
            this.router.navigate(['login'], { queryParams: { returnUrl: this.router.url } });
        } else {
            console.error(
                `Backend returned code ${error.status}, body was: `, error.error);
        }
        return throwError(() => new Error('Something bad happened; please try again later.'));
    }
} 
