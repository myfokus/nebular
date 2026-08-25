/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */

import { ChangeDetectionStrategy, Component, TemplateRef, Type, ViewChild, input } from '@angular/core';
import { NbComponentPortal, NbTemplatePortal } from '../cdk/overlay/mapping';
import {
  NbOverlayContainerComponent,
  NbPositionedContainerComponent,
  NbRenderableContainer,
} from '../cdk/overlay/overlay-container';

/**
 * Overlay container.
 * Renders provided content inside.
 *
 * @styles
 *
 * popover-text-color:
 * popover-text-font-family:
 * popover-text-font-size:
 * popover-text-font-weight:
 * popover-text-line-height:
 * popover-background-color:
 * popover-border-width:
 * popover-border-color:
 * popover-border-radius:
 * popover-shadow:
 * popover-arrow-size:
 * popover-padding:
 * */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'nb-popover',
  styleUrls: ['./popover.component.scss'],
  template: `
    <span class="arrow"></span>
    <nb-overlay-container></nb-overlay-container>
  `,
  standalone: false,
})
export class NbPopoverComponent extends NbPositionedContainerComponent implements NbRenderableContainer {
  @ViewChild(NbOverlayContainerComponent) overlayContainer: NbOverlayContainerComponent;

  readonly content = input<any>();
  readonly context = input<Object>();

  renderContent() {
    this.detachContent();
    this.attachContent();
  }

  protected detachContent() {
    this.overlayContainer.detach();
  }

  protected attachContent() {
    const content = this.content();
    if (content instanceof TemplateRef) {
      this.attachTemplate();
    } else if (content instanceof Type) {
      this.attachComponent();
    } else {
      this.attachString();
    }
  }

  protected attachTemplate() {
    this.overlayContainer.attachTemplatePortal(
      new NbTemplatePortal(this.content(), null, <any>{ $implicit: this.context() }),
    );
  }

  protected attachComponent() {
    const portal = new NbComponentPortal(this.content(), null, null);
    const ref = this.overlayContainer.attachComponentPortal(portal, this.context());
    ref.changeDetectorRef.detectChanges();
  }

  protected attachString() {
    this.overlayContainer.attachStringContent(this.content());
  }
}
