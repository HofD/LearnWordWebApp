import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

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
        { provide: ReviewHttpService, useValue: reviewService },
        { provide: ActivatedRoute, useValue: { snapshot: { params: { collectionId: '7' } } } }
      ]
    })
    .compileComponents();
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
