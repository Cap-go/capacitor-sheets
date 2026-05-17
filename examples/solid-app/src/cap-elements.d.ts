import type { JSX } from 'solid-js';

type Booleanish = boolean | 'true' | 'false';
type Placement = 'top' | 'bottom' | 'left' | 'right' | 'center';

type CapElementAttributes = JSX.HTMLAttributes<HTMLElement> & {
  for?: string;
  action?: 'present' | 'dismiss' | 'toggle' | 'step';
  detent?: number | string;
  direction?: 'up' | 'down';
  axis?: 'x' | 'y';
  role?: string;
  'content-placement'?: Placement;
  'default-active-detent'?: number | string;
  detents?: string;
  disabled?: Booleanish;
  presented?: Booleanish;
  'default-presented'?: Booleanish;
  'active-detent'?: number | string;
  'safe-area'?: Booleanish | 'auto' | 'none' | 'all' | string;
  tracks?: string;
  'sheet-role'?: string;
  swipe?: Booleanish;
  'swipe-dismissal'?: Booleanish;
  'swipe-overshoot'?: Booleanish;
  'swipe-trap'?: Booleanish;
  'inert-outside'?: Booleanish;
  'native-edge-swipe-prevention'?: Booleanish;
  'native-focus-scroll-prevention'?: Booleanish;
  'close-on-outside-click'?: Booleanish;
  'close-on-escape'?: Booleanish;
  'focus-trap'?: Booleanish;
  'restore-focus'?: Booleanish;
  'theme-color-dimming'?: 'auto' | 'false';
  stack?: string;
};

declare module 'solid-js' {
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
