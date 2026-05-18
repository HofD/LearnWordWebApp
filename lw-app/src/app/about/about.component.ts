import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { I18nService } from '../i18n/i18n.service';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './about.component.html',
  styleUrl: './about.component.css'
})
export class AboutComponent {
  version = '1.0.0';
  year = new Date().getFullYear();

  constructor(public i18n: I18nService) {}

  get helpItems(): readonly string[] {
    return this.i18n.text().about.helpItems;
  }

  get technologyItems(): readonly string[] {
    return this.i18n.text().about.technologyItems;
  }
} 
