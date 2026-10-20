import { Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Collection } from '../collection/collection';
import { I18nService } from '../i18n/i18n.service';
import { SocialHttpService } from './social.http.service';
import { AnalyticsService } from '../shared/services/analytics.service';
import { AnalyticsEvents } from '../shared/services/analytics-events';

@Component({
  selector: 'app-collection-visibility', standalone: true, imports: [CommonModule, FormsModule],
  template: `
    <div class="visibility-actions">
      <button #trigger type="button" class="btn btn-outline-secondary btn-sm" aria-haspopup="dialog" [attr.aria-disabled]="saving" [attr.aria-expanded]="opened" (click)="open()" [attr.aria-label]="i18n.text().social.visibility + ': ' + savedLabel">{{i18n.text().social.access}}: {{savedLabel}} <span aria-hidden="true">▾</span></button>
      <button *ngIf="shareUrl" type="button" class="btn btn-outline-dark btn-sm" (click)="copy()" [disabled]="copying || saving">{{i18n.text().social.copy}}</button>
    </div>
    <p *ngIf="saving && !opened" class="small mt-2 mb-0" role="status">{{i18n.text().social.saving}}</p>
    <p *ngIf="error && !opened" class="small text-danger mt-2 mb-0" role="alert">{{error}}</p>
    <p *ngIf="status" class="small mt-2 mb-0" role="status">{{status}}</p>
    <div *ngIf="shareError" class="share-fallback mt-2">
      <p class="small text-danger" role="alert">{{shareError}}</p>
      <label for="shareUrl" class="form-label">{{i18n.text().social.shareLink}}</label>
      <input id="shareUrl" class="form-control form-control-sm" [value]="shareUrl" readonly (focus)="$any($event.target).select()">
    </div>
    <dialog #dialog aria-labelledby="visibilityTitle" (cancel)="cancelDialog($event)" (close)="onDialogClosed()">
      <div class="stack-sm" [attr.aria-busy]="saving">
        <div class="dialog-heading"><h2 id="visibilityTitle" class="h5 mb-0">{{i18n.text().social.visibility}}</h2><button type="button" class="btn-close" (click)="close()" [attr.aria-label]="i18n.text().common.close"></button></div>
        <p class="small text-muted mb-0">{{i18n.text().social.currentMode}}: {{savedLabel}}</p>
        <label for="collectionVisibility" class="form-label mb-0">{{i18n.text().social.visibility}}</label>
        <select id="collectionVisibility" class="form-select" [(ngModel)]="selected" [disabled]="saving" aria-describedby="visibilityHelp" autofocus>
          <option [ngValue]="0">{{i18n.text().social.private}}</option>
          <option [ngValue]="1">{{i18n.text().social.unlisted}}</option>
          <option [ngValue]="2">{{i18n.text().social.public}}</option>
        </select>
        <p id="visibilityHelp" class="small mb-0">{{selected === 2 ? i18n.text().social.publicHelp : selected === 1 ? i18n.text().social.unlistedHelp : i18n.text().social.privateHelp}}</p>
        <p *ngIf="saving" class="small mb-0" role="status">{{i18n.text().social.saving}}</p>
        <p *ngIf="error" class="text-danger small mb-0" role="alert">{{error}}</p>
        <div class="dialog-footer">
          <button type="button" class="btn btn-outline-secondary" (click)="close()">{{i18n.text().common.cancel}}</button>
          <button type="button" class="btn btn-dark" (click)="save()" [disabled]="saving || selected === collection.visibility">{{saving ? i18n.text().social.saving : i18n.text().social.save}}</button>
        </div>
      </div>
    </dialog>`,
  styles: [`:host{display:block;max-width:100%}.visibility-actions,.dialog-heading,.dialog-footer{display:flex;align-items:center;gap:.5rem;flex-wrap:wrap}.dialog-heading{justify-content:space-between;flex-wrap:nowrap}.dialog-footer{justify-content:flex-end}.visibility-actions .btn{min-height:2.75rem}.share-fallback{max-width:26rem}dialog{width:min(30rem,calc(100vw - 2rem));max-height:calc(100dvh - 2rem);overflow:auto;border:1px solid var(--lw-border);border-radius:var(--lw-radius);padding:1.25rem;box-shadow:var(--lw-shadow);color:var(--lw-text)}dialog::backdrop{background:rgba(33,37,41,.45)}.btn-close{flex-shrink:0}`]

})
export class CollectionVisibilityComponent implements OnInit, OnDestroy {
  private readonly destroyed = new Subject<void>();
  @Input({ required: true }) collection!: Collection;
  @ViewChild('dialog') dialog!: ElementRef<HTMLDialogElement>;
  @ViewChild('trigger') trigger!: ElementRef<HTMLButtonElement>;
  opened = false;
  shareError = '';
  selected = 0;
  saving = false;
  copying = false;
  status = '';
  error = '';
  constructor(private http: SocialHttpService, private analytics: AnalyticsService, public i18n: I18nService) {}
  ngOnDestroy() { this.destroyed.next(); this.destroyed.complete(); this.opened = false; this.dialog?.nativeElement.close(); }
  ngOnInit() { this.selected = this.collection.visibility ?? 0; this.collection.visibility = this.selected; }
  get shareUrl() { return this.collection.visibility !== 0 && this.collection.publicId ? `${window.location.origin}/shared/collections/${encodeURIComponent(this.collection.publicId)}` : ''; }
  get savedLabel() {
    const text = this.i18n.text().social;
    return this.collection.visibility === 2 ? text.public : this.collection.visibility === 1 ? text.unlisted : text.private;
  }
  open() {
    if (this.opened || this.saving) return;
    this.selected = this.collection.visibility; this.error = ''; this.status = '';
    this.opened = true; this.dialog.nativeElement.showModal();
  }
  close() {
    this.dialog.nativeElement.close();
    this.onDialogClosed();
  }
  cancelDialog(event: Event) { event.preventDefault(); this.close(); }
  onDialogClosed() {
    if (!this.opened || this.dialog.nativeElement.open) return;
    this.opened = false; this.selected = this.collection.visibility; this.error = '';
    this.trigger.nativeElement.focus();
  }
  save() {
    if (this.saving || this.selected === this.collection.visibility) return;
    this.saving = true; this.status = ''; this.error = '';
    const previous = this.collection.visibility;
    this.http.visibility(this.collection.id, this.selected).pipe(takeUntil(this.destroyed)).subscribe({
      next: result => {
        this.collection.visibility = result.visibility;
        this.collection.publicId = result.publicId;
        this.selected = result.visibility;
        this.saving = false; this.shareError = '';
        if (this.opened) this.close();
        this.status = this.i18n.text().social.saved;
        if (previous !== 2 && result.visibility === 2) this.analytics.reachGoal(AnalyticsEvents.CollectionPublished);
        if (previous === 2 && result.visibility !== 2) this.analytics.reachGoal(AnalyticsEvents.CollectionUnpublished);
      },
      error: () => { this.saving = false; this.error = this.i18n.text().social.saveError; }
    });
  }
  async copy() {
    if (this.copying || this.saving || !this.shareUrl) return;
    this.copying = true; this.shareError = ''; this.status = '';
    try { await navigator.clipboard.writeText(this.shareUrl); this.status = this.i18n.text().social.copied; }
    catch { this.shareError = this.i18n.text().social.copyError; }
    finally { this.copying = false; }
  }
}
