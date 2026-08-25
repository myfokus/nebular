/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */

import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  ElementRef,
  HostBinding,
  HostListener,
  Input,
  input,
  OnDestroy,
  Renderer2,
  signal,
  ViewChild,
  ViewContainerRef,
  Inject,
  PLATFORM_ID,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

import { convertToBoolProperty, NbBooleanInput } from '../helpers';
import { NbThemeService } from '../../services/theme.service';
import { NbSpinnerService } from '../../services/spinner.service';
import { NbLayoutDirectionService } from '../../services/direction.service';
import { NbRestoreScrollTopHelper } from './restore-scroll-top.service';
import { NbScrollPosition, NbLayoutScrollService } from '../../services/scroll.service';
import { NbLayoutDimensions, NbLayoutRulerService } from '../../services/ruler.service';
import { NB_WINDOW, NB_DOCUMENT } from '../../theme.options';
import { NbOverlayContainerAdapter } from '../cdk/adapter/overlay-container-adapter';

/**
 * Layout container component.
 * When using with Nebular Theme System it is required that all child components should be placed inside.
 *
 * Basic example of two column layout with header:
 *
 * @stacked-example(Showcase, layout/layout-showcase.component)
 *
 * Can contain the following components inside:
 *
 * ```html
 * <nb-layout>
 *  <nb-layout-header></nb-layout-header>
 *  <nb-layout-footer></nb-layout-footer>
 *  <nb-layout-column></nb-layout-column>
 *  <nb-sidebar></nb-sidebar>
 * </nb-layout>
 * ```
 * ### Installation
 *
 * Import `NbLayoutModule` to your app module.
 * ```ts
 * @NgModule({
 *   imports: [
 *     // ...
 *     NbLayoutModule,
 *   ],
 * })
 * export class AppModule { }
 * ```
 * ### Usage
 * By default the layout fills up the whole view-port.
 * The window scrollbars are disabled on the body and moved inside of the nb-layout, so that the scrollbars
 * won't mess with the fixed nb-header.
 *
 * The child components are projected into a flexible layout structure allowing to adjust the layout behavior
 * based on the settings provided.
 *
 * The layout content (columns) becomes centered when the window width is more than
 * the value specified in the theme variable `layout-content-width`.
 *
 * The layout also contains the area on the very top (the first child of the nb-layout), which could be used
 * to dynamically append some components like modals or spinners/loaders
 * so that they are located on top of the elements hierarchy.
 * More details are under the `ThemeService` section.
 *
 * The layout component is also responsible for changing application themes.
 * It listens to the `themeChange` event and change a theme CSS class appended to body.
 * Based on the class appended, specific CSS-theme is applied to the application.
 * More details of the Theme System could be found here [Enabling Theme System](#/docs/concepts/theme-system)
 *
 * A simple layout with footer:
 *
 * @stacked-example(Layout With Footer, layout/layout-w-footer.component)
 *
 * It is possible to ask the layout to center the columns (notice: we added a `center` attribute
 * to the layout:
 *
 * ```html
 * <nb-layout center>
 *   <nb-layout-header>Awesome Company</nb-layout-header>
 *
 *   <nb-layout-column>
 *     Hello World!
 *   </nb-layout-column>
 *
 *   <nb-layout-footer>Contact us</nb-layout-footer>
 * </nb-layout>
 * ```
 *
 * @styles
 *
 * layout-background-color:
 * layout-text-color:
 * layout-text-font-family:
 * layout-text-font-size:
 * layout-text-font-weight:
 * layout-text-line-height:
 * layout-min-height:
 * layout-content-width:
 * layout-window-mode-min-width:
 * layout-window-mode-background-color:
 * layout-window-mode-padding-top:
 * layout-window-shadow:
 * layout-padding:
 * layout-medium-padding:
 * layout-small-padding:
 * layout-scrollbar-background-color:
 * layout-scrollbar-color:
 * layout-scrollbar-width:
 */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'nb-layout',
  styleUrls: ['./layout.component.scss'],
  template: `
    <div class="scrollable-container" #scrollableContainer (scroll)="onScroll($event)">
      <div class="layout" #layoutContainer>
        <ng-content select="nb-layout-header:not([subheader])"></ng-content>
        <div class="layout-container">
          <ng-content select="nb-sidebar"></ng-content>
          <div class="content" [class.center]="center()">
            <ng-content select="nb-layout-header[subheader]"></ng-content>
            <div class="columns">
              <ng-content select="nb-layout-column"></ng-content>
            </div>
            <ng-content select="nb-layout-footer"></ng-content>
          </div>
        </div>
      </div>
    </div>
  `,
  standalone: false,
})
export class NbLayoutComponent implements AfterViewInit, OnDestroy {
  protected scrollBlockClass = 'nb-global-scrollblock';
  protected isScrollBlocked = false;
  protected scrollableContainerOverflowOldValue: string;
  protected layoutPaddingOldValue: { left: string; right: string };

