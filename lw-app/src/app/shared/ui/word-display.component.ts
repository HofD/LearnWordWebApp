import { Component, Input } from '@angular/core';
import { NgIf } from '@angular/common';
export interface DisplayWord { value: string; transcription?: string | null; translation: string; }
@Component({
  selector: 'app-word-display', standalone: true, imports: [NgIf],
  template: `<div class="word-display"><div class="word-main"><div class="fs-5 fw-semibold">{{word.value}}</div><div *ngIf="word.transcription" class="text-muted small">{{word.transcription}}</div><div class="text-muted">{{word.translation}}</div></div><ng-content></ng-content></div>`,
  styles: [`:host{display:block;min-width:0}.word-display{display:flex;justify-content:space-between;gap:1rem;align-items:flex-start}.word-main{flex:1 1 auto;min-width:0;overflow-wrap:anywhere}`]
})
export class WordDisplayComponent { @Input({required:true}) word!: DisplayWord; }
