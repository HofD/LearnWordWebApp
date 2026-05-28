import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { CardsComponent } from './cards.component';
import { Card } from '../card/card';
import { Word } from '../card/word';

describe('CardsComponent', () => {
  let component: CardsComponent;
  let fixture: ComponentFixture<CardsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardsComponent, HttpClientTestingModule, RouterTestingModule]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CardsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should remove a card from the local list by id', () => {
    component.cards = [
      new Card(1, 1, false, []),
      new Card(2, 1, false, [])
    ];

    component.removeCard(1);

    expect(component.cards.map(card => card.id)).toEqual([2]);
  });

  it('should filter cards by word or translation ignoring case and diacritics', () => {
    component.cards = [
      new Card(1, 1, false, [
        new Word(1, 'Café', '', 'Кафе')
      ]),
      new Card(2, 1, false, [
        new Word(2, 'House', '', 'Дом')
      ])
    ];

    component.searchQuery = '  cafe ';

    expect(component.filteredCards.map(card => card.id)).toEqual([1]);
  });

  it('should reset to the first page when search changes', () => {
    component.currentPage = 3;

    component.changeSearchQuery({ target: { value: 'дом' } } as unknown as Event);

    expect(component.searchQuery).toBe('дом');
    expect(component.currentPage).toBe(1);
  });
});
