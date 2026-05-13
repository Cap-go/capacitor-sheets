import type { SheetPlacement, SheetTrack } from './types';

const focusableSelector = [
  'a[href]',
  'area[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  'iframe',
  'object',
  'embed',
  '[contenteditable]',
  '[tabindex]:not([tabindex="-1"])',
  'cap-sheet-handle',
  'cap-sheet-trigger',
].join(',');

/** Clamp a number between a minimum and maximum value. */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/** Convert an attribute string to boolean with a safe default. */
export function parseBoolean(value: string | null, defaultValue: boolean): boolean {
  if (value === null) return defaultValue;
  if (value === '' || value === 'true') return true;
  if (value === 'false') return false;
  return defaultValue;
}

/** Convert a comma/space separated attribute to an array. */
export function parseList(value: string | null): string[] {
  return value
    ? value
        .split(/[,\s]+/)
        .map((item) => item.trim())
        .filter(Boolean)
    : [];
}

/** Parse sheet tracks from an attribute value. */
export function parseTracks(value: string | null, fallback: SheetTrack): SheetTrack[] {
  const tracks = parseList(value).filter((item): item is SheetTrack =>
    ['top', 'bottom', 'left', 'right'].includes(item),
  );
  return tracks.length > 0 ? tracks : [fallback];
}

/** Resolve a placement value from an attribute. */
export function parsePlacement(value: string | null): SheetPlacement {
  return ['top', 'bottom', 'left', 'right', 'center'].includes(value || '') ? (value as SheetPlacement) : 'bottom';
}

/** Resolve the primary track used for travel. */
export function trackForPlacement(placement: SheetPlacement, tracks: SheetTrack[]): SheetTrack {
  if (placement !== 'center' && tracks.includes(placement)) return placement;
  return tracks[0] || (placement === 'center' ? 'bottom' : placement);
}

/** Returns true when a placement travels vertically. */
export function isVerticalTrack(track: SheetTrack): boolean {
  return track === 'top' || track === 'bottom';
}

/** Returns the travel sign for an edge track. */
export function trackSign(track: SheetTrack): 1 | -1 {
  return track === 'bottom' || track === 'right' ? 1 : -1;
}

/** Read the CSS `em` size for an element. */
export function getEmPx(element: Element | null): number {
  if (!element?.ownerDocument.defaultView) return 16;
  const fontSize = element.ownerDocument.defaultView.getComputedStyle(element).fontSize;
  const parsed = Number.parseFloat(fontSize);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 16;
}

/** Convert a measured layout value to `em` units for a given element. */
export function toEm(element: Element | null, value: number): number {
  return value / getEmPx(element);
}

/** Measure a CSS length against a context element. */
export function measureCssLength(length: string, context: HTMLElement, axis: 'x' | 'y'): number {
  const doc = context.ownerDocument;
  const probe = doc.createElement('div');
  probe.style.position = 'absolute';
  probe.style.visibility = 'hidden';
  probe.style.pointerEvents = 'none';
  probe.style.inset = '0';
  if (axis === 'x') {
    probe.style.width = length;
    probe.style.height = '0';
  } else {
    probe.style.height = length;
    probe.style.width = '0';
  }
  context.appendChild(probe);
  const rect = probe.getBoundingClientRect();
  probe.remove();
  return axis === 'x' ? rect.width : rect.height;
}

/** Query focusable descendants in DOM order. */
export function getFocusable(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(focusableSelector)).filter((element) => {
    if (element.hasAttribute('disabled')) return false;
    if (element.getAttribute('aria-hidden') === 'true') return false;
    const rects = element.getClientRects();
    return rects.length > 0;
  });
}

/** Dispatch a bubbling custom event with typed detail. */
export function dispatch<T>(target: EventTarget, type: string, detail: T): void {
  target.dispatchEvent(new CustomEvent(type, { bubbles: true, composed: true, detail }));
}

/** Define a custom element if it has not been registered yet. */
export function defineElement(name: string, constructor: CustomElementConstructor): void {
  if (typeof customElements === 'undefined') return;
  if (!customElements.get(name)) {
    customElements.define(name, constructor);
  }
}

/** Prefer reduced motion helper. */
export function shouldSkipMotion(settingsSkip?: boolean | 'auto'): boolean {
  if (settingsSkip === true) return true;
  if (settingsSkip === 'auto' && typeof matchMedia !== 'undefined') {
    return matchMedia('(prefers-reduced-motion: reduce)').matches;
  }
  return false;
}

/** Creates a stable id with a readable prefix. */
export function createId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}
