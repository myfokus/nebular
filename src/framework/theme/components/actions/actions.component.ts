/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */

import { ChangeDetectionStrategy, Component, HostBinding, input } from '@angular/core';

import { convertToBoolProperty } from '../helpers';
import { NbComponentSize } from '../component-size';
import { NbComponentOrCustomStatus } from '../component-status';
import { NbBadgePosition } from '../badge/badge.component';
import { NbIconConfig } from '../icon/icon.component';

/**
 * Action item, display a link with an icon, or any other content provided instead.
 */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'nb-action',
  styleUrls: ['./action.component.scss'],
  template: `
    <ng-container *ngIf="icon(); else projectedContent">
      <a class="icon-container" [routerLink]="link()" [title]="title()" *ngIf="link()">
        <nb-icon [config]="icon()"></nb-icon>
        <ng-container [ngTemplateOutlet]="badgeTemplate"></ng-container>
      </a>
      <a class="icon-container" [href]="href()" [title]="title()" *ngIf="href() && !link()">
        <nb-icon [config]="icon()"></nb-icon>
        <ng-container [ngTemplateOutlet]="badgeTemplate"></ng-container>
      </a>
      <a class="icon-container" href="#" [title]="title()" *ngIf="!href() && !link()" (click)="$event.preventDefault()">
        <nb-icon [config]="icon()"></nb-icon>
        <ng-container [ngTemplateOutlet]="badgeTemplate"></ng-container>
      </a>
    </ng-container>

    <ng-template #projectedContent>
      <ng-content></ng-content>
      <ng-container [ngTemplateOutlet]="badgeTemplate"></ng-container>
    </ng-template>
    <ng-template #badgeTemplate>
      <nb-badge
        *ngIf="badgeText() || badgeDot()"
        [text]="badgeText()"
        [dotMode]="badgeDot()"
        [status]="badgeStatus()"
        [position]="badgePosition()"
      >
      </nb-badge>
    </ng-template>
  `,
  standalone: false,
})
export class NbActionComponent {
  /**
   * Router link to use
   * @type string
   */
  readonly link = input<string>();

  /**
   * Regular HREF link
   * @type: string
   */
  readonly href = input<string>();

  /**
   * Optional title for mouseover
   * @type string
   */
  readonly title = input<string>('');

  /**
   * Icon name or config object
   * @type {string | NbIconConfig}
   */
  readonly icon = input<string | NbIconConfig>();

  /**
   * Visually disables the item
   * @type boolean
   */
  readonly disabled = input(false, { transform: convertToBoolProperty });

  @HostBinding('class.disabled')
  get disabledClass(): boolean {
    return this.disabled();
  }

  /**
   * Use badge dot mode
   * @type boolean
   */
  readonly badgeDot = input(false, { transform: convertToBoolProperty });

  /**
   * Badge text to display
   * @type string
   */
  readonly badgeText = input<string>();

  /**
   * Badge status (adds specific styles):
   * 'basic', 'primary', 'info', 'success', 'warning', 'danger', 'control'
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
}

/**
 * Shows a horizontal list of actions, available in multiple sizes.
 * Aligns items vertically.
 *
 * @stacked-example(Showcase, action/action-showcase.component)
 *
 * Basic actions setup:
 * ```html
 * <nb-actions size="small">
 *   <nb-action icon="nb-search"></nb-action>
 *   <nb-action icon="nb-power-circled"></nb-action>
 *   <nb-action icon="nb-person"></nb-action>
 * </nb-actions>
 * ```
 * ### Installation
 *
 * Import `NbActionsModule` to your feature module.
 * ```ts
 * @NgModule({
 *   imports: [
 *     // ...
 *     NbActionsModule,
 *   ],
 * })
 * export class PageModule { }
 * ```
 * ### Usage
 *
 * Multiple sizes example:
 * @stacked-example(Multiple Sizes, action/action-sizes.component)
 *
 * It is also possible to specify a `badge` value:
 *
 * @stacked-example(Action Badge, action/action-badge.component)
 *
 * and we can set it to full a width of a parent component
 * @stacked-example(Full Width, action/action-width.component)
 *
 * Action dot mode
 * @stacked-example(Action badge in dot mode, action/action-dot-mode.component)
 *
 * @styles
 *
 * actions-background-color:
 * actions-divider-color:
 * actions-divider-style:
 * actions-divider-width:
 * actions-icon-color:
 * actions-text-color:
 * actions-text-font-family:
 * actions-text-font-weight:
 * actions-text-line-height:
 * actions-disabled-icon-color:
 * actions-disabled-text-color:
 * actions-tiny-height:
 * actions-tiny-icon-height:
 * actions-tiny-padding:
 * actions-tiny-text-font-size:
 * actions-small-height:
 * actions-small-icon-height:
 * actions-small-padding:
 * actions-small-text-font-size:
 * actions-medium-height:
 * actions-medium-icon-height:
 * actions-medium-padding:
 * actions-medium-text-font-size:
 * actions-large-height:
 * actions-large-icon-height:
 * actions-large-padding:
 * actions-large-text-font-size:
 * actions-giant-height:
 * actions-giant-icon-height:
 * actions-giant-padding:
 * actions-giant-text-font-size:
 */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'nb-actions',
  styleUrls: ['./actions.component.scss'],
  template: ` <ng-content select="nb-action"></ng-content> `,
  standalone: false,
})
export class NbActionsComponent {
  /**
   * Size of the component: 'tiny', 'small' (default), 'medium', 'large', 'giant'
   */
  readonly size = input<NbComponentSize>('small');

  /**
   * Component will fill full width of the container
   */
  readonly fullWidth = input(false, { transform: convertToBoolProperty });

  @HostBinding('class.full-width')
  get fullWidthClass(): boolean {
    return this.fullWidth();
  }

  @HostBinding('class.size-tiny')
  get tiny(): boolean {
    return this.size() === 'tiny';
  }

  @HostBinding('class.size-small')
  get small(): boolean {
    return this.size() === 'small';
  }

  @HostBinding('class.size-medium')
  get medium(): boolean {
    return this.size() === 'medium';
  }

  @HostBinding('class.size-large')
  get large(): boolean {
    return this.size() === 'large';
  }

  @HostBinding('class.size-giant')
  get giant(): boolean {
    return this.size() === 'giant';
  }
}
