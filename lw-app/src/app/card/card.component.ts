import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { WordsComponent } from '../words/words.component';
import { Card } from './card';
import { Word } from './word';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [WordsComponent, NgIf],
  templateUrl: './card.component.html',
  styleUrl: './card.component.css'
})
export class CardComponent implements OnInit {
  @Input() collectionId!: number;
  @Input() card?: Card | null;
  @Output() onCardAdded = new EventEmitter<Card>();
  @Output() onCardRemoved = new EventEmitter<number>();

  ngOnInit(): void {
    if (this.card === null) {
      this.card = new Card(null, this.collectionId, false, new Array<Word>);
    }
  }

  onCardAddedFromWords(card: Card) {
    this.onCardAdded.emit(card);
  }

  onCardRemovedFromWords(cardId: number) {
    this.onCardRemoved.emit(cardId);
  }

}
