import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { of, Subject, throwError } from 'rxjs';
import { I18nService } from '../i18n/i18n.service';
import { CoachComponent } from './coach.component';
import { CoachHttpService } from './coach.http.service';
import { CoachAnalysis, CoachAnswer, CoachIntervention } from './coach.models';

const lesson: CoachIntervention = {
  id: 'lesson', analysisId: 'analysis', cardId: 7, learningRevision: 1, type: 'MicroLesson',
  title: 'Eventually', status: 'Suggested', createdAt: '2026-10-29T10:00:00Z',
  lesson: { explanation: '<script>unsafe()</script> This is plain text.',
    examples: [{ source: 'Eventually we arrived.', target: 'В конце концов мы приехали.' }], tips: ['Recall the meaning.'] },
  exercises: [], evaluation: { status: 'Unknown', postInterventionAttempts: 0 }
};
const practice: CoachIntervention = {
  ...lesson, id: 'practice', type: 'ExtraPractice', lesson: null,
  exercises: [{ id: 'exercise', type: 'RecognitionChoice', prompt: 'Choose a translation',
    options: [{ id: 'a', text: 'В конце концов' }, { id: 'b', text: 'Сразу' }], answered: false }]
};
function result(interventions: CoachIntervention[] = [lesson]): CoachAnalysis {
  return { id: 'analysis', sessionId: 'session', status: 'Completed', decision: 'Intervention',
    summary: 'Some extra practice may help.', provider: 'Fake', model: 'fake', promptVersion: 'v1', schemaVersion: 1,
    createdAt: '2026-10-29T10:00:00Z', observations: [{ cardId: 7, learningRevision: 1,
      type: 'RepeatedFailure', evidenceSummary: 'Two recent Again reviews.', explanation: 'Two recent reviews were difficult.' }], interventions };
}