  /**
   * Defines whether the layout columns will be centered after some width
   */
  readonly center = input(false, { transform: convertToBoolProperty });

  /**
   * Defines whether the layout enters a 'window' mode, when the layout content (including sidebars and fixed header)
   * becomes centered by width with a margin from the top of the screen, like a floating window.
   * Automatically enables `withScroll` mode, as in the window mode scroll must be inside the layout and cannot be on
   * window. (TODO: check this)
   */
  readonly windowMode = input(false, { transform: convertToBoolProperty });

  /**
   * Defines whether to move the scrollbars to layout or leave it at the body level.
   * Automatically set to true when `windowMode` is enabled.
   */
  readonly withScroll = input(false, { transform: convertToBoolProperty });

  /**
   * Restores scroll to the top of the page after navigation
   */
  readonly restoreScrollTop = input(true, { transform: convertToBoolProperty });

  // The old `windowMode` setter cascaded its value into `withScroll`, so the effective scroll
  // mode is the union of both inputs.
  protected readonly withScrollEffective = computed(() => this.withScroll() || this.windowMode());

  /** Set by a projected `nb-layout-header[subheader]` (see NbLayoutHeaderComponent). */
  readonly withSubheader = signal(false);

  @HostBinding('class.window-mode')
  get windowModeValue(): boolean {
    return this.windowMode();
  }

  @HostBinding('class.with-scroll')
  get withScrollValue(): boolean {
    return this.withScrollEffective();
  }

  @HostBinding('class.with-subheader')
  get withSubheaderValue(): boolean {
    return this.withSubheader();
  }

  // The old `withScroll` setter moved the body overflow style on every input assignment
  // (TODO from the original code: is this the best way? we don't have access to body from theme styles).
  // The initial run is skipped while the mode is off so a layout that never enables it does not
  // overwrite the body's stylesheet overflow with an inline value.
  private hasTouchedBodyOverflow = false;
  private readonly bodyOverflowEffect = effect(() => {
    const withScroll = this.withScrollEffective();
    if (!withScroll && !this.hasTouchedBodyOverflow) {
      return;
    }
    this.hasTouchedBodyOverflow = true;

    const body = this.document.getElementsByTagName('body')[0];
    if (withScroll) {
      this.renderer.setStyle(body, 'overflow', 'hidden');
    } else {
      this.renderer.setStyle(body, 'overflow', 'initial');
    }
  });

  // TODO remove as of 5.0.0
  @ViewChild('layoutTopDynamicArea', { read: ViewContainerRef }) veryTopRef: ViewContainerRef;

  @ViewChild('scrollableContainer', { read: ElementRef, static: true })
  scrollableContainerRef: ElementRef<HTMLElement>;

  @ViewChild('layoutContainer', { read: ElementRef })
  layoutContainerRef: ElementRef<HTMLElement>;

  protected afterViewInit$ = new BehaviorSubject(null);

  private destroy$ = new Subject<void>();

