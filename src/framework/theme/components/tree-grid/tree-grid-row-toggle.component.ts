/*
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */

import { ChangeDetectionStrategy, Component, HostListener, input } from '@angular/core';
import { NbTreeGridCellDirective } from './tree-grid-cell.component';

/**
 * NbTreeGridRowToggleComponent
 */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'nb-tree-grid-row-toggle',
  template: `
    <button class="row-toggle-button" [attr.aria-label]="expanded() ? 'collapse' : 'expand'">
      <nb-icon
        [icon]="expanded() ? 'chevron-down-outline' : 'chevron-right-outline'"
        pack="nebular-essentials"
        aria-hidden="true"
      >
      </nb-icon>
    </button>
  `,
  styles: [
    `
      button {
        background: transparent;
        border: none;
        padding: 0;
      }
    `,
  ],
  standalone: false,
})
export class NbTreeGridRowToggleComponent {
  readonly expanded = input<boolean>();

  @HostListener('click', ['$event'])
  toggleRow($event) {
    this.cell.toggleRow();
    $event.stopPropagation();
  }

  constructor(private cell: NbTreeGridCellDirective) {}
}
