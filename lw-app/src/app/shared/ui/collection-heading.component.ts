import { Component, Input } from '@angular/core';
@Component({
  selector: 'app-collection-heading', standalone: true,
  template: `<header class="page-heading collection-heading"><div class="heading-copy"><h1>{{name}}</h1><p>{{intro}}</p><ng-content select="[headingMeta]"></ng-content></div><div class="heading-actions"><ng-content></ng-content></div></header>`,
  styles: [`:host{display:block}.collection-heading{display:flex;justify-content:space-between;align-items:flex-start;gap:1rem;flex-wrap:wrap}.heading-copy{min-width:0;flex:1 1 18rem;overflow-wrap:anywhere}.heading-actions{max-width:100%}`]
})
export class CollectionHeadingComponent { @Input() name = ''; @Input() intro = ''; }
