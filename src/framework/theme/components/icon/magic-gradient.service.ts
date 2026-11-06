/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */

import { DOCUMENT } from '@angular/common';
import { inject, Injectable } from '@angular/core';

import { NB_DOCUMENT } from '../../theme.options';

const MAGIC_GRADIENT_STATES = ['', 'focus', 'hover', 'active'] as const;

const SVG_NS = 'http://www.w3.org/2000/svg';
const DEFS_CLASS = 'nb-magic-gradient-defs';

/**
 * Adds the SVG paint servers that magic icons fill with (`fill: url(#nb-magic-gradient)`) to the document,
 * once. The stop colours come from the theme, see `nb-icon-theme`.
 */
@Injectable({ providedIn: 'root' })
export class NbMagicGradientService {
  protected document: Document = inject(NB_DOCUMENT, { optional: true }) ?? inject(DOCUMENT);

  addDefs() {
    // Checks the DOM instead of remembering, so defs removed with the body's content come back.
    if (!this.document?.body || this.document.body.querySelector(`.${DEFS_CLASS}`)) {
      return;
    }

    const svg = this.document.createElementNS(SVG_NS, 'svg');
    svg.setAttribute('class', DEFS_CLASS);
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');
    // display: none would disable the paint servers in some browsers.
    svg.setAttribute('style', 'position: absolute; width: 0; height: 0; overflow: hidden;');

    const defs = this.document.createElementNS(SVG_NS, 'defs');
    for (const state of MAGIC_GRADIENT_STATES) {
      defs.appendChild(this.createGradient(state ? `nb-magic-gradient-${state}` : 'nb-magic-gradient'));
    }
    svg.appendChild(defs);
    this.document.body.appendChild(svg);
  }

  protected createGradient(id: string): SVGLinearGradientElement {
    const gradient = this.document.createElementNS(SVG_NS, 'linearGradient');
    gradient.setAttribute('id', id);
    // Bottom left to top right, like linear-gradient(45deg, ...).
    gradient.setAttribute('x1', '0');
    gradient.setAttribute('y1', '1');
    gradient.setAttribute('x2', '1');
    gradient.setAttribute('y2', '0');
    for (const [offset, stop] of [
      ['0', 'start'],
      ['1', 'end'],
    ]) {
      const element = this.document.createElementNS(SVG_NS, 'stop');
      element.setAttribute('offset', offset);
      element.setAttribute('class', `nb-magic-gradient-${stop}`);
      gradient.appendChild(element);
    }
    return gradient;
  }
}
