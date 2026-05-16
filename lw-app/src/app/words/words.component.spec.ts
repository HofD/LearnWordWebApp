import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';

import { WordsComponent } from './words.component';
import { Card } from '../card/card';
import { Word } from '../card/word';
import { WordHttpService } from './word.http.service';

describe('WordsComponent', () => {
  let component: WordsComponent;
  let fixture: ComponentFixture<WordsComponent>;
  let wordHttp: WordHttpService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WordsComponent, HttpClientTestingModule, RouterTestingModule]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(WordsComponent);
    component = fixture.componentInstance;
    wordHttp = TestBed.inject(WordHttpService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should add the saved word after API response', () => {
    const savedWord = new Word(12, 'Moon', '[mu:n]', 'Луна');
    component.card = new Card(4, 1, false, []);
    component.newWordForm.setValue({
      value: 'Moon',
      transcription: '[mu:n]',
      translation: 'Луна'
    });
    spyOn(wordHttp, 'add').and.returnValue(of(savedWord));

    component.addWord();

    expect(component.card.words).toEqual([savedWord]);
  });

  it('should update a word after saving edit', () => {
    const currentWord = new Word(10, 'Moon', '', 'Луна');
    const updatedWord = new Word(10, 'Sun', '', 'Солнце');
    component.card = new Card(4, 1, false, [currentWord]);
    component.startEdit(currentWord);
    component.editWordForm.setValue({
      value: 'Sun',
      transcription: '',
      translation: 'Солнце'
    });
    spyOn(wordHttp, 'update').and.returnValue(of(updatedWord));

    component.saveEdit(currentWord);

    expect(component.card.words[0]).toEqual(updatedWord);
    expect(component.editingWordId).toBeNull();
  });

  it('should render compact icon-only word actions with accessible labels', () => {
    component.card = new Card(4, 1, false, [new Word(10, 'Moon', '', 'Луна')]);

    fixture.detectChanges();

    const editButton: HTMLButtonElement | null = fixture.nativeElement.querySelector('.word-edit-button');
    const deleteButton: HTMLButtonElement | null = fixture.nativeElement.querySelector('.word-delete-button');

    expect(editButton?.getAttribute('aria-label')).toBe('Edit word');
    expect(editButton?.getAttribute('title')).toBe('Edit word');
    expect(editButton?.textContent?.trim()).toBe('');
    expect(editButton?.querySelector('img')?.getAttribute('src')).toBe('assets/icons/pencil.svg');
    expect(deleteButton?.getAttribute('aria-label')).toBe('Delete word');
    expect(deleteButton?.getAttribute('title')).toBe('Delete word');
    expect(deleteButton?.textContent?.trim()).toBe('');
  });

  it('should describe word deletion separately from card deletion', () => {
    component.card = new Card(4, 1, false, [new Word(10, 'Moon', '', 'Луна')]);

    fixture.detectChanges();

    const modalText = fixture.nativeElement.querySelector('.modal-content')?.textContent ?? '';

    expect(modalText).toContain('Delete this word?');
    expect(modalText).toContain('This removes only this word.');
    expect(modalText).toContain('This is the last word, so the card will be removed too.');
  });

  it('should emit card removal after deleting the last word', () => {
    const currentWord = new Word(10, 'Moon', '', 'Луна');
    component.card = new Card(4, 1, false, [currentWord]);
    spyOn(wordHttp, 'delete').and.returnValue(of({}));
    spyOn(component.onCardRemoved, 'emit');

    component.deleteWord(currentWord);

    expect(component.onCardRemoved.emit).toHaveBeenCalledWith(4);
  });
});
