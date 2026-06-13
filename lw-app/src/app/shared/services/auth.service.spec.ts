import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { AlertService } from './alert.service';
import { I18nService } from '../../i18n/i18n.service';
import { environment } from '../../../environments/environment';
import { AnalyticsService } from './analytics.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let alertService: jasmine.SpyObj<AlertService>;

  beforeEach(() => {
    alertService = jasmine.createSpyObj<AlertService>('AlertService', ['error']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        AuthService,
        I18nService,
        { provide: AlertService, useValue: alertService },
        { provide: AnalyticsService, useValue: jasmine.createSpyObj<AnalyticsService>('AnalyticsService', ['reachGoal']) },
        { provide: Router, useValue: jasmine.createSpyObj<Router>('Router', ['navigate']) }
      ]
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('shows a clear confirmation prompt when login is rejected for unconfirmed email', async () => {
    const loginPromise = service.login('new-user@example.com', 'Password1!');

    const request = httpMock.expectOne(`${environment.apiUrl}/api/auth/login`);
    request.flush(null, { status: 403, statusText: 'Forbidden' });

    await expectAsync(loginPromise).toBeRejected();
    expect(alertService.error).toHaveBeenCalledWith(
      TestBed.inject(I18nService).text().errors.emailNotConfirmed,
      { autoClose: false }
    );
  });
});
