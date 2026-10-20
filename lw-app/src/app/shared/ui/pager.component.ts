import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { I18nService } from '../../i18n/i18n.service';

@Component({
  selector: 'app-pager', standalone: true, imports: [CommonModule],
  template: `
    <div class="cards-pager content-card" [attr.aria-busy]="busy">
      <div class="cards-pager-summary">
        <div>{{i18n.text().cards.showing}} {{rangeStart}}-{{rangeEnd}} {{i18n.text().cards.of}} {{total}}</div>
        <ng-content select="[pagerSummary]"></ng-content>
      </div>
      <div class="cards-pager-controls">
        <ng-content></ng-content>
        <label *ngIf="total > pageSizeOptions[0]" class="cards-page-size">
          <span>{{i18n.text().cards.perPage}}</span>
          <select class="form-select form-select-sm" [value]="pageSize" (change)="changeSize($event)" [disabled]="busy">
            <option *ngFor="let option of pageSizeOptions" [value]="option" [selected]="option === pageSize">{{option}}</option>
          </select>
        </label>
        <div *ngIf="totalPages > 1" class="btn-group btn-group-sm" role="group" [attr.aria-label]="i18n.text().cards.pagination">
          <button type="button" class="btn btn-outline-secondary" (click)="go(currentPage - 1)" [disabled]="busy || currentPage === 1">{{i18n.text().cards.previous}}</button>
          <button type="button" class="btn btn-outline-secondary" disabled>{{currentPage}} / {{totalPages}}</button>
          <button type="button" class="btn btn-outline-secondary" (click)="go(currentPage + 1)" [disabled]="busy || currentPage === totalPages">{{i18n.text().cards.next}}</button>
        </div>
      </div>
    </div>`,
  styleUrl: './pager.component.css'
})
export class PagerComponent {
  @Input() total = 0;
  @Input() page = 1;
  @Input() pageSize = 25;
  @Input() pageSizeOptions = [25, 50, 100];
  @Input() busy = false;
  @Output() pageChange = new EventEmitter<number>();
  @Output() pageSizeChange = new EventEmitter<number>();
  constructor(public i18n: I18nService) {}
  get totalPages() { return Math.max(1, Math.ceil(this.total / this.pageSize)); }
  get currentPage() { return Math.max(1, Math.min(this.page, this.totalPages)); }
  get rangeStart() { return this.total === 0 ? 0 : (this.currentPage - 1) * this.pageSize + 1; }
  get rangeEnd() { return Math.min(this.currentPage * this.pageSize, this.total); }
  go(page: number) {
    if (!this.busy && page >= 1 && page <= this.totalPages && page !== this.currentPage) this.pageChange.emit(page);
  }
  changeSize(event: Event) {
    const size = Number((event.target as HTMLSelectElement).value);
    if (!this.busy && this.pageSizeOptions.includes(size) && size !== this.pageSize) this.pageSizeChange.emit(size);
  }
}
