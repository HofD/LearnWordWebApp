import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { ReviewHttpService, ReviewOutcome, ReviewTelemetry } from './review.http.service';
import { I18nService } from '../i18n/i18n.service';
import { AnalyticsService } from '../shared/services/analytics.service';
import { AnalyticsEvents } from '../shared/services/analytics-events';
import { LearningCard, LearningHttpService, LearningSession } from '../learning/learning.http.service';

@Component({
  selector: 'app-review',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './review.component.html',
  styleUrl: './review.component.css'
})
export class ReviewComponent implements OnInit, OnDestroy {
  currentCard: LearningCard | null = null;
  cards: LearningCard[] = [];
  currentIndex = 0;
  loaded = false;
  showTranslation = false;
  submitting = false;
  loadError = false;
  reviewError = false;
  completionError = false;
  completing = false;
  finished = false;
  successfulReviews = 0;
  failedReviews = 0;
  collectionId!: number;
  session: LearningSession | null = null;
  private todayMode = false;
  private reviewStarted = false;
  private cardShownAt = 0;
  private pendingAnswer: { outcome: ReviewOutcome; telemetry: ReviewTelemetry } | null = null;
  private readonly requests = new Subscription();

  constructor(
    private reviewService: ReviewHttpService,
    private route: ActivatedRoute,
    private analytics: AnalyticsService,
    public i18n: I18nService,
    private learning: LearningHttpService
  ) {}

  ngOnInit() {
    this.collectionId = Number(this.route.snapshot.params['collectionId']);
    this.todayMode = this.route.snapshot.queryParams?.['today'] === 'true';
    this.loadCards(this.collectionId);
  }

  ngOnDestroy() { this.requests.unsubscribe(); }

  loadCards(collectionId: number) {
    if (this.submitting || this.completing) return;
    this.loaded = false;
    this.loadError = false;
    if (this.todayMode) {
      this.requests.add(this.learning.start(collectionId).subscribe({
        next: session => { this.session = session; this.acceptCards(session.cards); },
        error: () => { this.loadError = true; this.loaded = true; }
      }));
    } else {
      this.requests.add(this.reviewService.getCardsForReview(collectionId).subscribe({
        next: response => this.acceptCards(response as LearningCard[]),
        error: () => { this.loadError = true; this.loaded = true; }
      }));
    }
  }

  private acceptCards(cards: LearningCard[]) {
    this.cards = cards;
    this.currentIndex = 0;
    this.selectCard();
    this.loaded = true;
    if (cards.length > 0 && !this.reviewStarted) {
      this.reviewStarted = true;
      this.analytics.reachGoal(AnalyticsEvents.ReviewStarted, { collectionId: this.collectionId, cardsCount: cards.length });
    }
    if (cards.length === 0 && this.session) this.completeSession();
  }

  toggleTranslation() { this.showTranslation = !this.showTranslation; }

  submitReview(outcome: ReviewOutcome) {
    if (!this.currentCard || this.submitting || this.pendingAnswer) return;
    this.pendingAnswer = {
      outcome,
      telemetry: {
        sessionId: this.session?.id,
        requestId: crypto.randomUUID(),
        responseTimeMs: Math.min(600000, Math.max(0, Math.round(performance.now() - this.cardShownAt)))
      }
    };
    this.sendAnswer();
  }

  retryAnswer() {
    if (!this.pendingAnswer || this.submitting) return;
    this.sendAnswer();
  }

  private sendAnswer() {
    if (!this.currentCard || !this.pendingAnswer) return;
    const answer = this.pendingAnswer;
    this.submitting = true;
    this.reviewError = false;
    this.requests.add(this.reviewService.reviewCard(this.currentCard.id, answer.outcome, answer.telemetry).subscribe({
      next: () => {
        this.analytics.reachGoal(AnalyticsEvents.ReviewCardAnswered, {
          collectionId: this.collectionId, outcome: answer.outcome,
          cardPosition: this.currentIndex + 1, cardsCount: this.cards.length
        });
        if (answer.outcome === 'Again') this.failedReviews++;
        else this.successfulReviews++;
        this.pendingAnswer = null;
        this.submitting = false;
        this.nextCard();
        if (this.currentCard === null) {
          this.analytics.reachGoal(AnalyticsEvents.ReviewFinished, {
            collectionId: this.collectionId, cardsReviewed: this.currentIndex, cardsCount: this.cards.length
          });
          if (this.session) this.completeSession();
          else this.finished = true;
        }
      },
      error: () => { this.reviewError = true; this.submitting = false; }
    }));
  }

  completeSession() {
    if (!this.session || this.completing || this.finished) return;
    this.completing = true;
    this.completionError = false;
    this.requests.add(this.learning.complete(this.session.id).subscribe({
      next: session => {
        this.session = session;
        this.successfulReviews = session.successfulReviews;
        this.failedReviews = session.failedReviews;
        this.completing = false;
        this.finished = true;
      },
      error: () => { this.completing = false; this.completionError = true; }
    }));
  }

  nextCard() {
    this.currentIndex++;
    this.selectCard();
  }

  private selectCard() {
    this.currentCard = this.cards[this.currentIndex] ?? null;
    this.showTranslation = false;
    this.cardShownAt = performance.now();
  }
}
