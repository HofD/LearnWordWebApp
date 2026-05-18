import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthService } from '../shared/services/auth.service';
import { NgFor, NgIf } from '@angular/common';
import { I18nService } from '../i18n/i18n.service';
import { UiLanguage } from '../i18n/ui-text';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterModule, NgIf, NgFor],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit {
  isUserAuthenticated!: boolean;

  constructor(
    private authService: AuthService,
    public i18n: I18nService
  ) { }

  ngOnInit(): void {
    this.authService.authChanged
    .subscribe(res => {
      this.isUserAuthenticated = res;
    })
  }

  isLoggedIn = () => {
    return this.authService.isLoggedIn();
  }

  logout = () => {
    this.authService.logout();
  }

  setLanguage(language: UiLanguage) {
    this.i18n.setLanguage(language);
  }
}
