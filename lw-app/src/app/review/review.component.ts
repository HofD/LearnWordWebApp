import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReviewHttpService } from './review.http.service';

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
    transcription: string;
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

  constructor(
    private reviewService: ReviewHttpService,
    private route: ActivatedRoute
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
        },
        error: (error) => {
          console.error('Error loading cards:', error);
          this.loaded = true;
        }
      });
  }

  toggleTranslation() {
    this.showTranslation = !this.showTranslation;
  }

  onLearn() {
    if (!this.currentCard) return;
    
    this.reviewService.markAsLearned(this.currentCard.id)
      .subscribe({
        next: () => {
          this.nextCard();
          this.showTranslation = false;
        },
        error: (error) => console.error('Error marking card as learned:', error)
      });
  }

  onForget() {
    if (!this.currentCard) return;
    
    this.reviewService.markAsForgotten(this.currentCard.id)
      .subscribe({
        next: () => {
          this.nextCard();
          this.showTranslation = false;
        },
        error: (error) => console.error('Error marking card as forgotten:', error)
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