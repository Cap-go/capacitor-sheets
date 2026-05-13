import '../components';

import { applySheetOptions } from '../components/cap-sheet';
import type {
  SheetActiveDetentChangeEvent,
  SheetOptions,
  SheetPresentedChangeEvent,
  SheetTravelEvent,
} from '../core/types';

interface SvelteActionReturn<T> {
  update?: (options: T) => void;
  destroy?: () => void;
}

export type SheetActionOptions = Partial<SheetOptions> & {
  onPresentedChange?: (event: SheetPresentedChangeEvent) => void;
  onActiveDetentChange?: (event: SheetActiveDetentChangeEvent) => void;
  onTravel?: (event: SheetTravelEvent) => void;
};

/** Svelte action for configuring `<cap-sheet>`. */
export function sheet(node: HTMLElement, options: SheetActionOptions = {}): SvelteActionReturn<SheetActionOptions> {
  let cleanup = setupSheet(node, options);
  return {
    update(nextOptions: SheetActionOptions): void {
      cleanup();
      cleanup = setupSheet(node, nextOptions);
    },
    destroy(): void {
      cleanup();
    },
  };
}

/** Configure a `<cap-sheet>` element. */
export function setupSheet(element: HTMLElement, options: SheetActionOptions = {}): () => void {
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

export type { SheetOptions, SheetPresentedChangeEvent, SheetActiveDetentChangeEvent, SheetTravelEvent };
