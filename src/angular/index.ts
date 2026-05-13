import '../components';

import { applySheetOptions } from '../components/cap-sheet';
import type {
  SheetActiveDetentChangeEvent,
  SheetOptions,
  SheetPresentedChangeEvent,
  SheetTravelEvent,
} from '../core/types';

/** Configure a `<cap-sheet>` element from Angular `ngAfterViewInit`. */
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

export type { SheetOptions, SheetPresentedChangeEvent, SheetActiveDetentChangeEvent, SheetTravelEvent };
