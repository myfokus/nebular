/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */

import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
  OnInit,
  QueryList,
  ViewChildren,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  NB_DOCUMENT,
  NbComponentStatus,
  NbGlobalPhysicalPosition,
  NbInputDirective,
  NbTagComponent,
  NbTagListComponent,
  NbThemeService,
  NbToastrService,
  NbTooltipDirective,
  NbTrigger,
} from '@nebular/theme';

import { forceStates } from './force-states';

type State = 'rest' | 'hover' | 'focus' | 'active' | 'disabled';

/**
 * Every component with a `status` input in `magic`, next to `primary`, in each appearance, size and state.
 * `?section=<name>` shows one section, `?theme=dark` switches the theme; the PR screenshots are taken that way.
 */
@Component({
  selector: 'npg-magic-gallery',
  templateUrl: './magic-gallery.component.html',
  styleUrls: ['./magic-gallery.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class MagicGalleryComponent implements OnInit, AfterViewInit {
  protected readonly route = inject(ActivatedRoute);
  protected readonly themeService = inject(NbThemeService);
  protected readonly toastrService = inject(NbToastrService);
  protected readonly document = inject(NB_DOCUMENT);
  protected readonly cd = inject(ChangeDetectorRef);

  readonly sections = [
    'button',
    'button-group',
    'card',
    'badge',
    'tag',
    'alert',
    'toast',
    'tooltip',
    'input',
    'form-field',
    'select',
    'select-with-autocomplete',
    'checkbox',
    'radio',
    'toggle',
    'progress-bar',
    'spinner',
    'icon',
    'chat',
    'typography',
  ];
  readonly statuses: NbComponentStatus[] = ['magic', 'primary'];
  readonly states: State[] = ['rest', 'hover', 'focus', 'active', 'disabled'];
  readonly buttonAppearances = ['filled', 'outline', 'ghost', 'hero'] as const;
  readonly groupAppearances = ['filled', 'outline', 'ghost'] as const;
  readonly selectAppearances = ['outline', 'filled', 'hero'] as const;
  readonly tagAppearances = ['filled', 'outline'] as const;
  readonly sizes = ['tiny', 'small', 'medium', 'large', 'giant'] as const;
  readonly options = ['Zusammenfassen', 'Verbessern', 'Erweitern'];
  readonly messages = [
    { text: 'Wie geht es Frau Huber heute?', reply: true, sender: 'Pflegekraft' },
    { text: 'Frau Huber hat gut geschlafen und am Morgen selbstständig gefrühstückt.', reply: false, sender: 'Sofi' },
  ];

  readonly noop = NbTrigger.NOOP;

  section: string | null = null;

  @ViewChildren(NbTooltipDirective) tooltips: QueryList<NbTooltipDirective>;
  @ViewChildren('activeTag') activeTags: QueryList<NbTagComponent>;
  @ViewChildren('focusedTagList') focusedTagLists: QueryList<NbTagListComponent>;
  @ViewChildren('focusedInput', { read: NbInputDirective }) focusedInputs: QueryList<NbInputDirective>;

  ngOnInit() {
    const params = this.route.snapshot.queryParamMap;
    this.section = params.get('section');
    this.themeService.changeTheme(params.get('theme') ?? 'default');
  }

  ngAfterViewInit() {
    // Overlays are placed against the laid out page, and the state rules are copied once all styles are in.
    this.document.fonts.ready.then(() => {
      this.showOverlays();
      this.fakeFocus();
      this.cd.detectChanges();
      forceStates(this.document);
    });
  }

  show(section: string): boolean {
    return !this.section || this.section === section;
  }

  stateClass(state: State): string {
    return state === 'rest' || state === 'disabled' ? '' : `npg-force-${state}`;
  }

  protected showOverlays() {
    this.tooltips.forEach((tooltip) => tooltip.show());

    if (this.show('toast')) {
      for (const status of this.statuses) {
        this.toastrService.show('Sofi hat den Pflegebericht zusammengefasst.', `Toast · ${status}`, {
          status,
          duration: 0,
          position: NbGlobalPhysicalPosition.TOP_RIGHT,
        });
        this.toastrService.show('Hover (zum Schließen klicken)', `Toast · ${status} · hover`, {
          status,
          duration: 0,
          destroyByClick: true,
          position: NbGlobalPhysicalPosition.TOP_RIGHT,
        });
      }
      setTimeout(() =>
        this.document
          .querySelectorAll('nb-toast.destroy-by-click')
          .forEach((toast) => toast.classList.add('npg-force-hover')),
      );
    }
  }

  // Focus that the components track in script instead of :focus can't be forced by a class.
  protected fakeFocus() {
    this.activeTags.forEach((tag) => tag.setActiveStyles());
    this.focusedTagLists.forEach((tagList) => ((tagList as any).focused = true));
    this.focusedInputs.forEach((input) => input.focused$.next(true));
  }
}
