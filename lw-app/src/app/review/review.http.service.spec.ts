import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { environment } from '../../environments/environment';
import { ReviewHttpService } from './review.http.service';

describe('ReviewHttpService', () => {
  let service: ReviewHttpService;
  let http: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule], providers: [provideRouter([])] });
    service = TestBed.inject(ReviewHttpService); http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());

  it('preserves the outcome-only review contract for existing callers', () => {
    service.reviewCard(11, 'Good').subscribe();
    const request = http.expectOne(`${environment.apiUrl}/api/review/cards/11/review`);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({ outcome: 'Good' });
    request.flush({});
  });

  it('sends optional session, response time and retry identity without a client review timestamp', () => {
    service.reviewCard(11, 'Again', { sessionId: 'session', requestId: 'request', responseTimeMs: 1234 }).subscribe();
    const request = http.expectOne(`${environment.apiUrl}/api/review/cards/11/review`);
    expect(request.request.body).toEqual({ outcome: 'Again', sessionId: 'session', requestId: 'request', responseTimeMs: 1234 });
    request.flush({});
  });
});
