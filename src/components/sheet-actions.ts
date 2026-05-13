import { injectCapSheetStyles } from '../core/styles';

import { getSheetFromElement } from './cap-sheet';

type Action = 'present' | 'dismiss' | 'toggle' | 'step';

function normalizeAction(value: string | null, fallback: Action): Action {
  return ['present', 'dismiss', 'toggle', 'step'].includes(value || '') ? (value as Action) : fallback;
}

async function runAction(element: HTMLElement, fallback: Action): Promise<void> {
  const sheet = getSheetFromElement(element);
  if (!sheet) return;

  const action = normalizeAction(element.getAttribute('action'), fallback);
  if (action === 'present') {
    await sheet.present({ source: 'trigger' });
  } else if (action === 'dismiss') {
    await sheet.dismiss({ source: 'trigger' });
  } else if (action === 'step') {
    const detent = Number.parseInt(element.getAttribute('detent') || '', 10);
    if (Number.isFinite(detent)) {
      await sheet.stepTo(detent, { source: 'trigger' });
    } else {
      await sheet.step((element.getAttribute('direction') as 'up' | 'down' | null) || 'up', { source: 'trigger' });
    }
  } else {
    await sheet.toggle({ source: 'trigger' });
  }
}

/** Declarative element that presents, dismisses, toggles, or steps a sheet. */
export class CapSheetTrigger extends HTMLElement {
  connectedCallback(): void {
    injectCapSheetStyles(this.ownerDocument);
    this.role ||= 'button';
    this.tabIndex = this.tabIndex || 0;
    this.addEventListener('click', this.handleClick);
    this.addEventListener('keydown', this.handleKeyDown);
  }

  disconnectedCallback(): void {
    this.removeEventListener('click', this.handleClick);
    this.removeEventListener('keydown', this.handleKeyDown);
  }

  private readonly handleClick = (): void => {
    void runAction(this, 'toggle');
  };

  private readonly handleKeyDown = (event: KeyboardEvent): void => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    void runAction(this, 'toggle');
  };
}

/** Drag handle that can also step a sheet when activated by keyboard or click. */
export class CapSheetHandle extends HTMLElement {
  connectedCallback(): void {
    injectCapSheetStyles(this.ownerDocument);
    this.role ||= 'button';
    this.tabIndex = this.tabIndex || 0;
    this.setAttribute('aria-label', this.getAttribute('aria-label') || 'Move sheet');
    this.addEventListener('click', this.handleClick);
    this.addEventListener('keydown', this.handleKeyDown);
  }

  disconnectedCallback(): void {
    this.removeEventListener('click', this.handleClick);
    this.removeEventListener('keydown', this.handleKeyDown);
  }

  private readonly handleClick = (): void => {
    void runAction(this, 'step');
  };

  private readonly handleKeyDown = (event: KeyboardEvent): void => {
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      this.setAttribute('direction', 'up');
      void runAction(this, 'step');
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.setAttribute('direction', 'down');
      void runAction(this, 'step');
    }
  };
}
