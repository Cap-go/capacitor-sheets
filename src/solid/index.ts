import type { JSX } from 'solid-js';

import '../components';

import { applySheetOptions } from '../components/cap-sheet';
import type {
  SheetActiveDetentChangeEvent,
  SheetOptions,
  SheetPresentedChangeEvent,
  SheetSafeAreaEdge,
  SheetSafeAreaMode,
  SheetTravelEvent,
} from '../core/types';

/** Configure a `<cap-sheet>` element from Solid `onMount`. */
export function setupSheet(
  element: HTMLElement,
  options: Partial<SheetOptions> & {
    onPresentedChange?: (event: SheetPresentedChangeEvent) => void;
    onActiveDetentChange?: (event: SheetActiveDetentChangeEvent) => void;
    onTravel?: (event: SheetTravelEvent) => void;
  } = {},
): () => void {
  applySheetOptions(element, options);

  const presented = (event: Event): void =>
    options.onPresentedChange?.((event as CustomEvent<SheetPresentedChangeEvent>).detail);
  const detent = (event: Event): void =>
    options.onActiveDetentChange?.((event as CustomEvent<SheetActiveDetentChangeEvent>).detail);
  const travel = (event: Event): void => options.onTravel?.((event as CustomEvent<SheetTravelEvent>).detail);

  element.addEventListener('cap-sheet-presented-change', presented);
  element.addEventListener('cap-sheet-active-detent-change', detent);
  element.addEventListener('cap-sheet-travel', travel);

  return () => {
    element.removeEventListener('cap-sheet-presented-change', presented);
    element.removeEventListener('cap-sheet-active-detent-change', detent);
    element.removeEventListener('cap-sheet-travel', travel);
  };
}

type CapElementAttributes = JSX.HTMLAttributes<HTMLElement> & {
  for?: string;
  action?: 'present' | 'dismiss' | 'toggle' | 'step';
  detent?: number | string;
  direction?: 'up' | 'down';
  axis?: 'x' | 'y';
  role?: string;
  'content-placement'?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  'default-active-detent'?: number | string;
  detents?: string;
  disabled?: boolean | 'true' | 'false';
  presented?: boolean | 'true' | 'false';
  'default-presented'?: boolean | 'true' | 'false';
  'active-detent'?: number | string;
  'safe-area'?: boolean | 'true' | 'false' | 'auto' | 'none' | 'all' | string;
  tracks?: string;
  'sheet-role'?: string;
  swipe?: boolean | 'true' | 'false';
  'swipe-dismissal'?: boolean | 'true' | 'false';
  'swipe-overshoot'?: boolean | 'true' | 'false';
  'swipe-trap'?: boolean | 'true' | 'false';
  'inert-outside'?: boolean | 'true' | 'false';
  'native-edge-swipe-prevention'?: boolean | 'true' | 'false';
  'native-focus-scroll-prevention'?: boolean | 'true' | 'false';
  'close-on-outside-click'?: boolean | 'true' | 'false';
  'close-on-escape'?: boolean | 'true' | 'false';
  'focus-trap'?: boolean | 'true' | 'false';
  'restore-focus'?: boolean | 'true' | 'false';
  'theme-color-dimming'?: 'auto' | 'false';
  stack?: string;
};

declare module 'solid-js' {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      'cap-sheet': CapElementAttributes;
      'cap-sheet-trigger': CapElementAttributes;
      'cap-sheet-portal': CapElementAttributes;
      'cap-sheet-view': CapElementAttributes;
      'cap-sheet-backdrop': CapElementAttributes;
      'cap-sheet-content': CapElementAttributes;
      'cap-sheet-bleeding-background': CapElementAttributes;
      'cap-sheet-handle': CapElementAttributes;
      'cap-sheet-title': CapElementAttributes;
      'cap-sheet-description': CapElementAttributes;
      'cap-sheet-special-wrapper': CapElementAttributes;
      'cap-sheet-special-wrapper-content': CapElementAttributes;
      'cap-sheet-stack': CapElementAttributes;
      'cap-sheet-outlet': CapElementAttributes;
      'cap-scroll': CapElementAttributes;
      'cap-scroll-content': CapElementAttributes;
      'cap-fixed': CapElementAttributes;
      'cap-island': CapElementAttributes;
      'cap-external-overlay': CapElementAttributes;
      'cap-visually-hidden': CapElementAttributes;
      'cap-auto-focus-target': CapElementAttributes;
    }
  }
}

export type {
  SheetOptions,
  SheetPresentedChangeEvent,
  SheetActiveDetentChangeEvent,
  SheetTravelEvent,
  SheetSafeAreaEdge,
  SheetSafeAreaMode,
};
