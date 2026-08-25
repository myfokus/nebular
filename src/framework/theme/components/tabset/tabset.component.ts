/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */

import { map, delay, filter, takeUntil } from 'rxjs/operators';
import {
  ChangeDetectionStrategy,
  Component,
  Input,
  Output,
  EventEmitter,
  AfterContentInit,
  HostBinding,
  OnDestroy,
  contentChild,
  contentChildren,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';

import { convertToBoolProperty, NbBooleanInput } from '../helpers';
import { NbComponentOrCustomStatus } from '../component-status';
import { NbBadgePosition } from '../badge/badge.component';
import { NbIconConfig } from '../icon/icon.component';
import { NbTabContentDirective } from './tab-content.directive';
import { NbTabTitleDirective } from './tab-title.directive';

/**
 * Specific tab container.
 *
 * ```ts
 * <nb-tab tabTitle="Users"
 *   badgeText="99+"
 *   badgeStatus="danger">
 *   <p>List of <strong>users</strong>.</p>
 * </nb-tab>
 * ```
 */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'nb-tab',
  template: `
    <ng-container
      *ngIf="tabContentDirective(); else projectedContent"
      [ngTemplateOutlet]="tabContentDirective().templateRef"
    ></ng-container>

    <ng-template #projectedContent>
      <ng-content></ng-content>
    </ng-template>
  `,
  host: {
    '[class.disabled]': 'disabled()',
  },
  standalone: false,
})
export class NbTabComponent {
  readonly tabContentDirective = contentChild(NbTabContentDirective);
  readonly tabTitleDirective = contentChild(NbTabTitleDirective);

  /**
   * Tab title
   * @type {string}
   */
  readonly tabTitle = input<string>();

  /**
   * Tab id
   * @type {string}
   */
  readonly tabId = input<string>();

  /**
   * Use badge dot mode
   * @type {boolean}
   */
  readonly badgeDot = input(false, { transform: convertToBoolProperty });

  /**
   * Tab icon name or icon config object
   * @type {string | NbIconConfig}
   */
  readonly tabIcon = input<string | NbIconConfig>();

  /**
   * Item is disabled and cannot be opened.
   * @type {boolean}
   */
  readonly disabled = input(false, { transform: convertToBoolProperty });

  /**
   * Show only icons when width is smaller than `tabs-icon-only-max-width`
   * @type {boolean}
   */
  readonly responsive = input(false, { transform: convertToBoolProperty });

  /**
   * Makes this tab a link that initiates navigation to a route
   * @type string
   */
  readonly route = input<string>();

  private readonly _active = signal(false);

  /**
   * Specifies active tab
   * @returns {boolean}
   */
  @Input()
  @HostBinding('class.content-active')
  get active(): boolean {
    return this._active();
  }
  set active(val: boolean) {
    this._active.set(convertToBoolProperty(val));
    if (this._active()) {
      this.init.set(true);
    }
  }
  static ngAcceptInputType_active: NbBooleanInput;

  /**
   * Lazy load content before tab selection
   * @docs-private
   * @deprecated This setting never worked. Wrap content into a `nbTabContent` to make it lazy.
   * @breaking-change Remove 12.0.0
   */
  readonly lazyLoad = input(false, { transform: convertToBoolProperty });

  /**
   * Badge text to display
   * @type string
   */
  readonly badgeText = input<string>();

  /**
   * Badge status (adds specific styles):
   * 'primary', 'info', 'success', 'warning', 'danger'
   * @param {string} val
   */
  readonly badgeStatus = input<NbComponentOrCustomStatus>('basic');

  /**
   * Badge position.
   * Can be set to any class or to one of predefined positions:
   * 'top left', 'top right', 'bottom left', 'bottom right',
   * 'top start', 'top end', 'bottom start', 'bottom end'
   * @type string
   */
  readonly badgePosition = input<NbBadgePosition>();

  /**
   * @deprecated
   * @breaking-change Remove 12.0.0
   * @docs-private
   */
  readonly init = signal(false);

  constructor() {
    // Once initialized (by `lazyLoad` or by becoming active), a tab stays initialized —
    // an unbound `lazyLoad` input must not reset `init` set by the `active` setter.
    effect(() => {
      if (this.lazyLoad()) {
        this.init.set(true);
      }
    });
  }
}