  constructor(
    protected themeService: NbThemeService,
    protected spinnerService: NbSpinnerService,
    protected elementRef: ElementRef,
    protected renderer: Renderer2,
    @Inject(NB_WINDOW) protected window,
    @Inject(NB_DOCUMENT) protected document,
    @Inject(PLATFORM_ID) protected platformId: Object,
    protected layoutDirectionService: NbLayoutDirectionService,
    protected scrollService: NbLayoutScrollService,
    protected rulerService: NbLayoutRulerService,
    protected scrollTop: NbRestoreScrollTopHelper,
    protected overlayContainer: NbOverlayContainerAdapter,
  ) {
    this.registerAsOverlayContainer();

    this.themeService
      .onThemeChange()
      .pipe(takeUntil(this.destroy$))
      .subscribe((theme: any) => {
        const body = this.document.getElementsByTagName('body')[0];
        if (theme.previous) {
          this.renderer.removeClass(body, `nb-theme-${theme.previous}`);
        }
        this.renderer.addClass(body, `nb-theme-${theme.name}`);
      });

    this.themeService
      .onAppendLayoutClass()
      .pipe(takeUntil(this.destroy$))
      .subscribe((className: string) => {
        this.renderer.addClass(this.elementRef.nativeElement, className);
      });

    this.themeService
      .onRemoveLayoutClass()
      .pipe(takeUntil(this.destroy$))
      .subscribe((className: string) => {
        this.renderer.removeClass(this.elementRef.nativeElement, className);
      });

    this.spinnerService.registerLoader(
      new Promise<void>((resolve) => {
        this.afterViewInit$.pipe(takeUntil(this.destroy$)).subscribe((_) => resolve());
      }),
    );
    this.spinnerService.load();

    this.rulerService
      .onGetDimensions()
      .pipe(takeUntil(this.destroy$))
      .subscribe(({ listener }) => {
        listener.next(this.getDimensions());
        listener.complete();
      });

    this.scrollService
      .onGetPosition()
      .pipe(takeUntil(this.destroy$))
      .subscribe(({ listener }) => {
        listener.next(this.getScrollPosition());
        listener.complete();
      });

    this.scrollTop
      .shouldRestore()
      .pipe(
        filter(() => this.restoreScrollTop()),
        takeUntil(this.destroy$),
      )
      .subscribe(() => {
        this.scroll(0, 0);
      });

    this.scrollService
      .onScrollableChange()
      .pipe(
        filter(() => this.withScrollEffective()),
        takeUntil(this.destroy$),
      )
      .subscribe((scrollable: boolean) => {
        /**
         * In case when Nebular Layout custom scroll `withScroll` mode is enabled
         * we need to disable default CDK scroll blocker (@link NbBlockScrollStrategyAdapter) on HTML element
         * so that it won't add additional positioning.
         */
        if (scrollable) {
          this.enableScroll();
        } else {
          this.blockScroll();
        }
      });

    if (isPlatformBrowser(this.platformId)) {
      // trigger first time so that after the change we have the initial value
      this.themeService.changeWindowWidth(this.window.innerWidth);
    }
  }

  ngAfterViewInit() {
    this.layoutDirectionService
      .onDirectionChange()
      .pipe(takeUntil(this.destroy$))
      .subscribe((direction) => (this.document.dir = direction));

    this.scrollService
      .onManualScroll()
      .pipe(takeUntil(this.destroy$))
      .subscribe(({ x, y }: NbScrollPosition) => this.scroll(x, y));

    this.afterViewInit$.next(true);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    this.unregisterAsOverlayContainer();
  }

  @HostListener('window:scroll', ['$event'])
  onScroll($event) {
    this.scrollService.fireScrollChange($event);
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.themeService.changeWindowWidth(event.target.innerWidth);
  }

  /**
   * Returns scroll and client height/width
   *
   * Depending on the current scroll mode (`withScroll=true`) returns sizes from the body element
   * or from the `.scrollable-container`
   * @returns {NbLayoutDimensions}
   */
  getDimensions(): NbLayoutDimensions {
    let clientWidth,
      clientHeight,
      scrollWidth,
      scrollHeight = 0;
    if (this.withScrollEffective()) {
      const container = this.scrollableContainerRef.nativeElement;
      clientWidth = container.clientWidth;
      clientHeight = container.clientHeight;
      scrollWidth = container.scrollWidth;
      scrollHeight = container.scrollHeight;
    } else {
      const { documentElement, body } = this.document;
      clientWidth = documentElement.clientWidth || body.clientWidth;
      clientHeight = documentElement.clientHeight || body.clientHeight;
      scrollWidth = documentElement.scrollWidth || body.scrollWidth;
      scrollHeight = documentElement.scrollHeight || body.scrollHeight;
    }

    return {
      clientWidth,
      clientHeight,
      scrollWidth,
      scrollHeight,
    };
  }

