import { injectCapSheetStyles } from '../core/styles';
import type { SheetProgressAnimation } from '../core/types';

import { getSheetFromElement } from './cap-sheet';

/** Host element that identifies a sheet stack. */
export class CapSheetStack extends HTMLElement {
  connectedCallback(): void {
    injectCapSheetStyles(this.ownerDocument);
    this.style.display ||= 'contents';
    if (!this.id) this.id = `cap-sheet-stack-${Math.random().toString(36).slice(2, 10)}`;
  }
}

/** Element that receives `--cap-sheet-progress` and optional travel animations. */
export class CapSheetOutlet extends HTMLElement {
  travelAnimation?: SheetProgressAnimation;
  stackingAnimation?: SheetProgressAnimation;

  connectedCallback(): void {
    injectCapSheetStyles(this.ownerDocument);
    getSheetFromElement(this)?.controller.registerOutlet(this);
  }

  disconnectedCallback(): void {
    getSheetFromElement(this)?.controller.unregisterOutlet(this);
  }
}

/** Composition wrapper for detached sheets, cards, pages, lightboxes, and custom nested layouts. */
export class CapSheetSpecialWrapper extends HTMLElement {
  connectedCallback(): void {
    injectCapSheetStyles(this.ownerDocument);
    this.style.display ||= 'contents';
  }
}

/** Content wrapper paired with `<cap-sheet-special-wrapper>`. */
export class CapSheetSpecialWrapperContent extends HTMLElement {
  connectedCallback(): void {
    injectCapSheetStyles(this.ownerDocument);
    this.style.display ||= 'contents';
  }
}

/** Marks a subtree as allowed while outside content is inert. */
export class CapIsland extends HTMLElement {
  connectedCallback(): void {
    injectCapSheetStyles(this.ownerDocument);
    getSheetFromElement(this)?.controller.registerIsland(this);
  }

  disconnectedCallback(): void {
    getSheetFromElement(this)?.controller.unregisterIsland(this);
  }
}

/** Registers third-party overlay DOM with the front sheet's inert-outside system. */
export class CapExternalOverlay extends HTMLElement {
  private registered: HTMLElement | null = null;

  connectedCallback(): void {
    injectCapSheetStyles(this.ownerDocument);
    this.register();
  }

  disconnectedCallback(): void {
    this.unregister();
  }

  private register(): void {
    const sheet = getSheetFromElement(this);
    if (!sheet) return;

    const selector = this.getAttribute('content-getter');
    const content = selector ? this.ownerDocument.querySelector<HTMLElement>(selector) : this;
    if (!content) return;

    this.registered = content;
    sheet.controller.registerIsland(content);
  }

  private unregister(): void {
    const sheet = getSheetFromElement(this);
    if (sheet && this.registered) {
      sheet.controller.unregisterIsland(this.registered);
    }
    this.registered = null;
  }
}

/** Fixed element helper intended for sheet-aware headers, toolbars, or floating controls. */
export class CapFixed extends HTMLElement {
  connectedCallback(): void {
    injectCapSheetStyles(this.ownerDocument);
  }
}

/** Visually hides content while leaving it available to assistive technology. */
export class CapVisuallyHidden extends HTMLElement {
  connectedCallback(): void {
    injectCapSheetStyles(this.ownerDocument);
  }
}