// TODO: Combine tabset with route-tabset, so that we can:
// - have similar interface
// - easy to migrate from one to another
// - can mix them both (route/content tab)
/**
 *
 * Dynamic tabset component.
 * @stacked-example(Showcase, tabset/tabset-showcase.component)
 *
 * Basic tabset example
 *
 * ```html
 * <nb-tabset>
 *  <nb-tab tabTitle="Simple Tab #1">
 *    Tab content 1
 *  </nb-tab>
 *  <nb-tab tabTitle="Simple Tab #2">
 *    Tab content 2
 *  </nb-tab>
 * </nb-tabset>
 * ```
 *
 * ### Installation
 *
 * Import `NbTabsetModule` to your feature module.
 * ```ts
 * @NgModule({
 *   imports: [
 *     // ...
 *     NbTabsetModule,
 *   ],
 * })
 * export class PageModule { }
 * ```
 * ### Usage
 *
 * It is also possible to set a badge to a particular tab:
 * @stacked-example(Tab With Badge, tabset/tabset-badge.component)
 *
 * and we can set it to full a width of a parent component
 * @stacked-example(Full Width, tabset/tabset-width.component)
 *
 * `tabIcon` should be used to add an icon to the tab. Icon can also be combined with title.
 * `responsive` tab property if set allows you to hide the title on smaller screens
 * (`$tabset-tab-text-hide-breakpoint` variable) for better responsive behaviour.
 * You can open the following example and make
 * your screen smaller - titles will be hidden in the last tabset in the list:
 * @stacked-example(Icon, tabset/tabset-icon.component)
 *
 * It is also possible to disable a tab using `disabled` property:
 * @stacked-example(Disabled Tab, tabset/tabset-disabled.component)
 *
 * By default, the tab contents instantiated straightaway. To make tab contents load lazy,
 * declare the body of a tab in a template with `nbTabContent` directive.
 * ```html
 * <nb-tabset>
 *   <nb-tab>
 *     <some-component *nbTabContent>Lazy content</some-component>
 *   </nb-tab>
 *   <nb-tab>
 *     <ng-template nbTabContent>
 *       Lazy content with template syntax
 *     </ng-template>
 *   </nb-tab>
 * </nb-tabset>
 * ```
 *
 * You can provide a template as a tab title via `<ng-template nbTabTitle>`:
 * @stacked-example(Tab title template, tabset/tabset-template-title.component)
 *
 * @styles
 *
 * tabset-background-color:
 * tabset-border-radius:
 * tabset-shadow:
 * tabset-tab-background-color:
 * tabset-tab-padding:
 * tabset-tab-text-color:
 * tabset-tab-text-font-family:
 * tabset-tab-text-font-size:
 * tabset-tab-text-font-weight:
 * tabset-tab-text-line-height:
 * tabset-tab-text-transform:
 * tabset-tab-underline-width:
 * tabset-tab-underline-color:
 * tabset-tab-active-background-color:
 * tabset-tab-active-text-color:
 * tabset-tab-active-underline-color:
 * tabset-tab-focus-background-color:
 * tabset-tab-focus-text-color:
 * tabset-tab-focus-underline-color:
 * tabset-tab-hover-background-color:
 * tabset-tab-hover-text-color:
 * tabset-tab-hover-underline-color:
 * tabset-tab-disabled-background-color:
 * tabset-tab-disabled-text-color:
 * tabset-tab-disabled-underline-color:
 * tabset-divider-color:
 * tabset-divider-style:
 * tabset-divider-width:
 * tabset-content-background-color:
 * tabset-content-padding:
 * tabset-content-text-color:
 * tabset-content-text-font-family:
 * tabset-content-text-font-size:
 * tabset-content-text-font-weight:
 * tabset-content-text-line-height:
 * tabset-scrollbar-color:
 * tabset-scrollbar-background-color:
 * tabset-scrollbar-width:
 */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'nb-tabset',
  styleUrls: ['./tabset.component.scss'],
  template: `
    <ul class="tabset">
      <li
        *ngFor="let tab of tabs()"
        (click)="selectTab(tab)"
        (keyup.space)="selectTab(tab)"
        (keyup.enter)="selectTab(tab)"
        [class.responsive]="tab.responsive()"
        [class.active]="tab.active"
        [class.disabled]="tab.disabled()"
        [attr.tabindex]="tab.disabled() ? -1 : 0"
        [attr.data-tab-id]="tab.tabId()"
        class="tab"
      >
        <a href (click)="$event.preventDefault()" tabindex="-1" class="tab-link">
          <nb-icon *ngIf="tab.tabIcon()" [config]="tab.tabIcon()"></nb-icon>
          <ng-container
            *ngIf="tab.tabTitleDirective(); else textTitleTemplate"
            [ngTemplateOutlet]="tab.tabTitleDirective().templateRef"
          ></ng-container>
          <ng-template #textTitleTemplate>
            <span class="tab-text">{{ tab.tabTitle() }}</span>
          </ng-template>
        </a>
        <nb-badge
          *ngIf="tab.badgeText() || tab.badgeDot()"
          [text]="tab.badgeText()"
          [dotMode]="tab.badgeDot()"
          [status]="tab.badgeStatus()"
          [position]="tab.badgePosition()"
        >
        </nb-badge>
      </li>
    </ul>
    <ng-content select="nb-tab"></ng-content>
  `,
  host: {
    '[class.full-width]': 'fullWidth()',
  },
  standalone: false,
})
export class NbTabsetComponent implements AfterContentInit, OnDestroy {
  readonly tabs = contentChildren(NbTabComponent);

  /**
   * Take full width of a parent
   * @param {boolean} val
   */
  readonly fullWidth = input(false, { transform: convertToBoolProperty });

  /**
   * If specified - tabset listens to this parameter and selects corresponding tab.
   * @type {string}
   */
  readonly routeParam = input<string>();

  /**
   * Emits when tab is selected
   * @type EventEmitter<any>
   */
  @Output() changeTab = new EventEmitter<any>();

  private destroy$: Subject<void> = new Subject<void>();

  private readonly route = inject(ActivatedRoute);

  ngAfterContentInit() {
    this.route.params
      .pipe(
        map((params: any) =>
          this.tabs().find((tab) => (this.routeParam() ? tab.route() === params[this.routeParam()] : tab.active)),
        ),
        delay(0),
        map((tab: NbTabComponent) => tab || this.tabs()[0]),
        filter((tab: NbTabComponent) => !!tab),
        takeUntil(this.destroy$),
      )
      .subscribe((tabToSelect: NbTabComponent) => {
        this.selectTab(tabToSelect);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // TODO: navigate to routeParam
  selectTab(selectedTab: NbTabComponent) {
    if (!selectedTab.disabled()) {
      this.tabs().forEach((tab) => (tab.active = tab === selectedTab));
      this.changeTab.emit(selectedTab);
    }
  }
}
