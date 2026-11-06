/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */

import { NgModule } from '@angular/core';
import { RouterModule, Route } from '@angular/router';
import { MagicGalleryComponent } from './magic-gallery.component';

const routes: Route[] = [
  {
    path: 'magic-gallery.component',
    component: MagicGalleryComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MagicRoutingModule {}
