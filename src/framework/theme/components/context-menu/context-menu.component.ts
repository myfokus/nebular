/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */

import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { NbMenuItem } from '../../components/menu/menu.service';
import { NbPositionedContainerComponent, NbRenderableContainer } from '../cdk/overlay/overlay-container';
import { NbOverlayContent } from '../cdk/overlay/overlay-service';

/**
 * Context menu component used as content within NbContextMenuDirective.
 *
 * @styles
 *
 * context-menu-background-color:
 * context-menu-border-color:
 * context-menu-border-style:
 * context-menu-border-width:
 * context-menu-border-radius:
 * context-menu-text-align:
 * context-menu-min-width:
 * context-menu-max-width:
 * context-menu-shadow:
 * */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'nb-context-menu',
  template: ` <nb-menu class="context-menu" [items]="context().items" [tag]="context().tag"></nb-menu> `,
  standalone: false,
})
export class NbContextMenuComponent extends NbPositionedContainerComponent implements NbRenderableContainer {
  readonly items = input<NbMenuItem[]>([]);
  readonly tag = input<string>();

  readonly context = input<{ items: NbMenuItem[]; tag?: string }>({ items: [] });

  // Unused by the template, but NbDynamicOverlay always writes `content` via setInput,
  // so the container must declare it as an input.
  readonly content = input<NbOverlayContent>();

  /**
   * The method is empty since we don't need to do anything additionally
   * render is handled by change detection
   */
  renderContent() {}
}
