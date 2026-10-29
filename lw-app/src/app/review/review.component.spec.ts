import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of, Subject, throwError } from 'rxjs';
import { LearningHttpService, LearningSession } from '../learning/learning.http.service';
import { I18nService } from '../i18n/i18n.service';
import { provideRouter } from '@angular/router';

import { CoachAnalysis } from '../coach/coach.models';
import { CoachHttpService } from '../coach/coach.http.service';
import { ReviewComponent } from './review.component';
import { ReviewHttpService, ReviewOutcome } from './review.http.service';

class ReviewHttpServiceStub {
  cards: unknown[] = [];

  getCardsForReview() {
    return of(this.cards);
  }

  reviewCard(_cardId: number, _outcome: ReviewOutcome) {
    return of({});
  }
}

describe('ReviewComponent', () => {
  let component: ReviewComponent;
  let fixture: ComponentFixture<ReviewComponent>;
  let reviewService: ReviewHttpServiceStub;

  beforeEach(async () => {
    reviewService = new ReviewHttpServiceStub();

    await TestBed.configureTestingModule({
      imports: [ReviewComponent],
      providers: [
        provideRouter([]),
        { provide: CoachHttpService, useValue: { analyze: () => of({ status: 'Completed', decision: 'None', interventions: [], observations: [] }) } },
        { provide: ReviewHttpService, useValue: reviewService },
        { provide: LearningHttpService, useValue: {} },
        { provide: ActivatedRoute, useValue: { snapshot: { params: { collectionId: '7' } } } }
      ]
    })
    .compileComponents();
    TestBed.inject(I18nService).setLanguage('en');
  });

  it('keeps the existing single-word review layout', () => {
    reviewService.cards = [
      {
        id: 11,
        collectionId: 7,
        learnt: false,
        words: [
          { id: 21, value: 'Moon', transcription: '[mu:n]', translation: 'Луна' }
        ]
      }
    ];

    fixture = TestBed.createComponent(ReviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    const title: HTMLElement | null = fixture.nativeElement.querySelector('.card-title');

    expect(component).toBeTruthy();
    expect(title?.textContent?.trim()).toBe('Moon');
    expect(fixture.nativeElement.querySelector('.review-word-list')).toBeNull();
    expect(fixture.nativeElement.querySelector('.word-container-list')).toBeNull();
  });

  it('shows every word and matching translation for multi-word cards', () => {
    reviewService.cards = [
      {
        id: 12,
        collectionId: 7,
        learnt: false,
        words: [
          { id: 31, value: 'Moon', transcription: '[mu:n]', translation: 'Луна' },
          { id: 32, value: 'Sun', transcription: '', translation: 'Солнце' }
        ]
      }
    ];

    fixture = TestBed.createComponent(ReviewComponent);
    fixture.detectChanges();

    const wordText = fixture.nativeElement.querySelector('.word-container')?.textContent ?? '';
    expect(wordText).toContain('Moon');
    expect(wordText).toContain('[mu:n]');
    expect(wordText).toContain('Sun');

    const translationButton: HTMLButtonElement = fixture.nativeElement.querySelector('.translation-container');
    translationButton.click();
    fixture.detectChanges();

    const translationText = fixture.nativeElement.querySelector('.translation-container')?.textContent ?? '';
    expect(translationText).toContain('Луна');
    expect(translationText).toContain('Солнце');
  });
});

const sessionCards = [
  { id: 11, collectionId: 7, learnt: false, words: [{ id: 21, value: 'Moon', transcription: '', translation: 'Луна' }] },
  { id: 12, collectionId: 7, learnt: false, words: [{ id: 22, value: 'Sun', transcription: '', translation: 'Солнце' }] }
];
const learningSession: LearningSession = {
  id: '7bb34c93-685f-4ba6-808f-208dc7bc51fa', collectionId: 7,
  startedAt: '2026-10-28T12:00:00Z', completedAt: null,
  plannedCardsCount: 2, completedCardsCount: 0, successfulReviews: 0, failedReviews: 0, cards: sessionCards
};

describe('ReviewComponent learning sessions', () => {
  let review: jasmine.SpyObj<ReviewHttpService>;
  let learning: jasmine.SpyObj<LearningHttpService>;
  let fixture: ComponentFixture<ReviewComponent>;
  let component: ReviewComponent;
  beforeEach(async () => {
    review = jasmine.createSpyObj('ReviewHttpService', ['getCardsForReview', 'reviewCard']);
    learning = jasmine.createSpyObj('LearningHttpService', ['start', 'complete']);
    learning.start.and.returnValue(of(learningSession));
    learning.complete.and.returnValue(of({ ...learningSession, completedAt: '2026-10-28T12:02:00Z', completedCardsCount: 2, successfulReviews: 1, failedReviews: 1 }));
    review.reviewCard.and.returnValue(of({}));
    await TestBed.configureTestingModule({
      imports: [ReviewComponent], providers: [
        provideRouter([]),
        { provide: CoachHttpService, useValue: { analyze: () => of({ status: 'Completed', decision: 'None', interventions: [], observations: [] }) } },
        { provide: ReviewHttpService, useValue: review },
        { provide: LearningHttpService, useValue: learning },
        { provide: ActivatedRoute, useValue: { snapshot: { params: { collectionId: '7' }, queryParams: { today: 'true' } } } }
      ]
    }).compileComponents();
    TestBed.inject(I18nService).setLanguage('en');
  });

  function create() {
    fixture = TestBed.createComponent(ReviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  it('starts the server plan, submits session telemetry and displays the persisted completion summary', () => {
    create();
    expect(learning.start).toHaveBeenCalledOnceWith(7);
    expect(review.getCardsForReview).not.toHaveBeenCalled();
    expect(fixture.nativeElement.textContent).toContain('Completed cards: 0 / 2');
    component.submitReview('Again');
    const args = review.reviewCard.calls.mostRecent().args;
    expect(args[0]).toBe(11);
    expect(args[1]).toBe('Again');
    expect(args[2]?.sessionId).toBe(learningSession.id);
    expect(args[2]?.requestId).toMatch(/^[0-9a-f-]{36}$/);
    expect(args[2]?.responseTimeMs).toBeGreaterThanOrEqual(0);
    expect(args[2]?.responseTimeMs).toBeLessThanOrEqual(600000);
    expect(component.currentCard?.id).toBe(12);
    component.submitReview('Good');
    fixture.detectChanges();
    expect(learning.complete).toHaveBeenCalledOnceWith(learningSession.id);
    expect(fixture.nativeElement.textContent).toContain('Session complete');
    expect(fixture.nativeElement.textContent).toContain('Reviewed: 2');
    expect(fixture.nativeElement.textContent).toContain('Successful: 1');
    expect(fixture.nativeElement.textContent).toContain('Need more work: 1');
    component.completeSession();
    expect(learning.complete.calls.count()).toBe(1);
  });

  it('keeps the deterministic completion visible while Coach is loading or fails', () => {
    const analysis = new Subject<CoachAnalysis>();
    const coach = TestBed.inject(CoachHttpService);
    spyOn(coach, 'analyze').and.returnValue(analysis);
    create(); component.submitReview('Good'); component.submitReview('Again'); fixture.detectChanges();
    expect(component.finished).toBeTrue();
    expect(fixture.nativeElement.textContent).toContain('Session complete');
    expect(fixture.nativeElement.textContent).toContain('Looking for useful extra practice');
    analysis.error(new Error('provider unavailable')); fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('AI Coach is unavailable');
    expect(fixture.nativeElement.textContent).toContain('Reviewed: 2');
    expect(learning.complete.calls.count()).toBe(1);
    expect(review.reviewCard.calls.count()).toBe(2);
  });

  it('blocks duplicate clicks and retries an ambiguous answer using exactly the same payload', () => {
    const pending = new Subject<object>();
    review.reviewCard.and.returnValue(pending);
    create();
    component.submitReview('Good');
    component.submitReview('Easy');
    expect(review.reviewCard.calls.count()).toBe(1);
    const firstArgs = review.reviewCard.calls.mostRecent().args;
    pending.error(new Error('lost response'));
    fixture.detectChanges();
    expect(component.currentIndex).toBe(0);
    expect(component.reviewError).toBeTrue();
    expect(fixture.nativeElement.querySelectorAll('.review-actions button:disabled').length).toBe(4);
    component.submitReview('Again');
    expect(review.reviewCard.calls.count()).toBe(1);
    review.reviewCard.and.returnValue(of({}));
    component.retryAnswer();
    expect(review.reviewCard.calls.mostRecent().args).toEqual(firstArgs);
    expect(component.currentIndex).toBe(1);
    expect(component.successfulReviews).toBe(1);
  });

  it('retries failed session completion without sending either answer again', () => {
    learning.complete.and.returnValue(throwError(() => new Error('offline')));
    create();
    component.submitReview('Good');
    component.submitReview('Good');
    fixture.detectChanges();
    expect(component.completionError).toBeTrue();
    expect(component.finished).toBeFalse();
    expect(fixture.nativeElement.textContent).toContain('Your answers are saved');
    learning.complete.and.returnValue(of({ ...learningSession, completedAt: '2026-10-28T12:02:00Z', completedCardsCount: 2, successfulReviews: 2, failedReviews: 0 }));
    component.completeSession();
    expect(component.finished).toBeTrue();
    expect(review.reviewCard.calls.count()).toBe(2);
  });

  it('distinguishes session start errors from an empty review and supports retry', () => {
    learning.start.and.returnValue(throwError(() => new Error('offline')));
    create();
    expect(component.loadError).toBeTrue();
    expect(fixture.nativeElement.textContent).toContain('Could not start this review');
    expect(fixture.nativeElement.textContent).not.toContain('No Cards to Review');
    learning.start.and.returnValue(of(learningSession));
    component.loadCards(7);
    expect(component.loadError).toBeFalse();
    expect(component.currentCard?.id).toBe(11);
  });
});
