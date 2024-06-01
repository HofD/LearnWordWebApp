import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { Word } from '../card/word';
import { Card } from '../card/card';
import { NgFor, NgIf } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CardHttpService } from '../card/card.http.service';
import { WordHttpService } from './word.http.service';

@Component({
  selector: 'app-words',
  standalone: true,
  imports: [NgIf, NgFor, FormsModule, ReactiveFormsModule],
  templateUrl: './words.component.html',
  styleUrl: './words.component.css'
})
export class WordsComponent implements OnInit {
  @Input() card?: Card | null;
  @Input() collectionId!: number;
  newWordForm: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private cardHttp: CardHttpService,
    private wordHttp: WordHttpService
  ) {
    this.newWordForm = this.formBuilder.group({
      value: ["", Validators.required],
      transcription: [""],
      translation: ["", Validators.required]
    })
  }

  @Output() onCardAdded = new EventEmitter<Card>();

  ngOnInit(): void {

  }

  addWord() {
    let newWord = new Word(null,
      this.newWordForm.controls["value"].value,
      this.newWordForm.controls["transcription"].value,
      this.newWordForm.controls["translation"].value);

    if (this.card === undefined) {
      let newCard = new Card(null, this.collectionId, false, new Array<Word>);
      newCard.words.push(newWord);
      this.cardHttp.add(newCard).subscribe({
        next: (data: any) => this.addCard(data)
      })
    }
    else {
      this.card?.words.push(newWord);
      this.wordHttp.add(newWord, this.card!.id!).subscribe({
        next: (data: any) => this.updateCard(data)
      })
    }

    this.newWordForm.reset();
  }

  addCard(data: any) {
    this.onCardAdded.emit(data);
  }

  updateCard(data: any) {
    //console.log(data);
    //this.card = data;
    //this.onCardAdded.emit(this.card!);
  }
}
