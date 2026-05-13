/**
 * @capgo/capacitor-sheets
 *
 * Framework-agnostic sheet, drawer, dialog, and scroll primitives for Capacitor apps.
 * The package is implemented with standards-based custom elements so the same API
 * works in React, Vue, Angular, Svelte, Solid, or plain TypeScript.
 */

import './components';

import type {
  CapAutoFocusTarget,
  CapExternalOverlay,
  CapFixed,
  CapIsland,
  CapScroll,
  CapScrollContent,
  CapSheet,
  CapSheetBackdrop,
  CapSheetBleedingBackground,
  CapSheetContent,
  CapSheetDescription,
  CapSheetHandle,
  CapSheetOutlet,
  CapSheetPortal,
  CapSheetSpecialWrapper,
  CapSheetSpecialWrapperContent,
  CapSheetStack,
  CapSheetTitle,
  CapSheetTrigger,
  CapSheetView,
  CapVisuallyHidden,
} from './components';

export { injectCapSheetStyles, CAP_SHEETS_CSS } from './core/styles';
export { updateThemeColor } from './core/theme-color';
export { SheetController } from './core/sheet-controller';
export { applySheetOptions, getSheetFromElement } from './components/cap-sheet';
export {
  CapAutoFocusTarget,
  CapExternalOverlay,
  CapFixed,
  CapIsland,
  CapScroll,
  CapScrollContent,
  CapSheet,
  CapSheetBackdrop,
  CapSheetBleedingBackground,
  CapSheetContent,
  CapSheetDescription,
  CapSheetHandle,
  CapSheetOutlet,
  CapSheetPortal,
  CapSheetSpecialWrapper,
  CapSheetSpecialWrapperContent,
  CapSheetStack,
  CapSheetTitle,
  CapSheetTrigger,
  CapSheetView,
  CapVisuallyHidden,
} from './components';
export type {
  ScrollByTravelOptions,
  ScrollController,
  ScrollToTravelOptions,
  SheetActiveDetentChangeEvent,
  SheetAnimationPreset,
  SheetAnimationSettings,
  SheetEasing,
  SheetOptions,
  SheetPlacement,
  SheetProgressAnimation,
  SheetSafeAreaEdge,
  SheetSafeAreaMode,
  SheetTrack,
  SheetTravelEvent,
  SheetTravelRangeChangeEvent,
  SheetTravelStatus,
  SheetTravelStatusChangeEvent,
  SheetTriggerAction,
} from './core/types';

/** Initialize all custom elements and structural styles. */
export function initCapSheets(): void {
  import('./components');
  if (typeof document !== 'undefined') {
    import('./core/styles').then(({ injectCapSheetStyles }) => injectCapSheetStyles(document));
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'cap-sheet': CapSheet;
    'cap-sheet-trigger': CapSheetTrigger;
    'cap-sheet-portal': CapSheetPortal;
    'cap-sheet-view': CapSheetView;
    'cap-sheet-backdrop': CapSheetBackdrop;
    'cap-sheet-content': CapSheetContent;
    'cap-sheet-bleeding-background': CapSheetBleedingBackground;
    'cap-sheet-handle': CapSheetHandle;
    'cap-sheet-title': CapSheetTitle;
    'cap-sheet-description': CapSheetDescription;
    'cap-sheet-special-wrapper': CapSheetSpecialWrapper;
    'cap-sheet-special-wrapper-content': CapSheetSpecialWrapperContent;
    'cap-sheet-stack': CapSheetStack;
    'cap-sheet-outlet': CapSheetOutlet;
    'cap-scroll': CapScroll;
    'cap-scroll-content': CapScrollContent;
    'cap-fixed': CapFixed;
    'cap-island': CapIsland;
    'cap-external-overlay': CapExternalOverlay;
    'cap-visually-hidden': CapVisuallyHidden;
    'cap-auto-focus-target': CapAutoFocusTarget;
  }
}