describe('CoachComponent', () => {
  let service: jasmine.SpyObj<CoachHttpService>;
  let fixture: ComponentFixture<CoachComponent>;
  let component: CoachComponent;
  beforeEach(async () => {
    service = jasmine.createSpyObj('CoachHttpService', ['analyze', 'analysis', 'intervention', 'accept', 'dismiss', 'complete', 'answer']);
    service.analyze.and.returnValue(of(result()));
    await TestBed.configureTestingModule({ imports: [CoachComponent], providers: [{ provide: CoachHttpService, useValue: service }] }).compileComponents();
    TestBed.inject(I18nService).setLanguage('en');
    fixture = TestBed.createComponent(CoachComponent);
    component = fixture.componentInstance;
  });
  function create() { fixture.componentRef.setInput('sessionId', 'session'); fixture.detectChanges(); }
  it('shows independent loading and hides None and Disabled outcomes without an empty AI panel', () => {
    const pending = new Subject<CoachAnalysis>();
    service.analyze.and.returnValue(pending);
    create();
    expect(fixture.nativeElement.textContent).toContain('Looking for useful extra practice');
    pending.next({ ...result([]), decision: 'None' }); fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('section')).toBeNull();
    fixture.componentRef.setInput('sessionId', 'disabled');
    service.analyze.and.returnValue(of({ ...result([]), status: 'Disabled' })); fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('section')).toBeNull();
  });
  it('cancels an old analysis when the completed session input changes', () => {
    const pending = new Subject<CoachAnalysis>(); service.analyze.and.returnValue(pending); create();
    service.analyze.and.returnValue(of({ ...result([]), decision: 'None' }));
    fixture.componentRef.setInput('sessionId', 'next-session'); fixture.detectChanges();
    expect(service.analyze).toHaveBeenCalledWith('next-session', 'en');
    pending.next(result()); fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('section')).toBeNull();
  });
  it('offers a noncritical retry for provider failures and passes the current UI language', () => {
    service.analyze.and.returnValue(of({ ...result([]), status: 'Failed', failureCode: 'ai_provider_rate_limited' }));
    TestBed.inject(I18nService).setLanguage('ru'); create();
    expect(service.analyze).toHaveBeenCalledWith('session', 'ru');
    expect(fixture.nativeElement.textContent).toContain('Ваше занятие завершено');
    expect(fixture.nativeElement.textContent).not.toContain('ai_provider_rate_limited');
    service.analyze.and.returnValue(of(result()));
    component.analyze(); fixture.detectChanges();
    expect(component.analysisError).toBeFalse();
  });
  it('retries a network failure without making it a learning completion failure', () => {
    service.analyze.and.returnValue(throwError(() => new Error('offline'))); create();
    expect(component.analysisError).toBeTrue();
    expect(fixture.nativeElement.textContent).toContain('Your session is complete');
    service.analyze.and.returnValue(of(result())); component.analyze(); fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Take a closer look');
  });
  it('bounds polling and cancels timers and requests on destruction', fakeAsync(() => {
    service.analyze.and.returnValue(of({ ...result([]), status: 'Pending' }));
    service.analysis.and.returnValue(of({ ...result([]), status: 'Pending' })); create();
    tick(30000); fixture.detectChanges();
    expect(service.analysis.calls.count()).toBe(15);
    expect(component.analysisError).toBeTrue();
    component.analyze(); tick(2000);
    const reads = service.analysis.calls.count(); fixture.destroy(); tick(10000);
    expect(service.analysis.calls.count()).toBe(reads);
  }));
  it('requires acceptance before displaying plain structured lesson fields and records Done', () => {
    service.accept.and.returnValue(of({ ...lesson, status: 'Accepted' }));
    service.complete.and.returnValue(of({ ...lesson, status: 'Completed' })); create();
    expect(fixture.nativeElement.textContent).not.toContain('This is plain text.');
    component.open(lesson); fixture.detectChanges();
    expect(service.accept).toHaveBeenCalledOnceWith('lesson');
    expect(fixture.nativeElement.textContent).toContain('<script>unsafe()</script>');
    expect(fixture.nativeElement.querySelector('script')).toBeNull();
    expect(fixture.nativeElement.textContent).toContain('Eventually we arrived.');
    expect(document.activeElement?.textContent).toBe('Eventually');
    component.complete(component.active!); fixture.detectChanges();
    expect(service.complete).toHaveBeenCalledOnceWith('lesson');
    expect(component.active).toBeNull();
    expect(fixture.nativeElement.textContent).toContain('Completed');
  });
  it('dismisses a suggestion without opening an intervention', () => {
    service.dismiss.and.returnValue(of({ ...lesson, status: 'Dismissed' })); create();
    component.dismiss(lesson); fixture.detectChanges();
    expect(service.accept).not.toHaveBeenCalled();
    expect(service.dismiss).toHaveBeenCalledOnceWith('lesson');
    expect(fixture.nativeElement.querySelector('section')).toBeNull();
  });
  it('validates practice only at the server and preserves an ambiguous submission on retry', () => {
    service.analyze.and.returnValue(of(result([practice])));
    service.accept.and.returnValue(of({ ...practice, status: 'Accepted' }));
    const submitted = new Subject<CoachAnswer>(); service.answer.and.returnValue(submitted); create();
    component.open(practice); fixture.detectChanges();
    expect(fixture.nativeElement.textContent).not.toContain('Correct');
    expect(fixture.nativeElement.querySelectorAll('.coach-options button').length).toBe(2);
    component.choose('b'); component.choose('a');
    expect(service.answer.calls.count()).toBe(1);
    const firstPayload = service.answer.calls.mostRecent().args;
    submitted.error(new Error('lost response')); fixture.detectChanges();
    expect(component.pendingAnswer?.optionId).toBe('b');
    expect(fixture.nativeElement.querySelectorAll('.coach-options button:disabled').length).toBe(2);
    const completed = { ...practice, status: 'Completed' as const,
      exercises: practice.exercises.map(exercise => ({ ...exercise, answered: true, correct: false })) };
    service.answer.and.returnValue(of({ exerciseId: 'exercise', correct: false, explanation: 'Review the meaning.', intervention: completed }));
    component.retryAnswer(); fixture.detectChanges();
    expect(service.answer.calls.mostRecent().args).toEqual(firstPayload);
    expect(fixture.nativeElement.textContent).toContain('Not quite');
    expect(fixture.nativeElement.textContent).toContain('Review the meaning.');
    component.nextExercise(); fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Practice complete. 0 / 1 correct');
    expect(service.complete).not.toHaveBeenCalled();
  });
  it('shows correct feedback only after the server responds', () => {
    service.analyze.and.returnValue(of(result([practice])));
    service.accept.and.returnValue(of({ ...practice, status: 'Accepted' }));
    service.answer.and.returnValue(of({ exerciseId: 'exercise', correct: true, explanation: '',
      intervention: { ...practice, status: 'Completed', exercises: [{ ...practice.exercises[0], answered: true, correct: true }] } }));
    create(); component.open(practice); component.choose('a'); fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Correct');
    component.nextExercise(); fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('1 / 1 correct');
  });
  it('rechecks revision/deletion conflicts and prevents starting stale practice', () => {
    service.accept.and.returnValue(throwError(() => ({ status: 409 })));
    service.intervention.and.returnValue(of({ ...lesson, status: 'Stale' })); create();
    component.open(lesson); fixture.detectChanges();
    expect(component.active).toBeNull();
    expect(fixture.nativeElement.textContent).toContain('This card has changed');
    expect(fixture.nativeElement.querySelector('.coach-actions')).toBeNull();
  });
  it('revalidates accepted work when resumed and blocks duplicate accept clicks', () => {
    const pending = new Subject<CoachIntervention>(); service.accept.and.returnValue(pending); create();
    component.open({ ...lesson, status: 'Accepted' }); component.open(lesson);
    expect(service.accept.calls.count()).toBe(1);
    pending.next({ ...lesson, status: 'Accepted' }); fixture.detectChanges();
    expect(component.active?.status).toBe('Accepted');
  });
});
