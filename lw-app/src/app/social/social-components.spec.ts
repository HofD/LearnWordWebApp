import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { of, Subject, throwError } from 'rxjs';
import { Collection } from '../collection/collection';
import { I18nService } from '../i18n/i18n.service';
import { AnalyticsEvents } from '../shared/services/analytics-events';
import { AnalyticsService } from '../shared/services/analytics.service';
import { CollectionVisibilityComponent } from './collection-visibility.component';
import { ExploreComponent } from './explore.component';
import { SharedCollectionComponent } from './shared-collection.component';
import { SocialDetails, SocialHttpService } from './social.http.service';

const detail: SocialDetails = { publicId: 'source', name: '<img src=x>', author: 'Contributor 12', cardsCount: 1,
  isOwner: false, ownerCollectionId: null, cards: [{ words: [{ value: '<script>word</script>', transcription: 'w', translation: 'слово' }] }],
  page: 1, pageSize: 25, totalCount: 1 };

describe('Social UI', () => {
  let http: jasmine.SpyObj<SocialHttpService>;
  let analytics: jasmine.SpyObj<AnalyticsService>;
  let savedLanguage: string | null;
  beforeEach(() => {
    savedLanguage = localStorage.getItem('learnword-ui-language');
    http = jasmine.createSpyObj('social', ['explore', 'get', 'fork', 'visibility']);
    analytics = jasmine.createSpyObj('analytics', ['reachGoal']);
    http.get.and.returnValue(of(detail));
    http.explore.and.returnValue(of({ items: [], page: 1, pageSize: 25, totalCount: 0 }));
    TestBed.configureTestingModule({
      imports: [CollectionVisibilityComponent, ExploreComponent, SharedCollectionComponent],
      providers: [provideRouter([]), { provide: SocialHttpService, useValue: http }, { provide: AnalyticsService, useValue: analytics },
        { provide: ActivatedRoute, useValue: { paramMap: of(convertToParamMap({ publicId: 'source' })) } }]
    });
    TestBed.inject(I18nService).setLanguage('en');
  });
  afterEach(() => {
    if (savedLanguage === null) localStorage.removeItem('learnword-ui-language');
    else localStorage.setItem('learnword-ui-language', savedLanguage);
  });
  it('searches on submit, resets pagination and blocks repeated loading', () => {
    const component = TestBed.createComponent(ExploreComponent).componentInstance;
    component.ngOnInit(); component.page = 3; component.search = ' food ';
    const pending = new Subject<any>(); http.explore.and.returnValue(pending);
    component.submitSearch(); component.submitSearch();
    expect(http.explore).toHaveBeenCalledWith(1, 'food', 25);
    expect(http.explore.calls.count()).toBe(2);
    pending.error({ status: 500 }); expect(component.error).toBeTrue(); expect(component.loading).toBeFalse();
  });
  it('renders foreign words safely with no editing or review controls', () => {
    const fixture = TestBed.createComponent(SharedCollectionComponent); fixture.detectChanges();
    const html: HTMLElement = fixture.nativeElement;
    expect(html.textContent).toContain('<script>word</script>');
    expect(html.querySelector('script')).toBeNull(); expect(html.querySelector('img')).toBeNull();
    expect(html.textContent).toContain('Save a private copy');
    expect(html.querySelector('a[href="/collections/12"]')).toBeNull();
    expect(analytics.reachGoal).toHaveBeenCalledOnceWith(AnalyticsEvents.CollectionViewed);
  });
  it('shows editor instead of fork for owner', () => {
    http.get.and.returnValue(of({ ...detail, isOwner: true, ownerCollectionId: 12 }));
    const fixture = TestBed.createComponent(SharedCollectionComponent); fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Edit my collection');
    const forkButtons = Array.from(fixture.nativeElement.querySelectorAll('button')) as HTMLButtonElement[];
    expect(forkButtons.some(button => button.textContent?.includes('Save a private copy'))).toBeFalse();
    fixture.componentInstance.fork(); expect(http.fork).not.toHaveBeenCalled();
  });
  it('blocks double fork, tracks only success and links to the created copy', () => {
    const pending = new Subject<Collection>(); http.fork.and.returnValue(pending);
    const fixture = TestBed.createComponent(SharedCollectionComponent); fixture.detectChanges();
    const component = fixture.componentInstance; component.fork(); component.fork();
    expect(http.fork).toHaveBeenCalledTimes(1);
    expect(analytics.reachGoal).not.toHaveBeenCalledWith(AnalyticsEvents.CollectionForked);
    pending.next(new Collection(42, 'copy', [])); fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('a[href="/collections/42"]')).toBeTruthy();
    expect(analytics.reachGoal).toHaveBeenCalledWith(AnalyticsEvents.CollectionForked);
  });
  it('shows unavailable state and no analytics on failed read', () => {
    http.get.and.returnValue(throwError(() => ({ status: 404 })));
    const fixture = TestBed.createComponent(SharedCollectionComponent); fixture.detectChanges();
    expect(fixture.componentInstance.unavailable).toBeTrue();
    expect(fixture.nativeElement.textContent).toContain('unavailable');
    expect(analytics.reachGoal).not.toHaveBeenCalled();
  });
  it('shows a fork error without success analytics and permits retry', () => {
    http.fork.and.returnValue(throwError(() => ({ status: 503 })));
    const fixture = TestBed.createComponent(SharedCollectionComponent); fixture.detectChanges();
    fixture.componentInstance.fork(); fixture.detectChanges();
    expect(fixture.componentInstance.forkError).toBeTrue(); expect(fixture.componentInstance.forking).toBeFalse();
    expect(analytics.reachGoal).not.toHaveBeenCalledWith(AnalyticsEvents.CollectionForked);
  });
  it('saves visibility before exposing a link and guards repeated requests', () => {
    const fixture = TestBed.createComponent(CollectionVisibilityComponent);
    fixture.componentInstance.collection = new Collection(1, 'name', [], 0, 'source'); fixture.detectChanges();
    const component = fixture.componentInstance; const pending = new Subject<Collection>(); http.visibility.and.returnValue(pending);
    component.selected = 2; component.save(); component.save();
    expect(http.visibility).toHaveBeenCalledTimes(1); expect(component.shareUrl).toBe('');
    pending.next(new Collection(1, 'name', [], 2, 'source')); fixture.detectChanges();
    expect(component.shareUrl).toContain('/shared/collections/source');
    expect(analytics.reachGoal).toHaveBeenCalledOnceWith(AnalyticsEvents.CollectionPublished);
    http.visibility.and.returnValue(of(new Collection(1, 'name', [], 0, 'source')));
    component.selected = 0; component.save();
    expect(component.shareUrl).toBe(''); expect(analytics.reachGoal).toHaveBeenCalledWith(AnalyticsEvents.CollectionUnpublished);
  });
  it('retains saved visibility and emits no goal when saving fails', () => {
    const fixture = TestBed.createComponent(CollectionVisibilityComponent);
    fixture.componentInstance.collection = new Collection(1, 'name', [], 0, 'source'); fixture.detectChanges();
    http.visibility.and.returnValue(throwError(() => ({ status: 500 })));
    const component = fixture.componentInstance; component.selected = 2; component.save();
    expect(component.collection.visibility).toBe(0); expect(component.saving).toBeFalse();
    expect(component.error).toBeTruthy(); expect(analytics.reachGoal).not.toHaveBeenCalled();
  });
  it('renders empty shared collections and paginates without duplicate view goals', () => {
    http.get.and.returnValue(of({ ...detail, cards: [], cardsCount: 0, totalCount: 101 }));
    const fixture = TestBed.createComponent(SharedCollectionComponent); fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('no cards');
    fixture.componentInstance.load(2); fixture.detectChanges();
    expect(http.get).toHaveBeenCalledWith('source', 2, 25, '');
    expect(analytics.reachGoal).toHaveBeenCalledOnceWith(AnalyticsEvents.CollectionViewed);
  });
  it('shows localized labels in Russian', () => {
    TestBed.inject(I18nService).setLanguage('ru');
    const fixture = TestBed.createComponent(ExploreComponent); fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Обзор коллекций');
    expect(fixture.nativeElement.textContent).toContain('Открытые коллекции не найдены');
  });
  it('offers a selectable link if the Clipboard API rejects access', async () => {
    const descriptor = Object.getOwnPropertyDescriptor(navigator, 'clipboard');
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: () => Promise.reject(new Error('denied')) } });
    try {
      const fixture = TestBed.createComponent(CollectionVisibilityComponent);
      fixture.componentInstance.collection = new Collection(1, 'name', [], 1, 'source'); fixture.detectChanges();
      await fixture.componentInstance.copy(); fixture.detectChanges();
      expect(fixture.componentInstance.shareError).toContain('Select and copy');
      expect(fixture.componentInstance.copying).toBeFalse();
      expect(fixture.nativeElement.querySelector('input[readonly]').value).toContain('/shared/collections/source');
      expect(analytics.reachGoal).not.toHaveBeenCalled();
    } finally {
      if (descriptor) Object.defineProperty(navigator, 'clipboard', descriptor);
      else delete (navigator as any).clipboard;
    }
  });

  it('keeps access dialog closed initially and resets cancelled selection with focus restoration', () => {
    const fixture = TestBed.createComponent(CollectionVisibilityComponent); const component = fixture.componentInstance;
    component.collection = new Collection(1, 'name', [], 1, 'source'); fixture.detectChanges();
    const dialog: HTMLDialogElement = fixture.nativeElement.querySelector('dialog');
    const trigger: HTMLButtonElement = fixture.nativeElement.querySelector('button[aria-haspopup]');
    expect(dialog.open).toBeFalse(); expect(trigger.textContent).toContain('Unlisted');
    trigger.focus(); trigger.click(); fixture.detectChanges();
    expect(dialog.open).toBeTrue(); expect(component.selected).toBe(1);
    component.selected = 2; dialog.dispatchEvent(new Event('cancel', { cancelable: true })); fixture.detectChanges();
    expect(dialog.open).toBeFalse(); expect(component.selected).toBe(1); expect(document.activeElement).toBe(trigger);
    trigger.click(); fixture.detectChanges(); expect(component.selected).toBe(1);
    component.close(); expect(http.visibility).not.toHaveBeenCalled();
  });
  it('keeps saved link and status on failure, reports dismissed pending error, and blocks reopening while pending', () => {
    const fixture = TestBed.createComponent(CollectionVisibilityComponent); const component = fixture.componentInstance;
    component.collection = new Collection(1, 'name', [], 1, 'source'); fixture.detectChanges();
    const pending = new Subject<Collection>(); http.visibility.and.returnValue(pending);
    const savedUrl = component.shareUrl; component.open(); component.selected = 2; component.save();
    expect(component.saving).toBeTrue(); component.close(); component.open();
    expect(component.opened).toBeFalse(); expect(component.selected).toBe(1);
    pending.error({ status: 500 }); fixture.detectChanges();
    expect(component.shareUrl).toBe(savedUrl); expect(component.collection.visibility).toBe(1);
    expect(fixture.nativeElement.textContent).toContain('Could not save visibility');
    expect(analytics.reachGoal).not.toHaveBeenCalled();
    component.open(); expect(component.selected).toBe(1); expect(component.error).toBe('');
    component.close();
  });
  it('resets social size and search requests to page one without per-keystroke calls', async () => {
    const fixture = TestBed.createComponent(ExploreComponent); fixture.detectChanges(); const component = fixture.componentInstance;
    await fixture.whenStable();
    const input: HTMLInputElement = fixture.nativeElement.querySelector('input[type=search]');
    input.value = ' food '; input.dispatchEvent(new Event('input')); fixture.detectChanges();
    await fixture.whenStable();
    expect(http.explore.calls.count()).toBe(1);
    component.submitSearch(); expect(http.explore).toHaveBeenCalledWith(1, 'food', 25);
    component.page = 3; component.changePageSize(50);
    expect(http.explore).toHaveBeenCalledWith(1, 'food', 50); expect(component.page).toBe(1);
    const count = http.explore.calls.count(); component.changePageSize(100); expect(http.explore.calls.count()).toBe(count);
  });
  it('resets shared server paging on size change and renders only presentation components', () => {
    const fixture = TestBed.createComponent(SharedCollectionComponent); fixture.detectChanges(); const component = fixture.componentInstance;
    component.page = 3; component.changePageSize(50); fixture.detectChanges();
    expect(http.get).toHaveBeenCalledWith('source', 1, 50, ''); expect(component.page).toBe(1);
    const html: HTMLElement = fixture.nativeElement;
    expect(html.querySelector('app-collection-heading')).toBeTruthy(); expect(html.querySelector('app-card-frame')).toBeTruthy();
    expect(html.querySelector('app-word-display')).toBeTruthy();
    expect(html.querySelector('.modal, app-words, app-card, .word-edit-form, .word-form')).toBeNull();
    expect(html.querySelector('form')).toBeNull();
    expect(html.querySelector('input[type=search]')).toBeTruthy();
    expect(html.querySelector('[cardActions], .word-actions')).toBeNull();
    expect(detail.cards[0].words[0].value).toBe('<script>word</script>');
  });

});
