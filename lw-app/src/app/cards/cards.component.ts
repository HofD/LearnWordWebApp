import { Component, Input } from '@angular/core';
import { Card } from '../card/card';
import { CardComponent } from '../card/card.component';
import { NgFor } from '@angular/common';

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

  addCard(card: Card) {
    this.cards.push(card);
  }
}
