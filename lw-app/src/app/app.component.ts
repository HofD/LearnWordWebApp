import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';

import { HeaderComponent } from './header/header.component';
import { FormsModule } from '@angular/forms';
import { MessagesComponent } from './messages/messages.component';
import { I18nService } from './i18n/i18n.service';
import { filter } from 'rxjs';
import { AnalyticsService } from './shared/services/analytics.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, FormsModule, HeaderComponent, MessagesComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'lw-app';
  private readonly startYear = 2025;
  private readonly currentYear = new Date().getFullYear();

  constructor(
    public i18n: I18nService,
    private analytics: AnalyticsService,
    private router: Router
  ) {
    this.analytics.start();
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe(event => this.analytics.hit(event.urlAfterRedirects));
  }

  get copyrightYears(): string {
    return this.currentYear > this.startYear
      ? `${this.startYear}-${this.currentYear}`
      : `${this.startYear}`;
  }
}
