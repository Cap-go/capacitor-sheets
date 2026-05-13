import { defineElement } from '../core/utils';

import { CapScroll, CapScrollContent } from './cap-scroll';
import { CapSheet } from './cap-sheet';
import { CapSheetTrigger, CapSheetHandle } from './sheet-actions';
import {
  CapExternalOverlay,
  CapFixed,
  CapIsland,
  CapSheetOutlet,
  CapSheetStack,
  CapVisuallyHidden,
} from './sheet-context';
import {
  CapAutoFocusTarget,
  CapSheetBackdrop,
  CapSheetBleedingBackground,
  CapSheetContent,
  CapSheetDescription,
  CapSheetTitle,
  CapSheetView,
} from './sheet-parts';
import { CapSheetPortal } from './sheet-portal';

defineElement('cap-sheet', CapSheet);
defineElement('cap-sheet-trigger', CapSheetTrigger);
defineElement('cap-sheet-portal', CapSheetPortal);
defineElement('cap-sheet-view', CapSheetView);
defineElement('cap-sheet-backdrop', CapSheetBackdrop);
defineElement('cap-sheet-content', CapSheetContent);
defineElement('cap-sheet-bleeding-background', CapSheetBleedingBackground);
defineElement('cap-sheet-handle', CapSheetHandle);
defineElement('cap-sheet-title', CapSheetTitle);
defineElement('cap-sheet-description', CapSheetDescription);
defineElement('cap-sheet-stack', CapSheetStack);
defineElement('cap-sheet-outlet', CapSheetOutlet);
defineElement('cap-scroll', CapScroll);
defineElement('cap-scroll-content', CapScrollContent);
defineElement('cap-fixed', CapFixed);
defineElement('cap-island', CapIsland);
defineElement('cap-external-overlay', CapExternalOverlay);
defineElement('cap-visually-hidden', CapVisuallyHidden);
defineElement('cap-auto-focus-target', CapAutoFocusTarget);

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
  CapSheetStack,
  CapSheetTitle,
  CapSheetTrigger,
  CapSheetView,
  CapVisuallyHidden,
};
