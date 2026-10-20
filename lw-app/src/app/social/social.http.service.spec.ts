import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { environment } from '../../environments/environment';
import { SocialHttpService } from './social.http.service';

describe('SocialHttpService', () => {
  let service: SocialHttpService;
  let http: HttpTestingController;
  const base = `${environment.apiUrl}/api/social/collections`;
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule] });
    service = TestBed.inject(SocialHttpService); http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());
  it('sends encoded search and pagination as query parameters', () => {
    service.explore(2, 'Food & travel').subscribe();
    const req = http.expectOne(r => r.url === base);
    expect(req.request.params.get('search')).toBe('Food & travel');
    expect(req.request.params.get('page')).toBe('2');
    expect(req.request.params.get('pageSize')).toBe('25');
    req.flush({ items: [], page: 2, pageSize: 25, totalCount: 0 });
  });
  it('loads paginated shared content and preserves unavailable status', () => {
    let status = 0;
    service.get('public-id', 3).subscribe({ error: e => status = e.status });
    const req = http.expectOne(r => r.url === `${base}/public-id`);
    expect(req.request.params.get('page')).toBe('3');
    expect(req.request.params.get('pageSize')).toBe('25');
    req.flush({}, { status: 404, statusText: 'Not Found' });
    expect(status).toBe(404);
  });
  it('forks through POST without client ownership or learning state', () => {
    service.fork('public-id').subscribe();
    const req = http.expectOne(`${base}/public-id/fork`);
    expect(req.request.method).toBe('POST'); expect(req.request.body).toEqual({});
    req.flush({ id: 12 });
  });
  it('saves numeric visibility through owner route', () => {
    service.visibility(12, 1).subscribe();
    const req = http.expectOne(`${environment.apiUrl}/api/collections/12/visibility`);
    expect(req.request.method).toBe('PUT'); expect(req.request.body).toEqual({ visibility: 1 });
    req.flush({ id: 12, visibility: 1 });
  });
  it('encodes whole-collection search as an optional query without changing paging arguments', () => {
    service.get('public-id', 2, 50, 'Дом & tea').subscribe();
    const req = http.expectOne(r => r.url === `${base}/public-id`);
    expect(req.request.params.get('search')).toBe('Дом & tea');
    expect(req.request.params.get('page')).toBe('2'); expect(req.request.params.get('pageSize')).toBe('50');
    expect(req.request.urlWithParams).toContain('%26');
    req.flush({ cards: [], page: 2, pageSize: 50, totalCount: 0, cardsCount: 100 });
  });

});
