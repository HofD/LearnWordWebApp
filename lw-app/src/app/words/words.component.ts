import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { Word } from '../card/word';
import { Card } from '../card/card';
import { NgFor, NgIf } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CardHttpService } from '../card/card.http.service';

@Component({
  selector: 'app-words',
  standalone: true,
  imports: [NgIf, NgFor, FormsModule, ReactiveFormsModule],
  templateUrl: './words.component.html',
  styleUrl: './words.component.css'
})
export class WordsComponent implements OnInit {
  @Input() card!: Card;
  newWordForm: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private http: CardHttpService
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

    if (this.card.id === null) {
      let newCard = this.card;
      newCard.words.push(newWord);
      this.http.add(newCard).subscribe({
        next: (data: any) => this.updateCard(data)
      })
    }
    else {
      this.card.words.push(newWord);
    }

    this.newWordForm.reset();
  }

  updateCard(data: any) {
    this.card = data;
    this.onCardAdded.emit(this.card);
  }
}
