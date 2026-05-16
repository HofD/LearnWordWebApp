import { Component, Input } from '@angular/core';
import { Card } from '../card/card';
import { CardComponent } from '../card/card.component';
import { NgFor } from '@angular/common';
import { CardHttpService } from '../card/card.http.service';

@Component({
  selector: 'app-cards',
  standalone: true,
  imports: [CardComponent, NgFor],
  templateUrl: './cards.component.html',
  styleUrl: './cards.component.css'
})
export class CardsComponent {
  @Input() cards: Array<Card> = new Array<Card>;
  @Input() collectionId!: number;

  constructor(
    private http: CardHttpService
  ) { }

  addCard(card: Card) {
    this.cards.push(card);
  }

  removeCard(cardId: number) {
    const cardIndex = this.cards.findIndex(card => card.id === cardId);
    if (cardIndex >= 0) {
      this.cards.splice(cardIndex, 1);
    }
  }

  delete(id: number, index: number) {
    this.http.delete(id).subscribe({
      next: () => this.cards.splice(index, 1)
    })
  }
}
