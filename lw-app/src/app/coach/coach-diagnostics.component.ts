import { CommonModule, DOCUMENT } from '@angular/common';
import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { I18nService } from '../i18n/i18n.service';
import { CoachHttpService } from './coach.http.service';
import { CoachDiagnostics } from './coach.models';

@Component({
  selector: 'app-coach-diagnostics', standalone: true, imports: [CommonModule, RouterLink],
  templateUrl: './coach-diagnostics.component.html', styleUrl: './coach-diagnostics.component.css'
})
export class CoachDiagnosticsComponent implements OnInit, OnDestroy {
  diagnostics: CoachDiagnostics | null = null;
  json = '';
  loading = false;
  error = false;
  downloadError = false;
  private sessionId = '';
  private routeRequest?: Subscription;
  private readRequest?: Subscription;
  private readonly downloadUrls = new Set<string>();

  constructor(private coach: CoachHttpService, private route: ActivatedRoute,
    public i18n: I18nService, @Inject(DOCUMENT) private document: Document) {}

  ngOnInit() {
    this.routeRequest = this.route.paramMap.subscribe(params => {
      this.readRequest?.unsubscribe();
      this.loading = false;
      this.sessionId = params.get('sessionId') ?? '';
      this.load();
    });
  }
  ngOnDestroy() {
    this.routeRequest?.unsubscribe();
    this.readRequest?.unsubscribe();
    for (const url of this.downloadUrls) URL.revokeObjectURL(url);
    this.downloadUrls.clear();
  }
  load() {
    if (this.loading) return;
    this.diagnostics = null;
    this.json = '';
    this.error = false;
    this.downloadError = false;
    if (!this.sessionId) { this.error = true; return; }
    this.loading = true;
    this.readRequest = this.coach.diagnostics(this.sessionId).subscribe({
      next: result => {
        this.diagnostics = result;
        this.json = JSON.stringify(result, null, 2);
        this.loading = false;
      },
      error: () => { this.loading = false; this.error = true; }
    });
  }
  download() {
    if (!this.json) return;
    this.downloadError = false;
    try {
      const url = URL.createObjectURL(new Blob([this.json], { type: 'application/json;charset=utf-8' }));
      this.downloadUrls.add(url);
      const link = this.document.createElement('a');
      link.href = url;
      link.download = 'learnword-coach-diagnostics.json';
      link.hidden = true;
      this.document.body.appendChild(link);
      link.click();
      link.remove();
      // Revoke after the browser has consumed the click; also cleaned up on navigation.
      setTimeout(() => {
        if (this.downloadUrls.delete(url)) URL.revokeObjectURL(url);
      }, 0);
    } catch {
      this.downloadError = true;
    }
  }
}
