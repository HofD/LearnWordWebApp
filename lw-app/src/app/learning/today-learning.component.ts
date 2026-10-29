import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, OnDestroy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { forkJoin, Subscription } from 'rxjs';
import { I18nService } from '../i18n/i18n.service';
import { LearnerSummary, LearningHttpService, TodayPlan } from './learning.http.service';

@Component({
  selector: 'app-today-learning',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './today-learning.component.html',
  styleUrl: './today-learning.component.css'
})
export class TodayLearningComponent implements OnChanges, OnDestroy {
  @Input({ required: true }) collectionId!: number;
  @Input() revision = 0;
  plan: TodayPlan | null = null;
  summary: LearnerSummary | null = null;
  loading = false;
  error = false;
  private request?: Subscription;

  constructor(private http: LearningHttpService, public i18n: I18nService) {}

  ngOnChanges() { this.refresh(); }
  ngOnDestroy() { this.request?.unsubscribe(); }

  refresh() {
    this.request?.unsubscribe();
    this.plan = null;
    this.summary = null;
    this.loading = true;
    this.error = false;
    this.request = forkJoin({ plan: this.http.today(this.collectionId), summary: this.http.summary(this.collectionId) })
      .subscribe({
        next: result => { this.plan = result.plan; this.summary = result.summary; this.loading = false; },
        error: () => { this.error = true; this.loading = false; }
      });
  }
}
