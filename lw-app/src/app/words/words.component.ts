import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
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
  editWordForm: FormGroup;
  formOpen = false;
  editingWordId: number | null = null;

  constructor(
    private formBuilder: FormBuilder,
    private cardHttp: CardHttpService,
    private wordHttp: WordHttpService
  ) {
    this.newWordForm = this.formBuilder.group({
      value: ["", Validators.required],
      transcription: [""],
      translation: ["", Validators.required]
    });
    this.editWordForm = this.formBuilder.group({
      value: ["", Validators.required],
      transcription: [""],
      translation: ["", Validators.required]
    })
  }

  @Output() onCardAdded = new EventEmitter<Card>();
  @Output() onCardRemoved = new EventEmitter<number>();

  ngOnInit(): void {

  }

  toggleForm() {
    this.formOpen = !this.formOpen;
  }

  startEdit(word: Word) {
    if (word.id === null) {
      return;
    }

    this.editingWordId = word.id;
    this.editWordForm.reset({
      value: word.value,
      transcription: word.transcription,
      translation: word.translation
    });
  }

  cancelEdit() {
    this.editingWordId = null;
    this.editWordForm.reset();
  }

  addWord() {
    if (this.newWordForm.invalid) {
      this.newWordForm.markAllAsTouched();
      return;
    }

    let newWord = new Word(null,
      this.newWordForm.controls["value"].value,
      this.newWordForm.controls["transcription"].value,
      this.newWordForm.controls["translation"].value);

    if (this.card === undefined) {
      let newCard = new Card(null, this.collectionId, false, new Array<Word>);
      newCard.words.push(newWord);
      this.cardHttp.add(newCard).subscribe({
        next: (data: any) => {
          this.addCard(data);
          this.closeForm();
        }
      })
    }
    else {
      this.wordHttp.add(newWord, this.card!.id!).subscribe({
        next: (data: any) => {
          this.addWordToCard(data);
          this.closeForm();
        }
      })
    }
  }

  saveEdit(word: Word) {
    if (word.id === null || this.card?.id === null || this.card?.id === undefined) {
      return;
    }

    if (this.editWordForm.invalid) {
      this.editWordForm.markAllAsTouched();
      return;
    }

    const updatedWord = new Word(
      word.id,
      this.editWordForm.controls["value"].value,
      this.editWordForm.controls["transcription"].value,
      this.editWordForm.controls["translation"].value
    );

    this.wordHttp.update(updatedWord, this.card.id, word.id).subscribe({
      next: (data: any) => {
        this.replaceWord(word, data);
        this.cancelEdit();
      }
    });
  }

  deleteWord(word: Word) {
    if (word.id === null || this.card?.id === null || this.card?.id === undefined) {
      return;
    }

    const isLastWord = this.card.words.length === 1;

    this.wordHttp.delete(this.card.id, word.id).subscribe({
      next: () => {
        if (isLastWord) {
          this.onCardRemoved.emit(this.card!.id!);
          return;
        }

        this.card!.words = this.card!.words.filter(existingWord => existingWord !== word);
        if (this.editingWordId === word.id) {
          this.cancelEdit();
        }
      }
    });
  }

  addCard(data: any) {
    this.onCardAdded.emit(data);
  }

  addWordToCard(word: Word) {
    this.card?.words.push(word);
  }

  private replaceWord(currentWord: Word, updatedWord: Word) {
    const wordIndex = this.card?.words.indexOf(currentWord) ?? -1;
    if (wordIndex >= 0) {
      this.card!.words[wordIndex] = updatedWord;
    }
  }

  private closeForm() {
    this.newWordForm.reset();
    this.formOpen = false;
  }
}
