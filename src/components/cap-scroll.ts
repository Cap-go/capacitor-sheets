import { injectCapSheetStyles } from '../core/styles';
import type { ScrollByTravelOptions, ScrollToTravelOptions } from '../core/types';
import { clamp, dispatch } from '../core/utils';

/** Framework-agnostic scroll primitive with progress helpers. */
export class CapScroll extends HTMLElement {
  private scrollTarget: HTMLElement = this;

  connectedCallback(): void {
    injectCapSheetStyles(this.ownerDocument);
    this.scrollTarget = this;
    this.addEventListener('scroll', this.handleScroll, { passive: true });
  }

  disconnectedCallback(): void {
    this.removeEventListener('scroll', this.handleScroll);
  }

  /** Return scroll progress from `0` to `1`. */
  getProgress(): number {
    return this.getAvailableDistance() === 0 ? 0 : clamp(this.getDistance() / this.getAvailableDistance(), 0, 1);
  }

  /** Return traveled distance in CSS pixels. */
  getDistance(): number {
    return this.axis === 'x' ? this.scrollTarget.scrollLeft : this.scrollTarget.scrollTop;
  }

  /** Return available travel distance in CSS pixels. */
  getAvailableDistance(): number {
    return this.axis === 'x'
      ? Math.max(0, this.scrollTarget.scrollWidth - this.scrollTarget.clientWidth)
      : Math.max(0, this.scrollTarget.scrollHeight - this.scrollTarget.clientHeight);
  }

  /** Scroll to an absolute progress or distance. Also supports the native HTMLElement overloads. */
  scrollTo(options?: ScrollToOptions | ScrollToTravelOptions): void;
  scrollTo(x: number, y: number): void;
  scrollTo(optionsOrX?: ScrollToOptions | ScrollToTravelOptions | number, y?: number): void {
    if (typeof optionsOrX === 'number') {
      super.scrollTo(optionsOrX, y ?? 0);
      return;
    }
    if (!optionsOrX || 'top' in optionsOrX || 'left' in optionsOrX) {
      super.scrollTo(optionsOrX);
      return;
    }

    const travelOptions = optionsOrX as ScrollToTravelOptions;
    const distance = this.resolveDistance(travelOptions.progress, travelOptions.distance);
    this.scrollTarget.scrollTo({
      left: this.axis === 'x' ? distance : undefined,
      top: this.axis === 'y' ? distance : undefined,
      behavior: travelOptions.behavior,
    });
  }

  /** Scroll by a relative progress or distance. Also supports the native HTMLElement overloads. */
  scrollBy(options?: ScrollToOptions | ScrollByTravelOptions): void;
  scrollBy(x: number, y: number): void;
  scrollBy(optionsOrX?: ScrollToOptions | ScrollByTravelOptions | number, y?: number): void {
    if (typeof optionsOrX === 'number') {
      super.scrollBy(optionsOrX, y ?? 0);
      return;
    }
    if (!optionsOrX || 'top' in optionsOrX || 'left' in optionsOrX) {
      super.scrollBy(optionsOrX);
      return;
    }

    const travelOptions = optionsOrX as ScrollByTravelOptions;
    const distance = this.resolveDistance(travelOptions.progress, travelOptions.distance);
    this.scrollTarget.scrollBy({
      left: this.axis === 'x' ? distance : undefined,
      top: this.axis === 'y' ? distance : undefined,
      behavior: travelOptions.behavior,
    });
  }

  private get axis(): 'x' | 'y' {
    return this.getAttribute('axis') === 'x' ? 'x' : 'y';
  }

  private resolveDistance(progress?: number, distance?: number): number {
    if (distance !== undefined) return distance;
    return clamp(progress ?? 0, 0, 1) * this.getAvailableDistance();
  }

  private readonly handleScroll = (): void => {
    dispatch(this, 'cap-scroll', {
      progress: this.getProgress(),
      distance: this.getDistance(),
      availableDistance: this.getAvailableDistance(),
    });
  };
}

/** Structural content wrapper for `<cap-scroll>`. */
export class CapScrollContent extends HTMLElement {
  connectedCallback(): void {
    injectCapSheetStyles(this.ownerDocument);
  }
}
