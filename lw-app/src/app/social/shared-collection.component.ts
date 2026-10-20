import { PagerComponent } from '../shared/ui/pager.component';
import { CollectionHeadingComponent } from '../shared/ui/collection-heading.component';
import { CardFrameComponent } from '../shared/ui/card-frame.component';
import { WordDisplayComponent } from '../shared/ui/word-display.component';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Subject, Subscription, takeUntil, timer } from 'rxjs';
import { SocialDetails, SocialHttpService } from './social.http.service';
import { I18nService } from '../i18n/i18n.service';
import { AnalyticsService } from '../shared/services/analytics.service';
import { AnalyticsEvents } from '../shared/services/analytics-events';

@Component({
  selector: 'app-shared-collection', standalone: true, imports: [PagerComponent, CollectionHeadingComponent, CardFrameComponent, WordDisplayComponent, CommonModule, RouterLink],
  templateUrl: './shared-collection.component.html',
  styles: [`.shared-search-count{margin-top:.125rem;color:var(--lw-text);font-weight:600}.shared-search-empty{border-style:dashed;background:#fbfcfd}.shared-card-search{margin:0}.shared-card-search input{width:min(16rem,44vw)}@media(max-width:575.98px){.shared-card-search,.shared-card-search input{width:100%}}`]
})
export class SharedCollectionComponent implements OnInit, OnDestroy {
  private readonly destroyed = new Subject<void>();
  private request?: Subscription;
  private searchTimer?: Subscription;
  private forkRequest?: Subscription;
  private viewed = false;
  publicId = '';
  search = '';
  searchPending = false;
  activeSearch = '';
  page = 1;
  pageSize = 25;
  readonly pageSizeOptions = [25, 50];
  details?: SocialDetails;
  loading = false;
  error = false;
  unavailable = false;
  forking = false;
  forkError = false;
  forkedId?: number;
  constructor(private route: ActivatedRoute, private http: SocialHttpService, private analytics: AnalyticsService, public i18n: I18nService) {}
  ngOnInit() {
    this.route.paramMap.pipe(takeUntil(this.destroyed)).subscribe(params => {
      this.cancelSearchWork(); this.forkRequest?.unsubscribe(); this.forking = false;
      this.publicId = params.get('publicId') ?? '';
      this.loading = false; this.details = undefined; this.forkedId = undefined;
      this.viewed = false; this.forkError = false; this.search = ''; this.activeSearch = '';
      this.load(1);
    });
  }
  get searchBusy() { return this.loading || this.searchPending; }
  onSearchInput(value: string) {
    if (this.forking || this.unavailable) return;
    this.search = value;
    const query = value.trim();
    if (query === this.activeSearch && !this.searchBusy && !this.error) return;
    this.cancelSearchWork();
    this.page = 1; this.error = false; this.forkError = false;
    if (!query) {
      this.activeSearch = ''; this.load(1);
      return;
    }
    this.searchPending = true;
    this.searchTimer = timer(300).subscribe(() => {
      this.searchPending = false;
      this.activeSearch = query;
      this.load(1);
    });
  }
  clearSearch() { this.onSearchInput(''); }
  private cancelSearchWork() {
    this.searchTimer?.unsubscribe(); this.request?.unsubscribe();
    this.searchPending = false; this.loading = false;
  }
  changePageSize(size: number) {
    if (this.searchBusy || this.forking || !this.pageSizeOptions.includes(size) || size === this.pageSize) return;
    this.pageSize = size; this.load(1);
  }
  load(page = this.page) {
    if (this.searchBusy || this.forking || page < 1) return;
    this.page = page; this.loading = true; this.error = false; this.unavailable = false;
    this.request = this.http.get(this.publicId, page, this.pageSize, this.activeSearch).pipe(takeUntil(this.destroyed)).subscribe({
      next: result => {
        this.details = result; this.loading = false;
        if (!this.viewed) { this.analytics.reachGoal(AnalyticsEvents.CollectionViewed); this.viewed = true; }
      },
      error: error => {
        this.loading = false; this.unavailable = error.status === 404; this.error = !this.unavailable;
        if (this.unavailable) this.details = undefined;
      }
    });
  }
  fork() {
    if (this.forking || this.searchBusy || this.error || this.unavailable || !this.details || this.details.isOwner || this.forkedId) return;
    this.forking = true; this.forkError = false;
    this.forkRequest = this.http.fork(this.publicId).pipe(takeUntil(this.destroyed)).subscribe({
      next: result => { this.forkedId = result.id; this.forking = false; this.analytics.reachGoal(AnalyticsEvents.CollectionForked); },
      error: error => {
        this.forking = false; this.forkError = true;
        if (error.status === 404) { this.details = undefined; this.unavailable = true; this.forkError = false; }
      }
    });
  }
  ngOnDestroy() { this.destroyed.next(); this.destroyed.complete(); this.cancelSearchWork(); this.forkRequest?.unsubscribe(); }
}
