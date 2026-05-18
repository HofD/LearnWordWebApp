import { Component } from '@angular/core';
import { I18nService } from '../i18n/i18n.service';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [],
  templateUrl: './about.component.html',
  styleUrl: './about.component.css'
})
export class AboutComponent {
  version = '1.0.0';
  year = new Date().getFullYear();

  constructor(public i18n: I18nService) {}
} 
