/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */

import { Component, ElementRef, Input } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { NbThemeModule, NbIconModule, NbIconLibraries, NbIconComponent } from '@nebular/theme';

@Component({
  template: ` <nb-icon #iconEl [icon]="icon" [status]="status"></nb-icon> `,
  standalone: false,
})
class IconTestComponent {
  @Input() icon;
  @Input() status;
}

describe('Component: NbIcon', () => {
  let iconTestComponent: IconTestComponent;
  let fixture: ComponentFixture<IconTestComponent>;
  let iconElement: ElementRef;
  let iconsLibrary: NbIconLibraries;

  beforeEach(() => {
    const bed = TestBed.configureTestingModule({
      imports: [NbThemeModule.forRoot(), NbIconModule],
      providers: [NbIconLibraries],
      declarations: [IconTestComponent],
    });

    fixture = bed.createComponent(IconTestComponent);
    iconsLibrary = bed.inject(NbIconLibraries);

    iconsLibrary.registerSvgPack('svg-pack', { home: '<svg><rect></rect></svg>' }, { packClass: 'custom-pack' });
    iconsLibrary.setDefaultPack('svg-pack');

    iconTestComponent = fixture.componentInstance;
    iconElement = fixture.debugElement.query(By.directive(NbIconComponent));
  });

  it('should render icon', () => {
    iconTestComponent.icon = 'home';
    fixture.detectChanges();

    const svg = iconElement.nativeElement.querySelector('svg');

    expect(iconElement.nativeElement.classList.contains('custom-pack')).toBeTruthy();
    expect(svg.innerHTML).toContain('<rect></rect>');
  });

  it('should set class magic', () => {
    iconTestComponent.icon = 'home';
    iconTestComponent.status = 'magic';
    fixture.detectChanges();

    expect(iconElement.nativeElement.classList).toContain('status-magic');
  });

  it('should add the magic gradient paint servers to the document once', () => {
    iconTestComponent.icon = 'home';
    fixture.detectChanges();
    TestBed.createComponent(IconTestComponent).detectChanges();

    expect(document.querySelectorAll('.nb-magic-gradient-defs').length).toBe(1);
    for (const id of [
      'nb-magic-gradient',
      'nb-magic-gradient-focus',
      'nb-magic-gradient-hover',
      'nb-magic-gradient-active',
    ]) {
      expect(document.getElementById(id)).not.toBeNull();
    }
  });

  it('should add the magic gradient paint servers again once they were removed', () => {
    iconTestComponent.icon = 'home';
    fixture.detectChanges();
    document.querySelectorAll('.nb-magic-gradient-defs').forEach((defs) => defs.remove());

    TestBed.createComponent(IconTestComponent).detectChanges();

    expect(document.querySelectorAll('.nb-magic-gradient-defs').length).toBe(1);
  });
});
