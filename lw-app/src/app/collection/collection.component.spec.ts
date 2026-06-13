import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRoute } from '@angular/router';

import { CollectionComponent } from './collection.component';
import { AnalyticsService } from '../shared/services/analytics.service';

describe('CollectionComponent', () => {
  let component: CollectionComponent;
  let fixture: ComponentFixture<CollectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CollectionComponent, HttpClientTestingModule],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              params: {
                id: 1
              }
            }
          }
        },
        {
          provide: AnalyticsService,
          useValue: {
            reachGoal: jasmine.createSpy('reachGoal')
          }
        }
      ]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CollectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should offer Italian as an AI generation language option', () => {
    expect(component.languageOptions).toContain('Italian');
  });
});
