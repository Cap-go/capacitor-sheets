import '../components';

import { applySheetOptions } from '../components/cap-sheet';
import type {
  SheetOptions,
  SheetPresentedChangeEvent,
  SheetActiveDetentChangeEvent,
  SheetTravelEvent,
} from '../core/types';

/** Configure a `<cap-sheet>` element from React effects. */
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

/** Present a sheet by id from React event handlers. */
export function presentSheet(id: string): Promise<void> | undefined {
  return (document.getElementById(id) as (HTMLElement & { present?: () => Promise<void> }) | null)?.present?.();
}

/** Dismiss a sheet by id from React event handlers. */
export function dismissSheet(id: string): Promise<void> | undefined {
  return (document.getElementById(id) as (HTMLElement & { dismiss?: () => Promise<void> }) | null)?.dismiss?.();
}

type CapElementAttributes = {
  key?: unknown;
  ref?: unknown;
  children?: unknown;
  id?: string;
  class?: string;
  className?: string;
  style?: unknown;
  slot?: string;
  role?: string;
  part?: string;
  title?: string;
  tabIndex?: number;
  hidden?: boolean;
  [attribute: `data-${string}`]: unknown;
  [attribute: `aria-${string}`]: unknown;
  [eventHandler: `on${string}`]: unknown;
};

type Booleanish = boolean | 'true' | 'false';
type Placement = 'top' | 'bottom' | 'left' | 'right' | 'center';
type Track = 'top' | 'bottom' | 'left' | 'right';

interface CapSheetsIntrinsicElements {
  'cap-sheet': CapElementAttributes & {
    presented?: Booleanish;
    'default-presented'?: Booleanish;
    'active-detent'?: number | string;
    'default-active-detent'?: number | string;
    detents?: string;
    'content-placement'?: Placement;
    tracks?: string;
    'sheet-role'?: string;
    swipe?: Booleanish;
    'swipe-dismissal'?: Booleanish;
    'swipe-overshoot'?: Booleanish;
    'swipe-trap'?: Booleanish;
    'inert-outside'?: Booleanish;
    'close-on-outside-click'?: Booleanish;
    'close-on-escape'?: Booleanish;
    'focus-trap'?: Booleanish;
    'restore-focus'?: Booleanish;
    'theme-color-dimming'?: 'auto' | 'false';
    stack?: string;
  };
  'cap-sheet-trigger': CapElementAttributes & {
    for?: string;
    action?: 'present' | 'dismiss' | 'toggle' | 'step';
    detent?: number | string;
    direction?: 'up' | 'down';
  };
  'cap-sheet-portal': CapElementAttributes & { disabled?: Booleanish };
  'cap-sheet-view': CapElementAttributes & { for?: string; 'content-placement'?: Placement };
  'cap-sheet-backdrop': CapElementAttributes & { for?: string };
  'cap-sheet-content': CapElementAttributes & { for?: string };
  'cap-sheet-bleeding-background': CapElementAttributes;
  'cap-sheet-handle': CapElementAttributes & {
    for?: string;
    action?: 'step' | 'dismiss';
    detent?: number | string;
    direction?: 'up' | 'down';
  };
  'cap-sheet-title': CapElementAttributes & { for?: string };
  'cap-sheet-description': CapElementAttributes & { for?: string };
  'cap-sheet-special-wrapper': CapElementAttributes;
  'cap-sheet-special-wrapper-content': CapElementAttributes;
  'cap-sheet-stack': CapElementAttributes;
  'cap-sheet-outlet': CapElementAttributes & { for?: string };
  'cap-scroll': CapElementAttributes & { axis?: 'x' | 'y' };
  'cap-scroll-content': CapElementAttributes;
  'cap-fixed': CapElementAttributes;
  'cap-island': CapElementAttributes & { for?: string };
  'cap-external-overlay': CapElementAttributes & {
    for?: string;
    'content-getter'?: string;
    'self-managed-inert-outside'?: Booleanish;
  };
  'cap-visually-hidden': CapElementAttributes;
  'cap-auto-focus-target': CapElementAttributes & { for?: string; 'hidden-target'?: Booleanish };
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface IntrinsicElements extends CapSheetsIntrinsicElements {}
  }
}

declare module 'react' {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface IntrinsicElements extends CapSheetsIntrinsicElements {}
  }
}

declare module 'react/jsx-runtime' {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface IntrinsicElements extends CapSheetsIntrinsicElements {}
  }
}

export type {
  SheetOptions,
  SheetPresentedChangeEvent,
  SheetActiveDetentChangeEvent,
  SheetTravelEvent,
  Track,
  Placement,
};
