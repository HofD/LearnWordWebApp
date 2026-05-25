import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiError, CollectionHttpService, GeneratedCardSuggestion } from '../collections/collection.http.service';
import { Collection } from './collection';
import { NgFor, NgIf } from '@angular/common';
import { CardsComponent } from '../cards/cards.component';
import { I18nService } from '../i18n/i18n.service';
import { FormsModule } from '@angular/forms';
import { Card } from '../card/card';
import { Word } from '../card/word';
import { CardHttpService } from '../card/card.http.service';
import { catchError, forkJoin, of } from 'rxjs';
import { AnalyticsService } from '../shared/services/analytics.service';
import { AnalyticsEvents } from '../shared/services/analytics-events';

@Component({
  selector: 'app-collection',
  standalone: true,
  imports: [NgIf, NgFor, FormsModule, CardsComponent],
  templateUrl: './collection.component.html',
  styleUrl: './collection.component.css'
})
export class CollectionComponent implements OnInit {

  collection!: Collection;
  loaded = false;
  aiPanelOpen = false;
  sourceText = '';
  sourceLanguage = 'English';
  targetLanguage = 'Russian';
  level = 'A2';
  maxCards = 8;
  readonly languageOptions = [
    'English',
    'Mandarin Chinese',
    'Hindi',
    'Spanish',
    'French',
    'Arabic',
    'Bengali',
    'Portuguese',
    'Russian',
    'Urdu'
  ];
  readonly levelOptions = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
  suggestions: Array<GeneratedCardSuggestion> = [];
  selectedSuggestions = new Set<number>();
  generating = false;
  savingSuggestions = false;
  generationError = '';
  saveError = '';
  saveSuccess = '';

  constructor(
    private route: ActivatedRoute,
    private http: CollectionHttpService,
    private cardHttp: CardHttpService,
    private analytics: AnalyticsService,
    public i18n: I18nService
  ) { }

  ngOnInit(): void {
    let collectionId = this.route.snapshot.params["id"];
    this.http.get(collectionId).subscribe(
      {
        next: (data: any) => this.loadCollection(data)
      }
    )
  }

  loadCollection(data: any) {
    this.collection = data;
    this.loaded = true;
  }

  toggleAiPanel() {
    this.aiPanelOpen = !this.aiPanelOpen;
  }

  generateSuggestions() {
    if (!this.sourceText.trim() || this.generating || this.savingSuggestions) {
      return;
    }

    this.generating = true;
    this.generationError = '';
    this.saveError = '';
    this.saveSuccess = '';

    this.http.generateCards(this.collection.id, {
      sourceText: this.sourceText.trim(),
      sourceLanguage: this.emptyToUndefined(this.sourceLanguage),
      targetLanguage: this.emptyToUndefined(this.targetLanguage),
      level: this.emptyToUndefined(this.level),
      maxCards: this.safeMaxCards()
    }).subscribe({
      next: response => {
        this.suggestions = response.cards ?? [];
        this.selectedSuggestions = new Set(this.suggestions.map((_, index) => index));
        this.analytics.reachGoal(AnalyticsEvents.AiCardsGenerated, {
          collectionId: this.collection.id,
          cardsCount: this.suggestions.length,
          sourceLanguage: this.emptyToUndefined(this.sourceLanguage),
          targetLanguage: this.emptyToUndefined(this.targetLanguage),
          level: this.emptyToUndefined(this.level)
        });
        this.generating = false;
      },
      error: error => {
        this.generationError = this.generationErrorMessage(error);
        this.generating = false;
      }
    });
  }

  toggleSuggestion(index: number) {
    if (this.generating || this.savingSuggestions) {
      return;
    }

    if (this.selectedSuggestions.has(index)) {
      this.selectedSuggestions.delete(index);
      return;
    }

    this.selectedSuggestions.add(index);
  }

  isSuggestionSelected(index: number) {
    return this.selectedSuggestions.has(index);
  }

  selectedCount() {
    return this.selectedSuggestions.size;
  }

  saveSelectedSuggestions() {
    const selectedCards = this.suggestions
      .map((suggestion, index) => ({ index, card: this.suggestionToCard(suggestion) }))
      .filter(suggestion => this.selectedSuggestions.has(suggestion.index));

    if (selectedCards.length === 0 || this.generating || this.savingSuggestions) {
      return;
    }

    this.savingSuggestions = true;
    this.saveError = '';
    this.saveSuccess = '';

    forkJoin(selectedCards.map(suggestion =>
      this.cardHttp.add(suggestion.card).pipe(catchError(() => of(null)))
    )).subscribe({
      next: savedCards => {
        const savedIndexes = new Set<number>();
        const savedCollectionCards = savedCards.filter((card): card is Card => card !== null) as Array<Card>;

        savedCards.forEach((card, index) => {
          if (card !== null) {
            savedIndexes.add(selectedCards[index].index);
          }
        });

        this.collection.cards.push(...savedCollectionCards);
        if (savedCollectionCards.length > 0) {
          this.analytics.reachGoal(AnalyticsEvents.CardCreated, {
            collectionId: this.collection.id,
            cardsCount: savedCollectionCards.length,
            source: 'ai'
          });
        }
        if (savedCollectionCards.length === selectedCards.length) {
          this.resetAiForm();
        } else {
          this.suggestions = this.suggestions.filter((_, index) => !savedIndexes.has(index));
          this.selectedSuggestions = new Set(
            Array.from(this.selectedSuggestions).filter(index => !savedIndexes.has(index))
          );
        }
        this.saveSuccess = savedCollectionCards.length > 0 ? this.i18n.text().aiCards.saveSuccess : '';
        this.saveError = savedCollectionCards.length === selectedCards.length ? '' : this.i18n.text().aiCards.saveError;
        this.savingSuggestions = false;
      }
    });
  }

  private suggestionToCard(suggestion: GeneratedCardSuggestion) {
    return new Card(null, this.collection.id, false, [
      new Word(null, suggestion.value, suggestion.transcription ?? '', suggestion.translation)
    ]);
  }

  private emptyToUndefined(value: string) {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
  }

  private safeMaxCards() {
    const rounded = Math.round(Number(this.maxCards));
    return Math.min(10, Math.max(1, Number.isFinite(rounded) ? rounded : 8));
  }

  private generationErrorMessage(error: unknown) {
    if (error instanceof ApiError) {
      if (error.code === 'ai_provider_rate_limited') {
        return this.i18n.text().aiCards.providerRateLimited;
      }

      if (error.code === 'ai_provider_unavailable' || error.code === 'ai_provider_configuration_error') {
        return this.i18n.text().aiCards.providerUnavailable;
      }
    }

    return this.i18n.text().aiCards.generateError;
  }

  private resetAiForm() {
    this.sourceText = '';
    this.sourceLanguage = 'English';
    this.targetLanguage = 'Russian';
    this.level = 'A2';
    this.maxCards = 8;
    this.suggestions = [];
    this.selectedSuggestions = new Set<number>();
  }

}
