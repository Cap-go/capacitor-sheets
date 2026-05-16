import { SheetController } from '../core/sheet-controller';
import { injectCapSheetStyles } from '../core/styles';
import type { SheetAnimationSettings, SheetOptions } from '../core/types';
import { parseBoolean } from '../core/utils';

const observed = [
  'active-detent',
  'close-on-escape',
  'close-on-outside-click',
  'content-placement',
  'default-active-detent',
  'default-presented',
  'detents',
  'focus-trap',
  'inert-outside',
  'native-edge-swipe-prevention',
  'native-focus-scroll-prevention',
  'presented',
  'restore-focus',
  'safe-area',
  'sheet-role',
  'stack',
  'swipe',
  'swipe-dismissal',
  'swipe-overshoot',
  'swipe-trap',
  'theme-color-dimming',
  'tracks',
];

/** Root custom element coordinating sheet state, accessibility, gestures, and detents. */
export class CapSheet extends HTMLElement {
  readonly controller = new SheetController(this);
  private syncingAttribute = false;

  static get observedAttributes(): string[] {
    return observed;
  }

  connectedCallback(): void {
    injectCapSheetStyles(this.ownerDocument);
    this.style.display ||= 'contents';
    this.controller.connect();
  }

  disconnectedCallback(): void {
    this.controller.disconnect();
  }

  attributeChangedCallback(): void {
    if (this.syncingAttribute) return;
    this.controller.configure({});
    if (this.isConnected) {
      if (this.hasAttribute('presented') && !this.controller.presented) {
        void this.present({ source: 'programmatic' });
      } else if (!this.hasAttribute('presented') && this.controller.presented) {
        void this.dismiss({ source: 'programmatic' });
      }
    }
  }

  /** True when the sheet is currently presented. */
  get presented(): boolean {
    return this.controller.presented;
  }

  set presented(value: boolean) {
    if (value) {
      void this.present();
    } else {
      void this.dismiss();
    }
  }

  /** Current active detent index. */
  get activeDetent(): number {
    return this.controller.activeDetent;
  }

  set activeDetent(value: number) {
    void this.stepTo(value);
  }

  /** Configure the sheet imperatively without depending on a framework adapter. */
  configure(options: Partial<SheetOptions>): void {
    this.controller.configure(options);
  }

  /** Present the sheet. */
  async present(
    options: { source?: 'programmatic' | 'trigger'; animation?: SheetAnimationSettings; detent?: number } = {},
  ): Promise<void> {
    await this.controller.present(options);
    this.syncAttribute('presented', true);
  }

  /** Dismiss the sheet. */
  async dismiss(
    options: {
      source?: 'programmatic' | 'trigger' | 'gesture' | 'escape' | 'outside';
      animation?: SheetAnimationSettings;
    } = {},
  ): Promise<void> {
    await this.controller.dismiss(options);
    this.syncAttribute('presented', false);
  }

  /** Toggle presentation state. */
  async toggle(
    options: { source?: 'programmatic' | 'trigger'; animation?: SheetAnimationSettings } = {},
  ): Promise<void> {
    if (this.presented) {
      await this.dismiss(options);
    } else {
      await this.present(options);
    }
  }

  /** Step to a specific detent index. */
  async stepTo(
    detent: number,
    options: { source?: 'programmatic' | 'trigger' | 'gesture'; animation?: SheetAnimationSettings } = {},
  ): Promise<void> {
    await this.controller.stepTo(detent, options);
    if (this.controller.presented) this.syncAttribute('presented', true);
  }

  /** Step one detent up or down. */
  async step(
    direction: 'up' | 'down' = 'up',
    options: { source?: 'programmatic' | 'trigger'; animation?: SheetAnimationSettings } = {},
  ): Promise<void> {
    await this.controller.step(direction, options);
  }

  private syncAttribute(name: string, enabled: boolean): void {
    this.syncingAttribute = true;
    this.toggleAttribute(name, enabled);
    this.syncingAttribute = false;
  }
}

export function getSheetFromElement(element: Element): CapSheet | null {
  const explicitTarget = element.getAttribute('for');
  if (explicitTarget) {
    const found = element.ownerDocument.getElementById(explicitTarget);
    return isCapSheetElement(found) ? found : null;
  }

  const nearest = element.closest('cap-sheet');
  return isCapSheetElement(nearest) ? nearest : null;
}

function isCapSheetElement(element: Element | null): element is CapSheet {
  if (element?.localName !== 'cap-sheet') return false;
  const candidate = element as Partial<CapSheet>;
  return typeof candidate.present === 'function' && typeof candidate.dismiss === 'function';
}

export function applySheetOptions(element: HTMLElement, options: Partial<SheetOptions>): void {
  if (options.contentPlacement) element.setAttribute('content-placement', options.contentPlacement);
  if (options.detents !== undefined) {
    element.setAttribute('detents', Array.isArray(options.detents) ? options.detents.join(' ') : options.detents);
  }
  if (options.activeDetent !== undefined) element.setAttribute('active-detent', String(options.activeDetent));
  if (options.defaultActiveDetent !== undefined) {
    element.setAttribute('default-active-detent', String(options.defaultActiveDetent));
  }
  if (options.defaultPresented !== undefined)
    element.setAttribute('default-presented', String(options.defaultPresented));
  if (options.presented !== undefined) element.toggleAttribute('presented', options.presented);
  if (options.sheetRole) element.setAttribute('sheet-role', options.sheetRole);
  if (options.safeArea !== undefined) {
    element.setAttribute(
      'safe-area',
      Array.isArray(options.safeArea) ? options.safeArea.join(' ') : String(options.safeArea),
    );
  }
  if (options.stack) element.setAttribute('stack', options.stack);
  if (options.tracks)
    element.setAttribute('tracks', Array.isArray(options.tracks) ? options.tracks.join(' ') : options.tracks);
  for (const [key, attr] of [
    ['swipe', 'swipe'],
    ['swipeDismissal', 'swipe-dismissal'],
    ['swipeOvershoot', 'swipe-overshoot'],
    ['swipeTrap', 'swipe-trap'],
    ['inertOutside', 'inert-outside'],
    ['nativeEdgeSwipePrevention', 'native-edge-swipe-prevention'],
    ['nativeFocusScrollPrevention', 'native-focus-scroll-prevention'],
    ['closeOnOutsideClick', 'close-on-outside-click'],
    ['closeOnEscape', 'close-on-escape'],
    ['focusTrap', 'focus-trap'],
    ['restoreFocus', 'restore-focus'],
  ] as const) {
    const value = options[key as keyof SheetOptions];
    if (typeof value === 'boolean') element.setAttribute(attr, String(value));
  }
  if (options.themeColorDimming !== undefined) {
    element.setAttribute('theme-color-dimming', options.themeColorDimming === false ? 'false' : 'auto');
  }
}

export function readPresentedAttribute(element: HTMLElement, fallback = false): boolean {
  return parseBoolean(element.getAttribute('presented'), fallback);
}
