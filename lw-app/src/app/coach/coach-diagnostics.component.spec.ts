import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, ParamMap, provideRouter } from '@angular/router';
import { of, Subject, throwError } from 'rxjs';
import { routes } from '../app.routes';
import { I18nService } from '../i18n/i18n.service';
import { authGuard } from '../shared/services/auth.guard';
import { CoachDiagnosticsComponent } from './coach-diagnostics.component';
import { CoachHttpService } from './coach.http.service';
import { CoachDiagnostics } from './coach.models';

const snapshot: CoachDiagnostics = {
  schemaVersion: 1, sessionId: 'afeef861-9ec4-4dd9-91bc-10300bfe2682', analysisId: 'analysis',
  mode: 'CapturedAtAnalysis', capturedAt: '2026-11-02T10:00:00Z',
  analysis: { status: '<script>unsafe()</script>', decision: 'None', decisionSource: 'Provider', generation: 1 },
  context: { candidateCount: 2, cards: [{ cardId: 7, selectionReason: 'Included' }] },
  providerCalled: true, inputCharacters: 1530
};

describe('CoachDiagnosticsComponent', () => {
  let fixture: ComponentFixture<CoachDiagnosticsComponent>;
  let component: CoachDiagnosticsComponent;
  let service: jasmine.SpyObj<CoachHttpService>;
  let params: Subject<ParamMap>;
  beforeEach(async () => {
    params = new Subject<ParamMap>();
    service = jasmine.createSpyObj('CoachHttpService', ['diagnostics', 'analyze', 'analysis']);
    service.diagnostics.and.returnValue(of(snapshot));
    await TestBed.configureTestingModule({
      imports: [CoachDiagnosticsComponent], providers: [provideRouter([]),
        { provide: CoachHttpService, useValue: service }, { provide: ActivatedRoute, useValue: { paramMap: params } }]
    }).compileComponents();
    TestBed.inject(I18nService).setLanguage('en');
    fixture = TestBed.createComponent(CoachDiagnosticsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });
  function open(id = snapshot.sessionId) { params.next(convertToParamMap({ sessionId: id })); fixture.detectChanges(); }

  it('reads captured diagnostics and displays full JSON as plain text without generating an analysis', () => {
    open();
    expect(service.diagnostics).toHaveBeenCalledOnceWith(snapshot.sessionId);
    expect(service.analyze).not.toHaveBeenCalled();
    expect(service.analysis).not.toHaveBeenCalled();
    expect(fixture.nativeElement.textContent).toContain('CapturedAtAnalysis');
    expect(fixture.nativeElement.textContent).toContain('This snapshot records the evidence');
    expect(fixture.nativeElement.textContent).not.toContain('ReconstructedNow');
    const pre: HTMLElement = fixture.nativeElement.querySelector('pre');
    expect(pre.textContent).toBe(JSON.stringify(snapshot, null, 2));
    expect(fixture.nativeElement.querySelector('script')).toBeNull();
    expect(fixture.nativeElement.textContent).toContain('<script>unsafe()</script>');
  });
  it('labels legacy reconstruction honestly in Russian, with unknown provider use preserved', () => {
    TestBed.inject(I18nService).setLanguage('ru');
    service.diagnostics.and.returnValue(of({ ...snapshot, mode: 'ReconstructedNow', providerCalled: null }));
    open();
    expect(fixture.nativeElement.textContent).toContain('Восстановлено сейчас');
    expect(fixture.nativeElement.textContent).toContain('ReconstructedNow');
    expect(fixture.nativeElement.textContent).toContain('может отличаться от исходного контекста');
    expect(fixture.nativeElement.textContent).toContain('Неизвестно');
    expect(fixture.nativeElement.textContent).not.toContain('CapturedAtAnalysis');
  });
  it('shows loading independently and prevents duplicate read requests', () => {
    const pending = new Subject<CoachDiagnostics>(); service.diagnostics.and.returnValue(pending); open();
    expect(fixture.nativeElement.textContent).toContain('Loading...');
    component.load(); expect(service.diagnostics.calls.count()).toBe(1);
    pending.next(snapshot); fixture.detectChanges();
    expect(component.loading).toBeFalse();
    expect(fixture.nativeElement.querySelector('pre')).not.toBeNull();
  });
  it('provides a generic retry for failed or foreign reads without exposing technical details', () => {
    service.diagnostics.and.returnValue(throwError(() => ({ status: 404, message: 'internal secret message' }))); open();
    expect(component.error).toBeTrue();
    expect(fixture.nativeElement.textContent).toContain('Diagnostics could not be loaded');
    expect(fixture.nativeElement.textContent).not.toContain('internal secret message');
    service.diagnostics.and.returnValue(of(snapshot)); component.load(); fixture.detectChanges();
    expect(component.error).toBeFalse(); expect(service.diagnostics.calls.count()).toBe(2);
    expect(service.analyze).not.toHaveBeenCalled();
  });
  it('cancels a previous session read when the route changes', () => {
    const old = new Subject<CoachDiagnostics>(); service.diagnostics.and.returnValue(old); open('first');
    service.diagnostics.and.returnValue(of({ ...snapshot, sessionId: 'second' })); open('second');
    old.next(snapshot); fixture.detectChanges();
    expect(component.diagnostics?.sessionId).toBe('second');
    expect(service.diagnostics.calls.count()).toBe(2);
  });
  it('cancels pending requests on navigation away', () => {
    const pending = new Subject<CoachDiagnostics>(); service.diagnostics.and.returnValue(pending); open(); fixture.destroy();
    pending.next(snapshot); expect(component.diagnostics).toBeNull();
  });
  it('does not request diagnostics without a session ID', () => {
    params.next(convertToParamMap({})); fixture.detectChanges();
    expect(component.error).toBeTrue(); expect(service.diagnostics).not.toHaveBeenCalled();
  });
  it('downloads the displayed JSON locally with a fixed filename and revokes its object URL', fakeAsync(() => {
    const create = spyOn(URL, 'createObjectURL').and.returnValue('blob:coach-test');
    const revoke = spyOn(URL, 'revokeObjectURL');
    const click = spyOn(HTMLAnchorElement.prototype, 'click').and.callFake(function(this: HTMLAnchorElement) {
      expect(this.download).toBe('learnword-coach-diagnostics.json');
      expect(this.href).toBe('blob:coach-test');
    });
    open(); component.download();
    expect(click).toHaveBeenCalledTimes(1);
    expect(create.calls.mostRecent().args[0] instanceof Blob).toBeTrue();
    expect((create.calls.mostRecent().args[0] as Blob).type).toBe('application/json;charset=utf-8');
    expect(service.diagnostics.calls.count()).toBe(1); expect(service.analyze).not.toHaveBeenCalled();
    expect(revoke).not.toHaveBeenCalled(); tick(); expect(revoke).toHaveBeenCalledOnceWith('blob:coach-test');
  }));
  it('reports download failures without losing the copyable JSON', () => {
    spyOn(URL, 'createObjectURL').and.throwError('Download unavailable'); open(); component.download(); fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Could not download the file');
    expect(fixture.nativeElement.querySelector('pre').textContent).toBe(component.json);
  });
  it('keeps diagnostics behind the existing authentication guard', () => {
    const route = routes.find(item => item.path === 'coach-diagnostics/:sessionId');
    expect(route?.canActivate).toEqual([authGuard]);
    expect(route?.loadComponent).toBeDefined();
  });
});
