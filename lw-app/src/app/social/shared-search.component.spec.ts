import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { BehaviorSubject, Observable, of, Subject, Subscriber, throwError } from 'rxjs';
import { I18nService } from '../i18n/i18n.service';
import { AnalyticsService } from '../shared/services/analytics.service';
import { SharedCollectionComponent } from './shared-collection.component';
import { SocialDetails, SocialHttpService } from './social.http.service';

const source: SocialDetails = {
  publicId: 'source', name: 'Source', author: 'Contributor', cardsCount: 100, totalCount: 100,
  isOwner: false, ownerCollectionId: null, page: 1, pageSize: 25,
  cards: [{ words: [{ value: 'Tea', transcription: 'ti:', translation: 'Чай' }] }]
};

describe('Shared collection automatic server search', () => {
  let http: jasmine.SpyObj<SocialHttpService>;
  let route: BehaviorSubject<ReturnType<typeof convertToParamMap>>;
  let savedLanguage: string | null;
  beforeEach(() => {
    savedLanguage = localStorage.getItem('learnword-ui-language');
    route = new BehaviorSubject(convertToParamMap({ publicId: 'source' }));
    http = jasmine.createSpyObj('social', ['get', 'fork']); http.get.and.returnValue(of(source));
    TestBed.configureTestingModule({
      imports: [SharedCollectionComponent],
      providers: [provideRouter([]), { provide: SocialHttpService, useValue: http },
        { provide: AnalyticsService, useValue: { reachGoal: jasmine.createSpy('goal') } },
        { provide: ActivatedRoute, useValue: { paramMap: route } }]
    });
    TestBed.inject(I18nService).setLanguage('en');
  });
  afterEach(() => {
    if (savedLanguage === null) localStorage.removeItem('learnword-ui-language');
    else localStorage.setItem('learnword-ui-language', savedLanguage);
  });
  it('coalesces rapid input at 300ms without a Find button, Enter, or form', fakeAsync(() => {
    const fixture = TestBed.createComponent(SharedCollectionComponent); fixture.detectChanges();
    const input: HTMLInputElement = fixture.nativeElement.querySelector('#sharedSearch');
    const type = (value: string) => { input.value = value; input.dispatchEvent(new Event('input')); fixture.detectChanges(); };
    expect(fixture.nativeElement.querySelector('form, button[type=submit]')).toBeNull();
    type('t'); tick(150); type('te'); tick(150); type('  tea  '); tick(299);
    expect(http.get).toHaveBeenCalledOnceWith('source', 1, 25, '');
    tick(1); expect(http.get).toHaveBeenCalledWith('source', 1, 25, 'tea');
    expect(http.get.calls.count()).toBe(2); expect(fixture.componentInstance.search).toBe('  tea  ');
  }));
  it('keeps input editable/focused while debounce and HTTP are pending and blocks stale paging/size/fork', fakeAsync(() => {
    const fixture = TestBed.createComponent(SharedCollectionComponent); fixture.detectChanges(); const component = fixture.componentInstance;
    const input: HTMLInputElement = fixture.nativeElement.querySelector('#sharedSearch');
    const heading = fixture.nativeElement.querySelector('app-collection-heading');
    input.focus(); input.value = 'чай'; input.dispatchEvent(new Event('input')); fixture.detectChanges();
    component.load(2); component.changePageSize(50); component.fork();
    expect(component.page).toBe(1); expect(component.pageSize).toBe(25); expect(http.get.calls.count()).toBe(1);
    const pending = new Subject<SocialDetails>(); http.get.and.returnValue(pending); tick(300); fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('#sharedSearch')).toBe(input);
    expect(fixture.nativeElement.querySelector('app-collection-heading')).toBe(heading);
    expect(document.activeElement).toBe(input); expect(input.readOnly).toBeFalse(); expect(input.disabled).toBeFalse();
    component.load(2); component.changePageSize(50); component.fork();
    expect(http.get.calls.count()).toBe(2); expect(http.fork).not.toHaveBeenCalled();
    pending.next({ ...source, totalCount: 1 }); fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Found 1 of 100');
  }));
  it('cancels an in-flight read immediately on new input and ignores late results/errors before latest query', fakeAsync(() => {
    const fixture = TestBed.createComponent(SharedCollectionComponent); fixture.detectChanges(); const component = fixture.componentInstance;
    let oldSubscriber!: Subscriber<SocialDetails>; const cancelled = jasmine.createSpy('request cancelled');
    http.get.and.returnValue(new Observable<SocialDetails>(subscriber => { oldSubscriber = subscriber; return cancelled; }));
    component.onSearchInput('old'); tick(300); expect(cancelled).not.toHaveBeenCalled();
    component.onSearchInput('latest'); expect(cancelled).toHaveBeenCalledTimes(1);
    oldSubscriber.next({ ...source, name: 'stale' }); oldSubscriber.error({ status: 404 });
    expect(component.details?.name).toBe('Source'); expect(component.error).toBeFalse(); expect(component.unavailable).toBeFalse();
    http.get.and.returnValue(of({ ...source, name: 'Latest', totalCount: 2 })); tick(299);
    expect(http.get.calls.count()).toBe(2); tick(1);
    expect(http.get).toHaveBeenCalledWith('source', 1, 25, 'latest'); expect(component.details?.name).toBe('Latest');
  }));
  it('keeps applied query on paging/size/retry and clears immediately without a leftover debounce', fakeAsync(() => {
    const fixture = TestBed.createComponent(SharedCollectionComponent); fixture.detectChanges(); const component = fixture.componentInstance;
    component.page = 3; component.onSearchInput(' tea '); tick(300);
    expect(http.get).toHaveBeenCalledWith('source', 1, 25, 'tea');
    component.load(2); expect(http.get).toHaveBeenCalledWith('source', 2, 25, 'tea');
    component.changePageSize(50); expect(http.get).toHaveBeenCalledWith('source', 1, 50, 'tea');
    http.get.and.returnValue(throwError(() => ({ status: 503 }))); component.load(2); fixture.detectChanges();
    expect(component.error).toBeTrue(); expect(fixture.nativeElement.querySelector('#sharedSearch')).toBeTruthy();
    component.fork(); expect(http.fork).not.toHaveBeenCalled();
    http.get.and.returnValue(of(source)); component.load(); expect(http.get).toHaveBeenCalledWith('source', 2, 50, 'tea');
    component.onSearchInput('pending'); tick(100); component.clearSearch();
    expect(component.search).toBe(''); expect(component.activeSearch).toBe('');
    expect(http.get).toHaveBeenCalledWith('source', 1, 50, '');
    const count = http.get.calls.count(); tick(400); expect(http.get.calls.count()).toBe(count);
  }));
  it('native empty input cancels pending HTTP and restores the full collection immediately', fakeAsync(() => {
    const fixture = TestBed.createComponent(SharedCollectionComponent); fixture.detectChanges();
    const pending = new Subject<SocialDetails>(); http.get.and.returnValue(pending);
    fixture.componentInstance.onSearchInput('tea'); tick(300); expect(pending.observed).toBeTrue();
    http.get.and.returnValue(of(source)); const input: HTMLInputElement = fixture.nativeElement.querySelector('#sharedSearch');
    input.value = ''; input.dispatchEvent(new Event('input')); fixture.detectChanges();
    expect(pending.observed).toBeFalse(); expect(http.get).toHaveBeenCalledWith('source', 1, 25, '');
    expect(fixture.componentInstance.searchBusy).toBeFalse();
    const count = http.get.calls.count(); tick(300); expect(http.get.calls.count()).toBe(count);
  }));
  it('distinguishes zero matches from an empty source and exposes immediate Reset Search', fakeAsync(() => {
    const fixture = TestBed.createComponent(SharedCollectionComponent); fixture.detectChanges(); const component = fixture.componentInstance;
    http.get.and.returnValue(of({ ...source, cards: [], totalCount: 0 }));
    component.onSearchInput('missing'); tick(300); fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Found 0 of 100');
    expect(fixture.nativeElement.textContent).toContain('No matching cards');
    expect(fixture.nativeElement.textContent).not.toContain('This collection has no cards yet');
    http.get.and.returnValue(of({ ...source, cards: [], cardsCount: 0, totalCount: 0 }));
    fixture.nativeElement.querySelector('.shared-search-empty button').click(); fixture.detectChanges();
    expect(http.get).toHaveBeenCalledWith('source', 1, 25, '');
    expect(fixture.nativeElement.textContent).toContain('This collection has no cards yet');
    expect(fixture.nativeElement.querySelector('.shared-search-empty')).toBeNull();
  }));
  it('resets query/page on route changes, cancels timers/reads and keeps full-source fork independent of search', fakeAsync(() => {
    const fixture = TestBed.createComponent(SharedCollectionComponent); fixture.detectChanges(); const component = fixture.componentInstance;
    component.onSearchInput('cancel timer'); tick(100); route.next(convertToParamMap({ publicId: 'second' }));
    expect(component.search).toBe(''); expect(component.activeSearch).toBe(''); expect(component.page).toBe(1);
    const count = http.get.calls.count(); tick(300); expect(http.get.calls.count()).toBe(count);
    const pending = new Subject<SocialDetails>(); http.get.and.returnValue(pending);
    component.onSearchInput('old source'); tick(300);
    http.get.and.returnValue(of({ ...source, publicId: 'third' })); route.next(convertToParamMap({ publicId: 'third' }));
    expect(pending.observed).toBeFalse(); pending.next(source); expect(component.details?.publicId).toBe('third');
    component.onSearchInput('tea'); tick(300); http.fork.and.returnValue(of({ id: 42 } as any)); component.fork();
    expect(http.fork).toHaveBeenCalledOnceWith('third'); expect(component.forkedId).toBe(42);
  }));
  it('cancels debounce and active reads on destruction', fakeAsync(() => {
    const fixture = TestBed.createComponent(SharedCollectionComponent); fixture.detectChanges();
    fixture.componentInstance.onSearchInput('cancel'); fixture.destroy(); const count = http.get.calls.count(); tick(400);
    expect(http.get.calls.count()).toBe(count);
    const next = TestBed.createComponent(SharedCollectionComponent); next.detectChanges();
    const pending = new Subject<SocialDetails>(); http.get.and.returnValue(pending);
    next.componentInstance.onSearchInput('cancel request'); tick(300); expect(pending.observed).toBeTrue();
    next.destroy(); expect(pending.observed).toBeFalse();
  }));
  it('retains RU labels and hides search/content when access becomes unavailable', fakeAsync(() => {
    TestBed.inject(I18nService).setLanguage('ru'); const fixture = TestBed.createComponent(SharedCollectionComponent); fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('#sharedSearch').getAttribute('aria-label')).toContain('Поиск карточек');
    http.get.and.returnValue(throwError(() => ({ status: 404 })));
    fixture.componentInstance.onSearchInput('tea'); tick(300); fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('#sharedSearch')).toBeNull();
    expect(fixture.nativeElement.querySelector('app-card-frame')).toBeNull(); fixture.componentInstance.fork(); expect(http.fork).not.toHaveBeenCalled();
  }));
});
