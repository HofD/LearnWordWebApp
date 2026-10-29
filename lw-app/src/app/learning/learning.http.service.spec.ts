import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { environment } from '../../environments/environment';
import { LearningHttpService } from './learning.http.service';

 describe('LearningHttpService', () => {
  let service: LearningHttpService;
  let http: HttpTestingController;
  const base = `${environment.apiUrl}/api/learning`;
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule] });
    service = TestBed.inject(LearningHttpService);
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());

  it('reads recommendations and private summary without mutating or choosing a user', () => {
    service.today(7).subscribe();
    const plan = http.expectOne(`${base}/collections/7/today`);
    expect(plan.request.method).toBe('GET');
    expect(plan.request.body).toBeNull();
    plan.flush({ totalCount: 0, groups: { due: 0, weak: 0, new: 0 }, cards: [] });
    service.summary(7).subscribe();
    const summary = http.expectOne(`${base}/collections/7/summary`);
    expect(summary.request.method).toBe('GET');
    expect(summary.request.params.keys()).toEqual([]);
    summary.flush({ new: 0, learning: 0, weak: 0, strong: 0 });
  });

  it('starts and completes server-owned sessions without accepting card plans from the browser', () => {
    service.start(7).subscribe();
    const start = http.expectOne(`${base}/collections/7/sessions`);
    expect(start.request.method).toBe('POST');
    expect(start.request.body).toEqual({});
    start.flush({ id: 'session-id', cards: [] });
    service.complete('session-id').subscribe();
    const complete = http.expectOne(`${base}/sessions/session-id/complete`);
    expect(complete.request.method).toBe('POST');
    expect(complete.request.body).toEqual({});
    complete.flush({ id: 'session-id', completedAt: '2026-10-28T12:00:00Z' });
  });
});
