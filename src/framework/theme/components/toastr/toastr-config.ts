/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */

import { InjectionToken } from '@angular/core';

import { NbGlobalLogicalPosition, NbGlobalPosition } from '../cdk/overlay/position-helper';
import { NbComponentOrCustomStatus, NbComponentStatus } from '../component-status';
import { NbIconConfig } from '../icon/icon.component';

type IconToClassMap = {
  [status in NbComponentStatus]: string;
};

export const NB_TOASTR_CONFIG = new InjectionToken<NbToastrConfig>('Default toastr options');

export type NbDuplicateToastBehaviour = 'previous' | 'all';

/**
 * The `NbToastrConfig` class describes configuration of the `NbToastrService.show` and global toastr configuration.
 * */
export class NbToastrConfig {
  /**
   * Determines where on the screen toast have to be rendered.
   * */
  position: NbGlobalPosition = NbGlobalLogicalPosition.TOP_END;
  /**
   * Status chooses color scheme for the toast.
   * */
  status: NbComponentOrCustomStatus = 'basic';
  /**
   * Duration is timeout between toast appears and disappears.
   * */
  duration: number = 3000;
  /**
   * Destroy by click means you can hide the toast by clicking it.
   * */
  destroyByClick: boolean = true;
  /**
   * Renders a close button in the top-end corner of the toast that destroys it.
   * */
  closeButton: boolean = false;
  /**
   * Accessible label of the close button.
   * */
  closeButtonLabel: string = 'Close';
  /**
   * Pauses the auto-dismiss timer while the pointer is over the toast.
   * The full duration starts again once the pointer leaves.
   * */
  pauseOnHover: boolean = false;
  /**
   * If preventDuplicates is true then the toast with the same title, message and status will not be rendered.
   * Find duplicates behaviour determined by `preventDuplicates`.
   * The default `previous` duplicate behaviour is used.
   * */
  preventDuplicates: boolean = false;
  /**
   * Determines the how to treat duplicates.
   * */
  duplicatesBehaviour: NbDuplicateToastBehaviour = 'previous';
  /*
   * The number of visible toasts. If the limit exceeded the oldest toast will be removed.
   * */
  limit?: number = null;
  /**
   * Class to be applied to the toast.
   */
  toastClass: string = '';
  /**
   * Determines render icon or not.
   * */
  hasIcon: boolean = true;
  /**
   * Icon name or icon config object that can be provided to render custom icon.
   * */
  icon: string | NbIconConfig = 'email';
  /**
   * Replaces the built-in status icons for the statuses it lists, unless a toast sets its own `icon`.
   * */
  statusIcons: Partial<Record<NbComponentStatus, string | NbIconConfig>> = {};
  /**
   * Toast status icon-class mapping.
   * */
  protected icons: IconToClassMap = {
    danger: 'flash-outline',
    success: 'checkmark-outline',
    info: 'question-mark-outline',
    warning: 'alert-triangle-outline',
    primary: 'email-outline',
    control: 'email-outline',
    basic: 'email-outline',
  };

  constructor(config: Partial<NbToastrConfig>) {
    this.patchIcon(config);
    Object.assign(this, config);
  }

  protected patchIcon(config: Partial<NbToastrConfig>) {
    if (!('icon' in config)) {
      config.icon = config.statusIcons?.[config.status ?? 'basic'] ?? {
        icon: this.icons[config.status] || this.icons.basic,
        pack: 'nebular-essentials',
      };
    }
  }
}
