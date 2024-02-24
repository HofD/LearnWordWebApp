import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { WordsComponent } from '../words/words.component';
import { Card } from './card';
import { Word } from './word';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [WordsComponent],
  templateUrl: './card.component.html',
  styleUrl: './card.component.css'
})
export class CardComponent implements OnInit {
  @Input() collectionId!: number;
  @Input() card: Card = new Card(null, this.collectionId, false, new Array<Word>);
  @Output() onCardAdded = new EventEmitter<Card>();

  ngOnInit(): void {
    this.card.collectionId = this.collectionId;
  }

  onCardAddedFromWords(card: Card) {
    this.onCardAdded.emit(card);
  }

}
