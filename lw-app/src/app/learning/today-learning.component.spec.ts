import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, Subject, throwError } from 'rxjs';
import { TodayLearningComponent } from './today-learning.component';
import { LearningHttpService } from './learning.http.service';
import { I18nService } from '../i18n/i18n.service';

const plan = { totalCount: 15, estimatedMinutes: 7, groups: { due: 8, weak: 4, new: 3 }, cards: [] };
const summary = { new: 42, learning: 27, weak: 15, strong: 84, totalCardsStudied: 126, attemptsCount: 300, recentAttemptsCount: 18 };

describe('TodayLearningComponent', () => {
  let http: jasmine.SpyObj<LearningHttpService>;
  beforeEach(async () => {
    http = jasmine.createSpyObj('LearningHttpService', ['today', 'summary']);
    http.today.and.returnValue(of(plan));
    http.summary.and.returnValue(of(summary));
    await TestBed.configureTestingModule({
      imports: [TodayLearningComponent], providers: [provideRouter([]), { provide: LearningHttpService, useValue: http }]
    }).compileComponents();
    TestBed.inject(I18nService).setLanguage('en');
  });

  function create() {
    const fixture = TestBed.createComponent(TodayLearningComponent);
    fixture.componentRef.setInput('collectionId', 7);
    fixture.detectChanges();
    return fixture;
  }

  it('shows the backend composition and summary, and links Start to the existing review route', () => {
    const fixture = create();
    const text = fixture.nativeElement.textContent;
    expect(text).toContain('8 Due');
    expect(text).toContain('4 Need practice');
    expect(text).toContain('3 New');
    expect(text).toContain('~7 min');
    expect(text).toContain('Strong 84');
    expect(fixture.nativeElement.querySelector('a').getAttribute('href')).toBe('/review/7?today=true');
    expect(http.today).toHaveBeenCalledOnceWith(7);
  });

  it('does not offer an empty session and localizes the empty state', () => {
    http.today.and.returnValue(of({ ...plan, totalCount: 0 }));
    TestBed.inject(I18nService).setLanguage('ru');
    const fixture = create();
    expect(fixture.nativeElement.querySelector('a')).toBeNull();
    expect(fixture.nativeElement.textContent).toContain('На сегодня всё');
  });

  it('shows a retryable error instead of stale counts or a misleading empty plan', () => {
    http.today.and.returnValue(throwError(() => new Error('offline')));
    const fixture = create();
    expect(fixture.nativeElement.querySelector('[role="alert"]')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('a')).toBeNull();
    http.today.and.returnValue(of(plan));
    fixture.nativeElement.querySelector('button').click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('a')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('[role="alert"]')).toBeNull();
  });

  it('cancels superseded collection reads and refreshes after card count changes', () => {
    const pending = new Subject<typeof plan>();
    http.today.and.returnValue(pending);
    const fixture = create();
    expect(pending.observed).toBeTrue();
    http.today.and.returnValue(of(plan));
    fixture.componentRef.setInput('collectionId', 8);
    fixture.detectChanges();
    expect(pending.observed).toBeFalse();
    expect(http.today).toHaveBeenCalledWith(8);
    fixture.componentRef.setInput('revision', 1);
    fixture.detectChanges();
    expect(http.today.calls.count()).toBe(3);
  });
});
