import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ComponentRef,
  DestroyableInjector,
  EmbeddedViewRef,
  HostBinding,
  Injector,
  ViewChild,
  ViewContainerRef,
  input,
  signal,
} from '@angular/core';

import { NbPosition } from './overlay-position';
import { NbComponentPortal, NbPortalOutletDirective, NbTemplatePortal } from './mapping';

export interface NbRenderableContainer {
  /**
   * A renderContent method renders content with provided context.
   * Naturally, this job has to be done by ngOnChanges lifecycle hook, but
   * ngOnChanges hook will be triggered only if we update content or context properties
   * through template property binding syntax. But in our case we're updating these properties programmatically.
   * */
  renderContent();
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '',
  standalone: false,
})
export class NbPositionedContainerComponent {
  readonly position = input<NbPosition>();

  @HostBinding('class.nb-overlay-top')
  get top(): boolean {
    return this.position() === NbPosition.TOP;
  }

  @HostBinding('class.nb-overlay-top-start')
  get topStart(): boolean {
    return this.position() === NbPosition.TOP_START;
  }

  @HostBinding('class.nb-overlay-top-end')
  get topEnd(): boolean {
    return this.position() === NbPosition.TOP_END;
  }

  @HostBinding('class.nb-overlay-right')
  get right(): boolean {
    return this.position() === NbPosition.RIGHT || this.position() === NbPosition.END;
  }

  @HostBinding('class.nb-overlay-end-top')
  get endTop(): boolean {
    return this.position() === NbPosition.END_TOP;
  }

  @HostBinding('class.nb-overlay-end-bottom')
  get endBottom(): boolean {
    return this.position() === NbPosition.END_BOTTOM;
  }

  @HostBinding('class.nb-overlay-bottom')
  get bottom(): boolean {
    return this.position() === NbPosition.BOTTOM;
  }

  @HostBinding('class.nb-overlay-bottom-start')
  get bottomStart(): boolean {
    return this.position() === NbPosition.BOTTOM_START;
  }

  @HostBinding('class.nb-overlay-bottom-end')
  get bottomEnd(): boolean {
    return this.position() === NbPosition.BOTTOM_END;
  }

  @HostBinding('class.nb-overlay-left')
  get left(): boolean {
    return this.position() === NbPosition.LEFT || this.position() === NbPosition.START;
  }

  @HostBinding('class.nb-overlay-start-top')
  get startTop(): boolean {
    return this.position() === NbPosition.START_TOP;
  }

  @HostBinding('class.nb-overlay-start-bottom')
  get startBottom(): boolean {
    return this.position() === NbPosition.START_BOTTOM;
  }
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'nb-overlay-container',
  template: `
    <div *ngIf="isStringContent" class="primitive-overlay">{{ content() }}</div>
    <ng-template nbPortalOutlet></ng-template>
  `,
  standalone: false,
})
export class NbOverlayContainerComponent {
  // TODO static must be false as of Angular 9.0.0, issues/1514
  @ViewChild(NbPortalOutletDirective, { static: true }) portalOutlet: NbPortalOutletDirective;

  protected readonly _isAttached = signal(false);

  readonly content = signal<string>(undefined);

  constructor(
    protected vcr: ViewContainerRef,
    protected injector: Injector,
    private changeDetectorRef: ChangeDetectorRef,
  ) {}

  get isAttached(): boolean {
    return this._isAttached();
  }

  get isStringContent(): boolean {
    return !!this.content();
  }

  attachComponentPortal<T>(portal: NbComponentPortal<T>, context?: Object): ComponentRef<T> {
    portal.injector = this.createChildInjector();
    const componentRef = this.portalOutlet.attachComponentPortal(portal);
    if (context) {
      // The context keys target arbitrary consumer components (dialog/popover content),
      // not our signal inputs, so a plain assign stays. Mark the consumer view for check
      // so OnPush content components render the injected context.
      Object.assign(componentRef.instance, context);
    }
    componentRef.changeDetectorRef.markForCheck();
    componentRef.changeDetectorRef.detectChanges();
    this._isAttached.set(true);
    return componentRef;
  }

  attachTemplatePortal<C>(portal: NbTemplatePortal<C>): EmbeddedViewRef<C> {
    const templateRef = this.portalOutlet.attachTemplatePortal(portal);
    templateRef.detectChanges();
    this._isAttached.set(true);
    return templateRef;
  }

  attachStringContent(content: string) {
    this.content.set(content);
    this.changeDetectorRef.detectChanges();
    this._isAttached.set(true);
  }

  detach() {
    if (this.portalOutlet.hasAttached()) {
      this.portalOutlet.detach();
    }
    this.attachStringContent(null);
    this._isAttached.set(false);
  }

  protected createChildInjector(): DestroyableInjector {
    return Injector.create({
      parent: this.injector,
      providers: [],
    });
  }
}
