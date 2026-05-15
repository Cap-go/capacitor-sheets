import { injectCapSheetStyles } from '../core/styles';
import { createId } from '../core/utils';

import { getSheetFromElement } from './cap-sheet';

abstract class SheetPartElement extends HTMLElement {
  abstract readonly partName: 'view' | 'backdrop' | 'content' | 'title' | 'description' | 'autoFocusTarget';

  connectedCallback(): void {
    injectCapSheetStyles(this.ownerDocument);
    const sheet = getSheetFromElement(this);
    sheet?.controller.registerPart(this.partName, this);
  }

  disconnectedCallback(): void {
    const sheet = getSheetFromElement(this);
    sheet?.controller.unregisterPart(this.partName, this);
  }
}

/** Full-screen layer that hosts a sheet backdrop and content. */
export class CapSheetView extends SheetPartElement {
  readonly partName = 'view' as const;

  connectedCallback(): void {
    super.connectedCallback();
    const sheet = getSheetFromElement(this);
    const placement = this.getAttribute('content-placement') || sheet?.controller.options.contentPlacement || 'bottom';
    this.setAttribute('content-placement', placement);
  }
}

/** Modal backdrop synchronized with sheet progress. */
export class CapSheetBackdrop extends SheetPartElement {
  readonly partName = 'backdrop' as const;
}

/** Main sheet surface. */
export class CapSheetContent extends SheetPartElement {
  readonly partName = 'content' as const;

  connectedCallback(): void {
    super.connectedCallback();
    if (!this.hasAttribute('tabindex')) this.tabIndex = -1;
  }
}

/** Decorative background that can extend beyond rounded sheet corners. */
export class CapSheetBleedingBackground extends HTMLElement {
  connectedCallback(): void {
    injectCapSheetStyles(this.ownerDocument);
  }
}

/** Accessible title used for `aria-labelledby`. */
export class CapSheetTitle extends SheetPartElement {
  readonly partName = 'title' as const;

  connectedCallback(): void {
    if (!this.id) this.id = createId('cap-sheet-title');
    super.connectedCallback();
  }
}

/** Accessible description used for `aria-describedby`. */
export class CapSheetDescription extends SheetPartElement {
  readonly partName = 'description' as const;

  connectedCallback(): void {
    if (!this.id) this.id = createId('cap-sheet-description');
    super.connectedCallback();
  }
}

/** Focus target used when the sheet is presented. */
export class CapAutoFocusTarget extends SheetPartElement {
  readonly partName = 'autoFocusTarget' as const;

  connectedCallback(): void {
    if (!this.hasAttribute('tabindex')) this.tabIndex = -1;
    super.connectedCallback();
  }
}
