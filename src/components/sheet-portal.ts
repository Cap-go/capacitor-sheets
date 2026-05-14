import { injectCapSheetStyles } from '../core/styles';
import { createId } from '../core/utils';

import type { CapSheet } from './cap-sheet';

/** Optional portal wrapper. Set `disabled` to keep children in place. */
export class CapSheetPortal extends HTMLElement {
  private host: HTMLDivElement | null = null;

  connectedCallback(): void {
    injectCapSheetStyles(this.ownerDocument);
    this.style.display ||= 'contents';
    if (this.hasAttribute('disabled')) return;

    const sheet = this.closest('cap-sheet') as CapSheet | null;
    if (!sheet) return;
    if (!sheet.id) sheet.id = createId('cap-sheet');

    this.host = this.ownerDocument.createElement('div');
    this.host.dataset.capSheetPortal = sheet.id;
    this.host.style.display = 'contents';

    for (const child of Array.from(this.children)) {
      if (child instanceof HTMLElement && !child.hasAttribute('for')) {
        child.setAttribute('for', sheet.id);
        for (const descendant of Array.from(
          child.querySelectorAll<HTMLElement>(
            'cap-sheet-view, cap-sheet-backdrop, cap-sheet-content, cap-sheet-title, cap-sheet-description, cap-sheet-trigger, cap-sheet-handle, cap-auto-focus-target',
          ),
        )) {
          if (!descendant.hasAttribute('for')) descendant.setAttribute('for', sheet.id);
        }
      }
      this.host.appendChild(child);
    }

    this.ownerDocument.body.appendChild(this.host);
  }

  disconnectedCallback(): void {
    if (!this.host) return;
    for (const child of Array.from(this.host.children)) {
      this.appendChild(child);
    }
    this.host.remove();
    this.host = null;
  }
}
