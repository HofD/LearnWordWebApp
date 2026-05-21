import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReviewHttpService, ReviewOutcome } from './review.http.service';
import { I18nService } from '../i18n/i18n.service';

interface Word {
    id: number;
    value: string;
    transcription: string;
    translation: string;
}

interface Card {
    id: number;
    collectionId: number;
    words: Word[];
    learnt: boolean;
    dueDate?: string | null;
    intervalDays?: number | null;
    easeFactor?: number | null;
    reviewCount?: number | null;
    lastReviewedAt?: string | null;
}

@Component({
  selector: 'app-review',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './review.component.html',
  styleUrl: './review.component.css'
})
export class ReviewComponent implements OnInit {
  currentCard: Card | null = null;
  cards: Card[] = [];
  currentIndex = 0;
  loaded = false;
  showTranslation = false;
  submitting = false;

  constructor(
    private reviewService: ReviewHttpService,
    private route: ActivatedRoute,
    public i18n: I18nService
  ) {}

  ngOnInit() {
    const collectionId = this.route.snapshot.params['collectionId'];
    this.loadCards(collectionId);
  }

  loadCards(collectionId: number) {
    this.reviewService.getCardsForReview(collectionId)
      .subscribe({
        next: (response: any) => {
          this.cards = response as Card[];
          this.currentCard = this.cards[0] || null;
          this.loaded = true;
          this.showTranslation = false;
          this.submitting = false;
        },
        error: (error) => {
          console.error('Error loading cards:', error);
          this.loaded = true;
          this.submitting = false;
        }
      });
  }

  toggleTranslation() {
    this.showTranslation = !this.showTranslation;
  }

  submitReview(outcome: ReviewOutcome) {
    if (!this.currentCard) return;

    this.submitting = true;
    this.reviewService.reviewCard(this.currentCard.id, outcome)
      .subscribe({
        next: () => {
          this.nextCard();
          this.showTranslation = false;
          this.submitting = false;
        },
        error: (error) => {
          console.error('Error reviewing card:', error);
          this.submitting = false;
        },
      });
  }

  nextCard() {
    this.currentIndex++;
    if (this.currentIndex < this.cards.length) {
      this.currentCard = this.cards[this.currentIndex];
      this.showTranslation = false;
    } else {
      this.currentCard = null;
    }
  }
}