  /**
   * Returns scroll position of current scroll container.
   *
   * If `withScroll` = true, returns scroll position of the `.scrollable-container` element,
   * otherwise - of the scrollable element of the window (which may be different depending of a browser)
   *
   * @returns {NbScrollPosition}
   */
  getScrollPosition(): NbScrollPosition {
    if (!isPlatformBrowser(this.platformId)) {
      return { x: 0, y: 0 };
    }

    if (this.withScrollEffective()) {
      const container = this.scrollableContainerRef.nativeElement;
      return { x: container.scrollLeft, y: container.scrollTop };
    }

    const documentRect = this.document.documentElement.getBoundingClientRect();

    const x =
      -documentRect.left ||
      this.document.body.scrollLeft ||
      this.window.scrollX ||
      this.document.documentElement.scrollLeft ||
      0;

    const y =
      -documentRect.top ||
      this.document.body.scrollTop ||
      this.window.scrollY ||
      this.document.documentElement.scrollTop ||
      0;

    return { x, y };
  }

  protected registerAsOverlayContainer() {
    if (this.overlayContainer.setContainer) {
      this.overlayContainer.setContainer(this.elementRef.nativeElement);
    }
  }

  protected unregisterAsOverlayContainer() {
    if (this.overlayContainer.clearContainer) {
      this.overlayContainer.clearContainer();
    }
  }

  private scroll(x: number = null, y: number = null) {
    const { x: currentX, y: currentY } = this.getScrollPosition();
    x = x == null ? currentX : x;
    y = y == null ? currentY : y;

    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    if (this.withScrollEffective()) {
      const scrollable = this.scrollableContainerRef.nativeElement;
      if (scrollable.scrollTo) {
        scrollable.scrollTo(x, y);
      } else {
        scrollable.scrollLeft = x;
        scrollable.scrollTop = y;
      }
    } else {
      this.window.scrollTo(x, y);
    }
  }

  // TODO: Extract into block scroll strategy
  protected blockScroll() {
    if (this.isScrollBlocked) {
      return;
    }

    this.isScrollBlocked = true;

    this.renderer.addClass(this.document.documentElement, this.scrollBlockClass);

    const scrollableContainerElement = this.scrollableContainerRef.nativeElement;
    const layoutElement = this.layoutContainerRef.nativeElement;

    const layoutWithScrollWidth = layoutElement.clientWidth;
    this.scrollableContainerOverflowOldValue = scrollableContainerElement.style.overflow;
    scrollableContainerElement.style.overflow = 'hidden';
    const layoutWithoutScrollWidth = layoutElement.clientWidth;
    const scrollWidth = layoutWithoutScrollWidth - layoutWithScrollWidth;

    if (!scrollWidth) {
      return;
    }

    this.layoutPaddingOldValue = {
      left: layoutElement.style.paddingLeft,
      right: layoutElement.style.paddingRight,
    };

    if (this.layoutDirectionService.isLtr()) {
      layoutElement.style.paddingRight = `${scrollWidth}px`;
    } else {
      layoutElement.style.paddingLeft = `${scrollWidth}px`;
    }
  }

  private enableScroll() {
    if (this.isScrollBlocked) {
      this.isScrollBlocked = false;

      this.renderer.removeClass(this.document.documentElement, this.scrollBlockClass);
      this.scrollableContainerRef.nativeElement.style.overflow = this.scrollableContainerOverflowOldValue;

      if (this.layoutPaddingOldValue) {
        const layoutElement = this.layoutContainerRef.nativeElement;
        layoutElement.style.paddingLeft = this.layoutPaddingOldValue.left;
        layoutElement.style.paddingRight = this.layoutPaddingOldValue.right;
        this.layoutPaddingOldValue = null;
      }
    }
  }
}

/**
 * A container component which determines a content position inside of the layout.
 * The layout could contain unlimited columns (not including the sidebars).
 *
 * By default the columns are ordered from the left to the right,
 * but it's also possible to overwrite this behavior by setting a `left` attribute to the column,
 * moving it to the very first position:
 *
 * @stacked-example(Column Left, layout/layout-column-left.component)
 */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'nb-layout-column',
  template: `<ng-content></ng-content>`,
  standalone: false,
})
export class NbLayoutColumnComponent {
  private readonly _left = signal<boolean>(undefined);
  private readonly _start = signal<boolean>(undefined);

