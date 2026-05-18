import { Injectable, computed, signal } from '@angular/core';
import { defaultLanguage, uiLanguages, uiText, UiLanguage } from './ui-text';

const storageKey = 'learnword-ui-language';

@Injectable({
  providedIn: 'root'
})
export class I18nService {
  readonly languages = uiLanguages;
  private readonly selectedLanguage = signal<UiLanguage>(this.loadLanguage());
  readonly language = computed(() => this.selectedLanguage());
  readonly text = computed(() => uiText[this.selectedLanguage()]);

  setLanguage(language: UiLanguage) {
    this.selectedLanguage.set(language);
    localStorage.setItem(storageKey, language);
  }

  isSupportedLanguage(language: string): language is UiLanguage {
    return this.languages.some(item => item.code === language);
  }

  private loadLanguage(): UiLanguage {
    const storedLanguage = localStorage.getItem(storageKey);
    return storedLanguage && this.isSupportedLanguage(storedLanguage)
      ? storedLanguage
      : defaultLanguage;
  }
}
