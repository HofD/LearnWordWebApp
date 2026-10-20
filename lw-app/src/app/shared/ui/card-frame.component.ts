import { Component, Input } from '@angular/core';
import { I18nService } from '../../i18n/i18n.service';
@Component({
  selector: 'app-card-frame', standalone: true,
  template: `<article class="content-card word-card"><div class="word-card-header"><span class="word-card-meta">{{i18n.text().cards.card}} · {{wordCount}} {{wordCount === 1 ? i18n.text().cards.word : i18n.text().cards.words}}</span><ng-content select="[cardActions]"></ng-content></div><ng-content></ng-content></article>`,
  styles: [`:host{display:block;min-width:0}.word-card{border-color:#d7dce1;padding:1rem;box-shadow:0 8px 20px rgba(33,37,41,.06)}.word-card-header{display:flex;justify-content:space-between;gap:.75rem;align-items:center;margin-bottom:.5rem;min-height:2.25rem}.word-card-meta{color:var(--lw-muted);font-size:.8125rem}`]
})
export class CardFrameComponent { @Input() wordCount = 0; constructor(public i18n: I18nService) {} }