  @HostBinding('class.left')
  get leftValue(): boolean {
    return this._left();
  }

  @HostBinding('class.start')
  get startValue(): boolean {
    return this._start();
  }

  /**
   * Move the column to the very left position in the layout.
   * @param {boolean} val
   */
  @Input()
  set left(val: boolean) {
    this._left.set(convertToBoolProperty(val));
    this._start.set(false);
  }
  static ngAcceptInputType_left: NbBooleanInput;

  /**
   * Make column first in the layout.
   * @param {boolean} val
   */
  @Input()
  set start(val: boolean) {
    this._start.set(convertToBoolProperty(val));
    this._left.set(false);
  }
  static ngAcceptInputType_start: NbBooleanInput;
}

/**
 * Page header component.
 * Located on top of the page above the layout columns and sidebars.
 * Could be made `fixed` by setting the corresponding property. In the fixed mode the header becomes
 * sticky to the top of the nb-layout (to of the page). Here's an example:
 *
 * @stacked-example(Fixed Header, layout/layout-fixed-header.component)
 *
 * In a pair with sidebar it is possible to setup a configuration when header is placed on a side of the sidebar
 * and not on top of it. To achieve this simply put a `subheader` property to the header like this:
 * ```html
 * <nb-layout-header subheader></nb-layout-header>
 * ```
 * @stacked-example(Subheader, layout/layout-sidebar-subheader.component)
 * Note that in such configuration sidebar shadow is removed and header cannot be make `fixed`.
 *
 * Same way you can put both `fixed` and `clipped` headers adding creating a sub-header for your app:
 *
 * @stacked-example(Subheader, layout/layout-subheader.component)
 *
 * @styles
 *
 * header-background-color:
 * header-text-color:
 * header-text-font-family:
 * header-text-font-size:
 * header-text-font-weight:
 * header-text-line-height:
 * header-height:
 * header-padding:
 * header-shadow:
 */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'nb-layout-header',
  template: `
    <nav [class.fixed]="fixedValue">
      <ng-content></ng-content>
    </nav>
  `,
  standalone: false,
})
export class NbLayoutHeaderComponent {
  private readonly _fixed = signal<boolean>(undefined);
  private readonly _subheader = signal<boolean>(undefined);

  @HostBinding('class.fixed')
  get fixedValue(): boolean {
    return this._fixed();
  }

  @HostBinding('class.subheader')
  get subheaderValue(): boolean {
    return this._subheader();
  }

  constructor(private layout: NbLayoutComponent) {}

  /**
   * Makes the header sticky to the top of the nb-layout.
   * @param {boolean} val
   */
  @Input()
  set fixed(val: boolean) {
    this._fixed.set(convertToBoolProperty(val));
  }
  static ngAcceptInputType_fixed: NbBooleanInput;

  /**
   * Places header on a side of the sidebar, and not above.
   * Disables fixed mode for this header and remove a shadow from the sidebar.
   * @param {boolean} val
   */
  @Input()
  set subheader(val: boolean) {
    const subheader = convertToBoolProperty(val);
    this._subheader.set(subheader);
    this._fixed.set(false);
    this.layout.withSubheader.set(subheader);
  }
  static ngAcceptInputType_subheader: NbBooleanInput;
}

/**
 * Page footer.
 * Located under the nb-layout content (specifically, under the columns).
 * Could be made `fixed`, becoming sticky to the bottom of the view port (window).
 *
 * @styles
 *
 * footer-background-color:
 * footer-text-color:
 * footer-text-font-family:
 * footer-text-font-size:
 * footer-text-font-weight:
 * footer-text-line-height:
 * footer-text-highlight-color:
 * footer-height:
 * footer-padding:
 * footer-divider-color:
 * footer-divider-style:
 * footer-divider-width:
 * footer-shadow:
 */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'nb-layout-footer',
  template: `
    <nav [class.fixed]="fixed()">
      <ng-content></ng-content>
    </nav>
  `,
  standalone: false,
})
export class NbLayoutFooterComponent {
  /**
   * Makes the footer sticky to the bottom of the window.
   */
  readonly fixed = input(false, { transform: convertToBoolProperty });

  @HostBinding('class.fixed')
  get fixedValue(): boolean {
    return this.fixed();
  }
}
