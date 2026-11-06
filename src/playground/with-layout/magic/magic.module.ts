/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import {
  NbAlertModule,
  NbBadgeModule,
  NbButtonGroupModule,
  NbButtonModule,
  NbCardModule,
  NbChatModule,
  NbCheckboxModule,
  NbFormFieldModule,
  NbIconModule,
  NbInputModule,
  NbProgressBarModule,
  NbRadioModule,
  NbSelectModule,
  NbSelectWithAutocompleteModule,
  NbSpinnerModule,
  NbTagModule,
  NbToastrModule,
  NbToggleModule,
  NbTooltipModule,
} from '@nebular/theme';
import { MagicRoutingModule } from './magic-routing.module';
import { MagicGalleryComponent } from './magic-gallery.component';

@NgModule({
  declarations: [MagicGalleryComponent],
  imports: [
    CommonModule,
    RouterModule,
    NbAlertModule,
    NbBadgeModule,
    NbButtonGroupModule,
    NbButtonModule,
    NbCardModule,
    NbChatModule.forRoot(),
    NbCheckboxModule,
    NbFormFieldModule,
    NbIconModule,
    NbInputModule,
    NbProgressBarModule,
    NbRadioModule,
    NbSelectModule,
    NbSelectWithAutocompleteModule,
    NbSpinnerModule,
    NbTagModule,
    NbToastrModule.forRoot(),
    NbToggleModule,
    NbTooltipModule,
    MagicRoutingModule,
  ],
})
export class MagicModule {}
