import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { environment } from '../../environments/environment';
import { CoachHttpService } from './coach.http.service';

describe('CoachHttpService', () => {
  let service: CoachHttpService;
  let http: HttpTestingController;
  const base = `${environment.apiUrl}/api/learning`;
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule] });
    service = TestBed.inject(CoachHttpService);
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());
  it('analyzes a session using only its ID and UI language, then reads its durable state', () => {
    service.analyze('session', 'ru').subscribe();
    const request = http.expectOne(`${base}/sessions/session/coach-analysis`);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({ language: 'ru' });
    request.flush({});
    service.analysis('session').subscribe();
    const read = http.expectOne(`${base}/sessions/session/coach-analysis`);
    expect(read.request.method).toBe('GET');
    read.flush({});
  });
  it('keeps accept, dismiss and completion separate from review APIs', () => {
    for (const action of ['accept', 'dismiss', 'complete'] as const) {
      service[action]('intervention').subscribe();
      const request = http.expectOne(`${base}/interventions/intervention/${action}`);
      expect(request.request.method).toBe('POST');
      expect(request.request.body).toEqual({});
      request.flush({});
    }
    service.intervention('intervention').subscribe();
    http.expectOne(`${base}/interventions/intervention`).flush({});
  });
  it('submits an opaque chosen option to server validation without a local answer or review outcome', () => {
    service.answer('intervention', 'exercise', { optionId: 'b', responseTimeMs: 900 }).subscribe();
    const request = http.expectOne(`${base}/interventions/intervention/exercises/exercise/answer`);
    expect(request.request.body).toEqual({ optionId: 'b', responseTimeMs: 900 });
    expect(request.request.method).toBe('POST');
    request.flush({});
  });
});
