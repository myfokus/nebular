/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */

import { ChangeDetectionStrategy, Component, computed, inject, input, QueryList, ViewChildren } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { animate, style, transition, trigger } from '@angular/animations';

import { NbToastComponent } from './toast.component';
import { NbToast } from './model';
import { NbLayoutDirectionService } from '../../services/direction.service';
import { NbGlobalPosition, NbPositionHelper } from '../cdk/overlay/position-helper';

const voidState = style({
  transform: 'translateX({{ direction }}110%)',
  height: 0,
  marginLeft: '0',
  marginRight: '0',
  marginTop: '0',
  marginBottom: '0',
});

const defaultOptions = { params: { direction: '' } };

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'nb-toastr-container',
  template: ` <nb-toast [@fadeIn]="fadeIn()" *ngFor="let toast of content()" [toast]="toast"></nb-toast>`,
  animations: [
    trigger('fadeIn', [
      transition(':enter', [voidState, animate(100)], defaultOptions),
      transition(':leave', [animate(100, voidState)], defaultOptions),
    ]),
  ],
  standalone: false,
})
export class NbToastrContainerComponent {
  protected readonly layoutDirection = inject(NbLayoutDirectionService);
  protected readonly positionHelper = inject(NbPositionHelper);

  readonly content = input<NbToast[]>([]);

  readonly context = input<Object>();

  readonly position = input<NbGlobalPosition>();

  @ViewChildren(NbToastComponent)
  toasts: QueryList<NbToastComponent>;

  protected readonly direction = toSignal(this.layoutDirection.onDirectionChange(), {
    initialValue: this.layoutDirection.getDirection(),
  });

  protected readonly fadeIn = computed(() => {
    // isRightPosition resolves logical positions through the layout direction, so the direction
    // signal is read to recompute on direction changes even though its value is not used directly.
    this.direction();
    const direction = this.positionHelper.isRightPosition(this.position()) ? '' : '-';
    return { value: '', params: { direction } };
  });
}
