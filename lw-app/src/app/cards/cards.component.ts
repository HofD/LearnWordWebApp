import { Component, Input } from '@angular/core';
import { Card } from '../card/card';
import { CardComponent } from '../card/card.component';
import { NgFor, NgIf } from '@angular/common';
import { CardHttpService } from '../card/card.http.service';
import { I18nService } from '../i18n/i18n.service';

@Component({
  selector: 'app-cards',
  standalone: true,
  imports: [CardComponent, NgFor, NgIf],
  templateUrl: './cards.component.html',
  styleUrl: './cards.component.css'
})
export class CardsComponent {
  @Input() cards: Array<Card> = new Array<Card>;
  @Input() collectionId!: number;
  pageSizeOptions = [25, 50, 100];
  pageSize = 25;
  currentPage = 1;
  searchQuery = '';
  cardPendingDelete: Card | null = null;

  constructor(
    private http: CardHttpService,
    public i18n: I18nService
  ) { }

  get totalPages() {
    return Math.max(1, Math.ceil(this.filteredCards.length / this.pageSize));
  }

  get normalizedCurrentPage() {
    return Math.min(this.currentPage, this.totalPages);
  }

  get pageStartIndex() {
    return (this.normalizedCurrentPage - 1) * this.pageSize;
  }

  get pageEndIndex() {
    return Math.min(this.pageStartIndex + this.pageSize, this.filteredCards.length);
  }

  get visibleCards() {
    return this.filteredCards.slice(this.pageStartIndex, this.pageEndIndex);
  }

  get rangeStart() {
    return this.filteredCards.length === 0 ? 0 : this.pageStartIndex + 1;
  }

  get rangeEnd() {
    return this.pageEndIndex;
  }

  get normalizedSearchQuery() {
    return this.normalizeSearchText(this.searchQuery);
  }

  get isSearchActive() {
    return this.normalizedSearchQuery.length > 0;
  }

  get filteredCards() {
    const query = this.normalizedSearchQuery;
    if (!query) {
      return this.cards;
    }

    return this.cards.filter(card =>
      card.words.some(word =>
        this.normalizeSearchText(word.value).includes(query) ||
        this.normalizeSearchText(word.translation).includes(query)
      )
    );
  }

  get shouldShowCardControls() {
    return this.cards.length > 0 || this.isSearchActive;
  }

  get shouldShowPaginationControls() {
    return this.filteredCards.length > this.pageSizeOptions[0];
  }

  addCard(card: Card) {
    this.cards.push(card);
    this.goToLastPage();
  }

  removeCard(cardId: number) {
    const cardIndex = this.cards.findIndex(card => card.id === cardId);
    if (cardIndex >= 0) {
      this.cards.splice(cardIndex, 1);
      this.keepCurrentPageInRange();
    }
  }

  openDeleteModal(card: Card) {
    this.cardPendingDelete = card;
  }

  deletePendingCard() {
    if (this.cardPendingDelete?.id === null || this.cardPendingDelete?.id === undefined) {
      return;
    }

    const id = this.cardPendingDelete.id;

    this.http.delete(id).subscribe({
      next: () => {
        this.cardPendingDelete = null;
        this.removeCard(id);
      }
    });
  }

  goToPreviousPage() {
    this.currentPage = Math.max(1, this.normalizedCurrentPage - 1);
  }

  goToNextPage() {
    this.currentPage = Math.min(this.totalPages, this.normalizedCurrentPage + 1);
  }

  goToLastPage() {
    this.currentPage = this.totalPages;
  }

  changePageSize(event: Event) {
    const value = Number((event.target as HTMLSelectElement).value);
    if (!this.pageSizeOptions.includes(value)) {
      return;
    }

    this.pageSize = value;
    this.keepCurrentPageInRange();
  }

  changeSearchQuery(event: Event) {
    this.searchQuery = (event.target as HTMLInputElement).value;
    this.currentPage = 1;
  }

  trackByCardId(index: number, card: Card) {
    return card.id ?? `${this.pageStartIndex + index}`;
  }

  private keepCurrentPageInRange() {
    this.currentPage = this.normalizedCurrentPage;
  }

  private normalizeSearchText(value: string | null | undefined) {
    return (value ?? '')
      .trim()
      .toLocaleLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }
}
