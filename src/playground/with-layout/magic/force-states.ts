/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */

// A static page can't hover, focus or press an element. This copies every style rule that uses one of those
// pseudo-classes into a rule that matches inside a `.npg-force-<state>` wrapper instead, so the gallery
// renders all states at once, from the components' real styles.

const PSEUDO = /:(hover|focus|active)(?![\w-])/;
const PSEUDOS = new RegExp(PSEUDO.source, 'g');
const processed = new WeakSet<CSSStyleSheet>();

export function forceStates(document: Document) {
  for (const sheet of Array.from(document.styleSheets)) {
    if (processed.has(sheet)) {
      continue;
    }
    processed.add(sheet);
    try {
      copyRules(sheet);
    } catch {
      // Cross-origin sheets (the web font) can't be read.
    }
  }
}

function copyRules(parent: CSSStyleSheet | CSSGroupingRule) {
  const rules = Array.from(parent.cssRules);
  for (let i = rules.length - 1; i >= 0; i--) {
    const rule = rules[i];
    if (rule instanceof CSSStyleRule) {
      if (PSEUDO.test(rule.selectorText)) {
        const selector = rule.selectorText.replace(PSEUDOS, ':is(.npg-force-$1, .npg-force-$1 *)');
        parent.insertRule(selector + rule.cssText.substring(rule.cssText.indexOf('{')), i + 1);
      }
    } else if (rule instanceof CSSGroupingRule) {
      copyRules(rule);
    }
  }
}
