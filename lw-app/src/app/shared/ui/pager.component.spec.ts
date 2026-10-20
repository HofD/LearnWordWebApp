import { TestBed } from '@angular/core/testing';
import { PagerComponent } from './pager.component';

describe('PagerComponent', () => {
  it('shows bounded ranges and hides one-page navigation', () => {
    const fixture = TestBed.createComponent(PagerComponent);
    const pager = fixture.componentInstance;
    pager.total = 12; fixture.detectChanges();
    expect(pager.rangeStart).toBe(1); expect(pager.rangeEnd).toBe(12);
    expect(fixture.nativeElement.querySelector('.btn-group')).toBeNull();
    pager.total = 0; fixture.detectChanges();
    expect(pager.rangeStart).toBe(0); expect(pager.rangeEnd).toBe(0);
    pager.total = 52; pager.page = 3; fixture.detectChanges();
    expect(pager.rangeStart).toBe(51); expect(pager.rangeEnd).toBe(52);
    expect(fixture.nativeElement.querySelector('.btn-group')).toBeTruthy();
    pager.page = 9; expect(pager.currentPage).toBe(3);
  });
  it('blocks invalid, current, busy and boundary page actions', () => {
    const pager = TestBed.createComponent(PagerComponent).componentInstance;
    spyOn(pager.pageChange, 'emit'); pager.total = 52;
    pager.go(0); pager.go(4); pager.go(1);
    expect(pager.pageChange.emit).not.toHaveBeenCalled();
    pager.go(2); expect(pager.pageChange.emit).toHaveBeenCalledOnceWith(2);
    pager.busy = true; pager.go(3); expect(pager.pageChange.emit).toHaveBeenCalledTimes(1);
  });
  it('emits only allowed changed sizes and preserves social API cap', () => {
    const fixture = TestBed.createComponent(PagerComponent); const pager = fixture.componentInstance;
    pager.total = 52; pager.pageSizeOptions = [25, 50]; fixture.detectChanges();
    const sizes = Array.from(fixture.nativeElement.querySelectorAll('option')) as HTMLOptionElement[];
    expect(sizes.map(option => option.value)).toEqual(['25', '50']);
    spyOn(pager.pageSizeChange, 'emit');
    const change = (value: string) => pager.changeSize({ target: { value } } as unknown as Event);
    change('100'); change('25'); expect(pager.pageSizeChange.emit).not.toHaveBeenCalled();
    change('50'); expect(pager.pageSizeChange.emit).toHaveBeenCalledOnceWith(50);
    pager.busy = true; change('50'); expect(pager.pageSizeChange.emit).toHaveBeenCalledTimes(1);
  });
  it('initializes recreated size selectors at 50 and updates owner sizes including 100', () => {
    const fixture = TestBed.createComponent(PagerComponent); const pager = fixture.componentInstance;
    pager.total = 120; pager.pageSizeOptions = [25, 50]; pager.pageSize = 50;
    fixture.detectChanges();
    const select: HTMLSelectElement = fixture.nativeElement.querySelector('select');
    expect(select.value).toBe('50'); expect(select.selectedOptions[0].value).toBe('50');
    pager.pageSizeOptions = [25, 50, 100]; pager.pageSize = 100; fixture.detectChanges();
    expect(select.value).toBe('100');
    pager.pageSize = 25; fixture.detectChanges(); expect(select.value).toBe('25');
    fixture.destroy();
    const recreated = TestBed.createComponent(PagerComponent);
    recreated.componentInstance.total = 120; recreated.componentInstance.pageSize = 100; recreated.detectChanges();
    expect(recreated.nativeElement.querySelector('select').value).toBe('100');
  });

});
