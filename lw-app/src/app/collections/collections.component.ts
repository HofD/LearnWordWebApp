import { Component, OnInit } from '@angular/core';
import { CollectionListEntity } from './collectionListEntity';
import { CollectionHttpService } from './collection.http.service';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { NgFor, NgIf } from '@angular/common';
import { I18nService } from '../i18n/i18n.service';
import { AnalyticsService } from '../shared/services/analytics.service';
import { AnalyticsEvents } from '../shared/services/analytics-events';

@Component({
  selector: 'app-collections',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, RouterLink, NgIf, NgFor],
  templateUrl: './collections.component.html',
  styleUrl: './collections.component.css'
})
export class CollectionsComponent implements OnInit {
  newCollectionForm!: FormGroup;
  collections: CollectionListEntity[] = [];
  loaded = false;

  constructor(
    private httpService: CollectionHttpService,
    private formBuilder: FormBuilder,
    private analytics: AnalyticsService,
    public i18n: I18nService
  ) {
    this.newCollectionForm = this.formBuilder.group({
      name: ['', Validators.required]
    })
  }

  ngOnInit(): void {
    this.get();
  }

  get() {
    this.httpService.getList().subscribe(
      {
        next: (data: any) => this.loadCollections(data)
      }
    );
  }

  loadCollections(data: any) {
    this.collections = data["collections"];
    this.loaded = true;
  }

  add() {
    if (this.newCollectionForm.invalid) {
      return;
    }

    this.httpService.add(this.newCollectionForm.controls['name'].value).subscribe({
      next: () => {
        this.analytics.reachGoal(AnalyticsEvents.CollectionCreated, {
          source: 'collections'
        });
        this.get();
      }
    });

    this.newCollectionForm.controls['name'].setValue('');
  }

  delete(id: number) {
    this.httpService.delete(id).subscribe({
      next: () => this.get()
    })
  }

  rename(id: number) {

  }

}
