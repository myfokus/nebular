import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { NbThemeModule, NbProgressBarModule, NbProgressBarComponent } from '@nebular/theme';

describe('Component: NbProgressBar', () => {
  let fixture: ComponentFixture<NbProgressBarComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [NbThemeModule.forRoot(), NbProgressBarModule],
    });

    fixture = TestBed.createComponent(NbProgressBarComponent);
  });

  it('Setting value 50 should set width to 50%', () => {
    fixture.componentRef.setInput('value', 50);
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.css('.progress-value')).nativeElement.style.width).toBe('50%');
  });

  it('Setting status danger should set class danger', () => {
    fixture.componentRef.setInput('status', 'danger');
    fixture.detectChanges();
    expect(fixture.nativeElement.classList).toContain('status-danger');
  });

  it('Setting size should set class', () => {
    fixture.componentRef.setInput('size', 'small');
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).classList).toContain('size-small');
  });

  it('Setting displayValue should create span with value label', () => {
    fixture.componentRef.setInput('value', 40);
    fixture.componentRef.setInput('displayValue', true);
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.css('.progress-value span')).nativeElement.innerHTML).toContain('40%');
  });
});
