/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NbThemeModule, NbSpinnerModule, NbSpinnerComponent } from '@nebular/theme';

describe('Component: NbSpinner', () => {
  let spinner: NbSpinnerComponent;
  let fixture: ComponentFixture<NbSpinnerComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [NbThemeModule.forRoot(), NbSpinnerModule],
    });

    fixture = TestBed.createComponent(NbSpinnerComponent);
    spinner = fixture.componentInstance;
  });

  it('should set class danger', () => {
    fixture.componentRef.setInput('status', 'danger');
    fixture.detectChanges();
    expect(fixture.debugElement.nativeElement.classList.contains('status-danger')).toBeTruthy();
  });

  it('should set size small', () => {
    fixture.componentRef.setInput('size', 'small');
    fixture.detectChanges();
    expect(fixture.debugElement.nativeElement.classList.contains('size-small')).toBeTruthy();
  });

  it('should set message', () => {
    fixture.componentRef.setInput('message', 'Loading your content...');
    fixture.detectChanges();
    expect(fixture.debugElement.nativeElement.querySelector('.message').textContent).toEqual(spinner.message());
  });

  it('should not have message tab when no message', () => {
    fixture.componentRef.setInput('message', '');
    fixture.detectChanges();
    expect(fixture.debugElement.nativeElement.querySelector('.message')).toBeNull();
  });
});
