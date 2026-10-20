import { PagerComponent } from '../shared/ui/pager.component';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { I18nService } from '../i18n/i18n.service';
import { SocialHttpService, SocialPage } from './social.http.service';

@Component({
  selector: 'app-explore', standalone: true, imports: [PagerComponent, CommonModule, FormsModule, RouterLink],
  templateUrl: './explore.component.html'
})
export class ExploreComponent implements OnInit, OnDestroy {
  private readonly destroyed = new Subject<void>();
  search = '';
  activeSearch = '';
  page = 1;
  pageSize = 25;
  readonly pageSizeOptions = [25, 50];
  result?: SocialPage;
  loading = false;
  error = false;
  constructor(private http: SocialHttpService, public i18n: I18nService) {}
  ngOnDestroy() { this.destroyed.next(); this.destroyed.complete(); }
  ngOnInit() { this.load(); }
  submitSearch() { if (this.loading) return; this.activeSearch = this.search.trim(); this.load(1); }
  changePageSize(size: number) {
    if (this.loading || !this.pageSizeOptions.includes(size) || size === this.pageSize) return;
    this.pageSize = size; this.load(1);
  }
  load(page = this.page) {
    if (this.loading || page < 1) return;
    this.page = page; this.loading = true; this.error = false;
    this.http.explore(page, this.activeSearch, this.pageSize).pipe(takeUntil(this.destroyed)).subscribe({
      next: result => { this.result = result; this.loading = false; },
      error: () => { this.error = true; this.loading = false; }
    });
  }
}
