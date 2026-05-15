import { releaseThemeColorDimmer, retainThemeColorDimmer, setThemeColorDimming } from './theme-color';
import type {
  SheetActiveDetentChangeEvent,
  SheetAnimationSettings,
  SheetOptions,
  SheetPresentedChangeEvent,
  SheetProgressAnimation,
  SheetSafeAreaEdge,
  SheetSafeAreaMode,
  SheetTrack,
  SheetTravelEvent,
  SheetTravelStatus,
} from './types';
import {
  clamp,
  createId,
  dispatch,
  getFocusable,
  isVerticalTrack,
  measureCssLength,
  parseBoolean,
  parseList,
  parsePlacement,
  parseTracks,
  shouldSkipMotion,
  toEm,
  trackForPlacement,
  trackSign,
} from './utils';

type Source = SheetPresentedChangeEvent['source'];

interface SheetParts {
  view?: HTMLElement;
  backdrop?: HTMLElement;
  content?: HTMLElement;
  title?: HTMLElement;
  description?: HTMLElement;
  outlets: Set<HTMLElement>;
  islands: Set<HTMLElement>;
  externalOverlays: Set<HTMLElement>;
  autoFocusTarget?: HTMLElement;
}

interface PointerTravel {
  id: number;
  startOffsetPx: number;
  startX: number;
  startY: number;
  lastX: number;
  lastY: number;
  lastTime: number;
  velocity: number;
  dragging: boolean;
}

const defaultOptions: Required<
  Pick<
    SheetOptions,
    | 'contentPlacement'
    | 'sheetRole'
    | 'safeArea'
    | 'swipe'
    | 'swipeDismissal'
    | 'swipeOvershoot'
    | 'swipeTrap'
    | 'inertOutside'
    | 'nativeEdgeSwipePrevention'
    | 'nativeFocusScrollPrevention'
    | 'closeOnOutsideClick'
    | 'closeOnEscape'
    | 'focusTrap'
    | 'restoreFocus'
    | 'themeColorDimming'
  >
> = {
  contentPlacement: 'bottom',
  sheetRole: 'dialog',
  safeArea: 'auto',
  swipe: true,
  swipeDismissal: true,
  swipeOvershoot: true,
  swipeTrap: true,
  inertOutside: true,
  nativeEdgeSwipePrevention: true,
  nativeFocusScrollPrevention: true,
  closeOnOutsideClick: true,
  closeOnEscape: true,
  focusTrap: true,
  restoreFocus: true,
  themeColorDimming: 'auto',
};

const defaultAnimation: Required<Pick<SheetAnimationSettings, 'duration' | 'easing' | 'skip' | 'contentMove'>> = {
  duration: 420,
  easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
  skip: 'auto',
  contentMove: true,
};

const stackRegistry = new Map<string, Set<SheetController>>();

function parseNumber(value: string | null): number | undefined {
  if (value === null) return undefined;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function normalizeDetents(value: string | string[] | undefined): string[] {
  if (Array.isArray(value)) return value.filter(Boolean);
  return parseList(value || null);
}

const safeAreaEdges: SheetSafeAreaEdge[] = ['top', 'bottom', 'left', 'right'];

function parseSafeArea(value: string | null): SheetSafeAreaMode | undefined {
  if (value === null) return undefined;

  const normalized = value.trim().toLowerCase();
  if (!normalized || normalized === 'true' || normalized === 'auto' || normalized === 'all') return 'auto';
  if (normalized === 'false' || normalized === 'none' || normalized === 'off') return 'none';

  const edges = parseList(normalized).filter((edge): edge is SheetSafeAreaEdge =>
    safeAreaEdges.includes(edge as SheetSafeAreaEdge),
  );
  return edges.length > 0 ? edges : 'auto';
}

function resolveSafeAreaEdges(value: SheetSafeAreaMode | undefined): SheetSafeAreaEdge[] {
  if (value === false || value === 'none') return [];
  if (Array.isArray(value)) return value.filter((edge) => safeAreaEdges.includes(edge));
  return safeAreaEdges;
}

function readOptionsFromElement(root: HTMLElement): SheetOptions {
  const placement = parsePlacement(root.getAttribute('content-placement'));
  const defaultActiveDetent = parseNumber(root.getAttribute('default-active-detent'));
  const activeDetent = parseNumber(root.getAttribute('active-detent'));

  return {
    componentId: root.getAttribute('component-id') || root.id || undefined,
    stack: root.getAttribute('stack') || undefined,
    defaultPresented: parseBoolean(root.getAttribute('default-presented'), false),
    presented: root.hasAttribute('presented') ? parseBoolean(root.getAttribute('presented'), true) : undefined,
    defaultActiveDetent,
    activeDetent,
    detents: normalizeDetents(root.getAttribute('detents') || undefined),
    sheetRole: root.getAttribute('sheet-role') || defaultOptions.sheetRole,
    contentPlacement: placement,
    safeArea: parseSafeArea(root.getAttribute('safe-area')),
    tracks: parseTracks(root.getAttribute('tracks'), placement === 'center' ? 'bottom' : placement),
    swipe: parseBoolean(root.getAttribute('swipe'), defaultOptions.swipe),
    swipeDismissal: parseBoolean(root.getAttribute('swipe-dismissal'), defaultOptions.swipeDismissal),
    swipeOvershoot: parseBoolean(root.getAttribute('swipe-overshoot'), defaultOptions.swipeOvershoot),
    swipeTrap: parseBoolean(root.getAttribute('swipe-trap'), defaultOptions.swipeTrap),
    inertOutside: parseBoolean(root.getAttribute('inert-outside'), defaultOptions.inertOutside),
    nativeEdgeSwipePrevention: parseBoolean(
      root.getAttribute('native-edge-swipe-prevention'),
      defaultOptions.nativeEdgeSwipePrevention,
    ),
    nativeFocusScrollPrevention: parseBoolean(
      root.getAttribute('native-focus-scroll-prevention'),
      defaultOptions.nativeFocusScrollPrevention,
    ),
    closeOnOutsideClick: parseBoolean(root.getAttribute('close-on-outside-click'), defaultOptions.closeOnOutsideClick),
    closeOnEscape: parseBoolean(root.getAttribute('close-on-escape'), defaultOptions.closeOnEscape),
    focusTrap: parseBoolean(root.getAttribute('focus-trap'), defaultOptions.focusTrap),
    restoreFocus: parseBoolean(root.getAttribute('restore-focus'), defaultOptions.restoreFocus),
    themeColorDimming:
      root.getAttribute('theme-color-dimming') === 'false'
        ? false
        : root.getAttribute('theme-color-dimming') === 'auto'
          ? 'auto'
          : defaultOptions.themeColorDimming,
  };
}

function resolveAnimation(
  settings?: SheetAnimationSettings,
): Required<Pick<SheetAnimationSettings, 'duration' | 'easing' | 'skip' | 'contentMove'>> {
  const preset = settings?.preset || 'smooth';
  const presetDefaults: Record<string, Pick<SheetAnimationSettings, 'duration' | 'easing'>> = {
    gentle: { duration: 520, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' },
    smooth: { duration: defaultAnimation.duration, easing: defaultAnimation.easing },
    snappy: { duration: 260, easing: 'cubic-bezier(0.2, 0, 0, 1)' },
  };

  return {
    ...defaultAnimation,
    ...presetDefaults[preset],
    duration: settings?.duration ?? presetDefaults[preset]?.duration ?? defaultAnimation.duration,
    easing: settings?.easing ?? presetDefaults[preset]?.easing ?? defaultAnimation.easing,
    skip: settings?.skip ?? defaultAnimation.skip,
    contentMove: settings?.contentMove ?? defaultAnimation.contentMove,
  };
}

function attributeBoolean(value: boolean): string {
  return value ? 'true' : 'false';
}

/** Imperative controller backing a `<cap-sheet>` custom element. */
export class SheetController {
  readonly root: HTMLElement;
  readonly id: string;
  readonly parts: SheetParts = {
    outlets: new Set(),
    islands: new Set(),
    externalOverlays: new Set(),
  };

  options: SheetOptions;
  presented = false;
  activeDetent = 0;
  status: SheetTravelStatus = 'idle';

  private detentOffsetsPx: number[] = [0, 0];
  private hiddenOffsetPx = 0;
  private currentOffsetPx = 0;
  private activeTrack: SheetTrack = 'bottom';
  private pointerTravel: PointerTravel | null = null;
  private connected = false;
  private lockedScroll = false;
  private previousBodyOverflow = '';
  private previousBodyTouchAction = '';
  private inertedElements = new Map<HTMLElement, string | null>();
  private previousFocus: Element | null = null;
  private hasThemeDimmer = false;
  private stackId: string | null = null;
  private documentListenersAttached = false;
  private viewListenersElement: HTMLElement | null = null;
  private visualViewportListenersAttached = false;

  private readonly handleVisualViewportResize = (): void => {
    const view = this.parts.view;
    const visualViewport = this.root.ownerDocument.defaultView?.visualViewport;
    if (!view) return;
    if (!visualViewport || this.options.nativeFocusScrollPrevention === false) {
      view.style.setProperty('--cap-sheet-keyboard-offset', '0em');
      return;
    }

    const layoutHeight = this.root.ownerDocument.documentElement.clientHeight;
    const keyboardOffset = Math.max(0, layoutHeight - visualViewport.height - visualViewport.offsetTop);
    view.style.setProperty('--cap-sheet-keyboard-offset', `${toEm(view, keyboardOffset)}em`);
  };

  private readonly handleDocumentKeyDown = (event: KeyboardEvent): void => {
    if (!this.presented) return;
    if (event.key === 'Escape' && this.options.closeOnEscape !== false) {
      event.preventDefault();
      void this.dismiss({ source: 'escape' });
      return;
    }
    if (event.key === 'Tab' && this.options.focusTrap !== false) {
      this.trapFocus(event);
    }
  };

  private readonly handleViewClick = (event: MouseEvent): void => {
    if (!this.presented || this.options.closeOnOutsideClick === false) return;
    if (event.target === this.parts.view || event.target === this.parts.backdrop) {
      void this.dismiss({ source: 'outside' });
    }
  };

  private readonly handlePointerDown = (event: PointerEvent): void => {
    if (!this.presented || this.options.swipe === false || this.options.contentPlacement === 'center') return;
    if (!(event.target instanceof Element)) return;
    if (!this.parts.content?.contains(event.target) && event.target !== this.parts.backdrop) return;
    if (this.options.nativeEdgeSwipePrevention !== false && this.isNativeEdgePointer(event)) {
      event.preventDefault();
    }

    this.remeasure();
    this.pointerTravel = {
      id: event.pointerId,
      startOffsetPx: this.currentOffsetPx,
      startX: event.clientX,
      startY: event.clientY,
      lastX: event.clientX,
      lastY: event.clientY,
      lastTime: performance.now(),
      velocity: 0,
      dragging: false,
    };
  };

  private readonly handlePointerMove = (event: PointerEvent): void => {
    const travel = this.pointerTravel;
    if (!travel || travel.id !== event.pointerId) return;

    const axis = isVerticalTrack(this.activeTrack) ? 'y' : 'x';
    const current = axis === 'y' ? event.clientY : event.clientX;
    const start = axis === 'y' ? travel.startY : travel.startX;
    const delta = current - start;
    const crossDelta = axis === 'y' ? event.clientX - travel.startX : event.clientY - travel.startY;

    if (!travel.dragging) {
      if (Math.abs(delta) < 6 || Math.abs(crossDelta) > Math.abs(delta) * 1.25) return;
      travel.dragging = true;
      (event.currentTarget as HTMLElement | null)?.setPointerCapture?.(event.pointerId);
      this.setStatus('dragging');
      dispatch(this.root, 'cap-sheet-drag-start', this.getTravelEvent());
    }

    if (this.options.swipeTrap !== false) {
      event.preventDefault();
    }

    const now = performance.now();
    const previous = axis === 'y' ? travel.lastY : travel.lastX;
    const elapsed = Math.max(now - travel.lastTime, 1);
    travel.velocity = ((current - previous) / elapsed) * 1000;
    travel.lastX = event.clientX;
    travel.lastY = event.clientY;
    travel.lastTime = now;

    const nextOffset = this.limitOffset(travel.startOffsetPx + delta);
    this.applyOffset(nextOffset, 'dragging');
  };

  private readonly handlePointerUp = (event: PointerEvent): void => {
    const travel = this.pointerTravel;
    if (!travel || travel.id !== event.pointerId) return;

    const currentTarget = event.currentTarget as HTMLElement | null;
    if (currentTarget?.hasPointerCapture?.(event.pointerId)) {
      currentTarget.releasePointerCapture(event.pointerId);
    }

    this.pointerTravel = null;
    if (!travel.dragging) return;

    const nearest = this.nearestDetentForOffset(this.currentOffsetPx, travel.velocity);
    dispatch(this.root, 'cap-sheet-drag-end', this.getTravelEvent());

    if (nearest === 0 && this.options.swipeDismissal !== false) {
      void this.dismiss({ source: 'gesture' });
      return;
    }

    void this.stepTo(nearest, { source: 'gesture' });
  };

  private readonly handleWheel = (event: WheelEvent): void => {
    if (!this.presented || this.options.swipe === false || this.options.contentPlacement === 'center') return;
    if (!(event.target instanceof Element)) return;
    if (!this.parts.content?.contains(event.target) && event.target !== this.parts.backdrop) return;

    const delta = isVerticalTrack(this.activeTrack) ? event.deltaY : event.deltaX;
    if (Math.abs(delta) < 1) return;

    const nextOffset = this.limitOffset(this.currentOffsetPx + delta);
    if (Math.abs(nextOffset - this.currentOffsetPx) < 0.5) return;

    event.preventDefault();
    this.applyOffset(nextOffset, 'dragging');
    window.clearTimeout((this.root as HTMLElement & { __capWheelSettle?: number }).__capWheelSettle);
    (this.root as HTMLElement & { __capWheelSettle?: number }).__capWheelSettle = window.setTimeout(() => {
      const nearest = this.nearestDetentForOffset(this.currentOffsetPx, delta * 10);
      if (nearest === 0 && this.options.swipeDismissal !== false) {
        void this.dismiss({ source: 'gesture' });
      } else {
        void this.stepTo(nearest, { source: 'gesture' });
      }
    }, 120);
  };

  constructor(root: HTMLElement) {
    this.root = root;
    this.options = readOptionsFromElement(root);
    this.id = this.options.componentId || root.id || createId('cap-sheet');
    if (!root.id) root.id = this.id;
  }

  /** Connect the controller to the DOM and initialize current state. */
  connect(): void {
    if (this.connected) return;
    this.connected = true;
    this.configure(readOptionsFromElement(this.root));

    const nextPresented = this.options.presented ?? this.options.defaultPresented ?? false;
    this.activeDetent = this.resolveInitialDetent();
    this.presented = nextPresented;
    this.setStatus('idle');
    this.remeasure();
    this.applyOffset(
      nextPresented ? this.detentOffsetsPx[this.activeDetent] || 0 : this.detentOffsetsPx[0] || 0,
      'idle',
    );
    this.updateDomState(false);
    this.addGlobalListeners();
    this.registerStack();
  }

  /** Disconnect listeners and restore outside DOM state. */
  disconnect(): void {
    this.connected = false;
    this.removeGlobalListeners();
    this.unlockPage();
    this.clearInert();
    this.releaseThemeDimmer();
    this.unregisterStack();
  }

  /** Update options from attributes or setup helpers. */
  configure(options: Partial<SheetOptions>): void {
    this.options = {
      ...defaultOptions,
      ...this.options,
      ...options,
      detents: normalizeDetents(options.detents ?? this.options.detents),
    };
    const placement = this.options.contentPlacement || defaultOptions.contentPlacement;
    const tracks = Array.isArray(this.options.tracks)
      ? this.options.tracks
      : this.options.tracks
        ? [this.options.tracks]
        : [placement === 'center' ? 'bottom' : placement];
    this.activeTrack = trackForPlacement(placement, tracks);

    this.parts.view?.setAttribute('content-placement', placement);
    this.parts.view?.setAttribute('role', this.options.sheetRole || 'dialog');
    this.applySafeArea();
    this.handleVisualViewportResize();
    if (this.parts.content) {
      this.parts.content.setAttribute('aria-modal', attributeBoolean(this.options.inertOutside !== false));
    }
    this.linkAccessibleNames();
    this.registerStack();
  }

  /** Register a view, backdrop, content, or semantic part. */
  registerPart(part: keyof Omit<SheetParts, 'outlets' | 'islands' | 'externalOverlays'>, element: HTMLElement): void {
    this.parts[part] = element;
    this.configure(this.options);
    if (this.connected && part === 'view') {
      this.addViewListeners();
      this.addVisualViewportListeners();
      this.handleVisualViewportResize();
    }
    this.remeasure();
    this.applyOffset(
      this.presented ? this.detentOffsetsPx[this.activeDetent] || 0 : this.detentOffsetsPx[0] || this.hiddenOffsetPx,
      this.status,
    );
    this.updateDomState(this.presented);
  }

  /** Unregister a view, backdrop, content, or semantic part. */
  unregisterPart(part: keyof Omit<SheetParts, 'outlets' | 'islands' | 'externalOverlays'>, element: HTMLElement): void {
    if (this.parts[part] === element) {
      if (part === 'view') this.removeViewListeners();
      this.parts[part] = undefined;
    }
  }

  /** Register an outlet animated by sheet progress. */
  registerOutlet(element: HTMLElement): void {
    this.parts.outlets.add(element);
    this.updateOutletProgress();
  }

  /** Unregister an outlet. */
  unregisterOutlet(element: HTMLElement): void {
    this.parts.outlets.delete(element);
  }

  /** Register an outside island that remains interactive with inert outside enabled. */
  registerIsland(element: HTMLElement): void {
    this.parts.islands.add(element);
    if (this.presented) this.applyInert();
  }

  /** Unregister an outside island. */
  unregisterIsland(element: HTMLElement): void {
    this.parts.islands.delete(element);
    if (this.presented) this.applyInert();
  }

  /** Present the sheet. */
  async present(options: { source?: Source; animation?: SheetAnimationSettings; detent?: number } = {}): Promise<void> {
    this.remeasure();
    if (this.presented) {
      await this.stepTo(options.detent ?? this.activeDetent, options);
      return;
    }

    this.previousFocus = this.root.ownerDocument.activeElement;
    this.presented = true;
    this.activeDetent = clamp(options.detent ?? this.resolveInitialDetent(), 1, this.detentOffsetsPx.length - 1);
    this.updateDomState(true);
    this.lockPage();
    this.applyInert();
    this.retainThemeDimmer();
    this.setStatus('entering');
    dispatch(this.root, 'cap-sheet-present', this.getTravelEvent());
    await this.animateTo(this.detentOffsetsPx[this.activeDetent] || 0, {
      ...(this.options.enteringAnimationSettings || {}),
      ...(options.animation || {}),
    });
    this.setStatus('idle');
    this.focusInitialElement();
    this.emitPresentedChange(true, options.source || 'programmatic');
    this.emitActiveDetentChange(this.activeDetent, 0);
    this.updateStack();
  }

  /** Dismiss the sheet. */
  async dismiss(options: { source?: Source; animation?: SheetAnimationSettings } = {}): Promise<void> {
    if (!this.presented) return;

    this.remeasure();
    const previous = this.activeDetent;
    this.presented = false;
    this.activeDetent = 0;
    this.setStatus('exiting');
    dispatch(this.root, 'cap-sheet-dismiss', this.getTravelEvent());
    await this.animateTo(this.detentOffsetsPx[0] || this.hiddenOffsetPx, {
      ...(this.options.exitingAnimationSettings || {}),
      ...(options.animation || {}),
    });
    this.setStatus('idle');
    this.updateDomState(false);
    this.unlockPage();
    this.clearInert();
    this.releaseThemeDimmer();
    this.restoreFocus();
    this.emitPresentedChange(false, options.source || 'programmatic');
    this.emitActiveDetentChange(0, previous);
    this.updateStack();
  }

  /** Toggle presentation state. */
  async toggle(options: { source?: Source; animation?: SheetAnimationSettings } = {}): Promise<void> {
    if (this.presented) {
      await this.dismiss(options);
    } else {
      await this.present(options);
    }
  }

  /** Step to a specific detent index. */
  async stepTo(detent: number, options: { source?: Source; animation?: SheetAnimationSettings } = {}): Promise<void> {
    this.remeasure();
    const target = clamp(detent, this.options.swipeDismissal === false ? 1 : 0, this.detentOffsetsPx.length - 1);
    if (target === 0) {
      await this.dismiss(options);
      return;
    }
    if (!this.presented) {
      await this.present({ ...options, detent: target });
      return;
    }

    const previous = this.activeDetent;
    this.activeDetent = target;
    this.setStatus('settling');
    await this.animateTo(this.detentOffsetsPx[target] || 0, {
      ...(this.options.steppingAnimationSettings || {}),
      ...(options.animation || {}),
    });
    this.setStatus('idle');
    if (previous !== target) {
      this.emitActiveDetentChange(target, previous);
    }
  }

  /** Step up or down one detent. */
  async step(
    direction: 'up' | 'down' = 'up',
    options: { source?: Source; animation?: SheetAnimationSettings } = {},
  ): Promise<void> {
    const delta = direction === 'up' ? 1 : -1;
    await this.stepTo(this.activeDetent + delta, options);
  }

  /** Recalculate content size and detent offsets. */
  remeasure(): void {
    const content = this.parts.content;
    if (!content) return;

    const placement = this.options.contentPlacement || 'bottom';
    if (placement === 'center') {
      this.hiddenOffsetPx = 0;
      this.detentOffsetsPx = [0, 0];
      return;
    }

    const view = this.parts.view;
    const shouldMeasureHiddenView = Boolean(view?.hidden);
    const previousVisibility = view?.style.visibility || '';
    const previousPointerEvents = view?.style.pointerEvents || '';
    if (view && shouldMeasureHiddenView) {
      view.hidden = false;
      view.style.visibility = 'hidden';
      view.style.pointerEvents = 'none';
    }

    try {
      const track = this.activeTrack;
      const sign = trackSign(track);
      const axis = isVerticalTrack(track) ? 'y' : 'x';
      const rect = content.getBoundingClientRect();
      const size = axis === 'y' ? rect.height : rect.width;
      this.hiddenOffsetPx = Math.max(size, 1) * sign;

      const detents = normalizeDetents(this.options.detents);
      const offsets = [this.hiddenOffsetPx];
      for (const detent of detents) {
        const visible = measureCssLength(detent, content, axis);
        const offset = Math.max(Math.abs(this.hiddenOffsetPx) - visible, 0) * sign;
        offsets.push(offset);
      }
      offsets.push(0);
      this.detentOffsetsPx = offsets;
      this.activeDetent = clamp(this.activeDetent, this.options.swipeDismissal === false ? 1 : 0, offsets.length - 1);
      dispatch(this.root, 'cap-sheet-travel-range-change', {
        offsets: offsets.map((offset) => toEm(content, offset)),
        count: offsets.length,
      });
    } finally {
      if (view && shouldMeasureHiddenView) {
        view.hidden = true;
        view.style.visibility = previousVisibility;
        view.style.pointerEvents = previousPointerEvents;
      }
    }
  }

  /** Read current normalized travel details. */
  getTravelEvent(): SheetTravelEvent {
    const progress = this.getProgressForOffset(this.currentOffsetPx);
    return {
      progress,
      activeDetent: this.activeDetent,
      offset: toEm(this.parts.content || this.root, this.currentOffsetPx),
      status: this.status,
    };
  }

  private resolveInitialDetent(): number {
    const detents = normalizeDetents(this.options.detents);
    const last = detents.length + 1;
    const configured = this.options.activeDetent ?? this.options.defaultActiveDetent;
    if (configured !== undefined) return clamp(configured, 1, last);
    return detents.length > 0 ? 1 : last;
  }

  private applyOffset(offsetPx: number, status: SheetTravelStatus): void {
    this.currentOffsetPx = offsetPx;
    this.setStatus(status);
    const content = this.parts.content;
    const backdrop = this.parts.backdrop;
    const view = this.parts.view;
    const placement = this.options.contentPlacement || 'bottom';
    const progress = this.getProgressForOffset(offsetPx);

    if (content) {
      if (placement === 'center') {
        const scale = 0.96 + progress * 0.04;
        content.style.transform = `translate3d(0, 0, 0) scale(${scale})`;
        content.style.opacity = String(progress);
      } else {
        const offsetEm = toEm(content, offsetPx);
        const x = isVerticalTrack(this.activeTrack) ? '0' : `${offsetEm}em`;
        const y = isVerticalTrack(this.activeTrack) ? `${offsetEm}em` : '0';
        content.style.transform = `translate3d(${x}, ${y}, 0)`;
        content.style.opacity = '1';
      }
    }

    if (backdrop) {
      backdrop.style.opacity = String(
        progress *
          Number.parseFloat(getComputedStyle(backdrop).getPropertyValue('--cap-sheet-backdrop-opacity') || '0.44'),
      );
      backdrop.style.pointerEvents = progress > 0.01 && !this.hasInteractiveOutside() ? 'auto' : 'none';
    }

    if (view) {
      view.style.pointerEvents = progress > 0.01 && !this.hasInteractiveOutside() ? 'auto' : 'none';
      view.dataset.presented = this.presented ? 'true' : 'false';
      view.dataset.status = status;
      view.dataset.outsideInteractive = this.hasInteractiveOutside() ? 'true' : 'false';
    }

    this.applyOutletAnimations(progress);
    this.updateThemeDimming(progress);
    dispatch(this.root, 'cap-sheet-travel', this.getTravelEvent());
  }

  private async animateTo(targetOffsetPx: number, settings?: SheetAnimationSettings): Promise<void> {
    const content = this.parts.content;
    const backdrop = this.parts.backdrop;
    const resolved = resolveAnimation(settings);

    if (!content || shouldSkipMotion(resolved.skip)) {
      this.applyOffset(targetOffsetPx, 'idle');
      return;
    }

    const startOffset = this.currentOffsetPx;
    const fromProgress = this.getProgressForOffset(startOffset);
    const toProgress = this.getProgressForOffset(targetOffsetPx);
    const duration = Math.max(0, resolved.duration);
    const axis = isVerticalTrack(this.activeTrack) ? 'y' : 'x';
    const fromEm = toEm(content, startOffset);
    const targetEm = toEm(content, targetOffsetPx);
    const fromTransform =
      this.options.contentPlacement === 'center'
        ? `translate3d(0, 0, 0) scale(${0.96 + fromProgress * 0.04})`
        : axis === 'y'
          ? `translate3d(0, ${fromEm}em, 0)`
          : `translate3d(${fromEm}em, 0, 0)`;
    const toTransform =
      this.options.contentPlacement === 'center'
        ? `translate3d(0, 0, 0) scale(${0.96 + toProgress * 0.04})`
        : axis === 'y'
          ? `translate3d(0, ${targetEm}em, 0)`
          : `translate3d(${targetEm}em, 0, 0)`;

    const contentAnimation = resolved.contentMove
      ? content.animate(
          [
            { transform: fromTransform, opacity: this.options.contentPlacement === 'center' ? fromProgress : 1 },
            { transform: toTransform, opacity: this.options.contentPlacement === 'center' ? toProgress : 1 },
          ],
          { duration, easing: resolved.easing, fill: 'both' },
        )
      : null;

    const backdropOpacity = backdrop
      ? Number.parseFloat(getComputedStyle(backdrop).getPropertyValue('--cap-sheet-backdrop-opacity') || '0.44')
      : 0;
    const backdropAnimation = backdrop?.animate(
      [{ opacity: fromProgress * backdropOpacity }, { opacity: toProgress * backdropOpacity }],
      { duration, easing: resolved.easing, fill: 'both' },
    );

    const started = performance.now();
    let frame = 0;
    const tick = (): void => {
      const progress = duration === 0 ? 1 : clamp((performance.now() - started) / duration, 0, 1);
      const offset = startOffset + (targetOffsetPx - startOffset) * progress;
      this.currentOffsetPx = offset;
      this.applyOutletAnimations(this.getProgressForOffset(offset));
      this.updateThemeDimming(this.getProgressForOffset(offset));
      dispatch(this.root, 'cap-sheet-travel', this.getTravelEvent());
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);

    await Promise.allSettled([
      contentAnimation?.finished,
      backdropAnimation ? backdropAnimation.finished : Promise.resolve(),
    ]);
    cancelAnimationFrame(frame);
    contentAnimation?.cancel();
    backdropAnimation?.cancel();
    this.applyOffset(targetOffsetPx, 'idle');
  }

  private getProgressForOffset(offsetPx: number): number {
    if (this.options.contentPlacement === 'center') {
      return this.presented ? 1 : 0;
    }
    const hidden = Math.abs(this.hiddenOffsetPx) || 1;
    return clamp(1 - Math.abs(offsetPx) / hidden, 0, 1);
  }

  private limitOffset(offsetPx: number): number {
    const sign = trackSign(this.activeTrack);
    const maxAbs = Math.abs(this.hiddenOffsetPx);
    const min = sign < 0 ? -maxAbs : 0;
    const max = sign < 0 ? 0 : maxAbs;
    if (this.options.swipeOvershoot === false) return clamp(offsetPx, min, max);

    if (offsetPx < min) return min + (offsetPx - min) * 0.18;
    if (offsetPx > max) return max + (offsetPx - max) * 0.18;
    return offsetPx;
  }

  private nearestDetentForOffset(offsetPx: number, velocity: number): number {
    const sign = trackSign(this.activeTrack);
    const fling = Math.abs(velocity) > 700 ? Math.sign(velocity) * sign : 0;
    if (fling > 0) return Math.max(0, this.activeDetent - 1);
    if (fling < 0) return Math.min(this.detentOffsetsPx.length - 1, this.activeDetent + 1);

    let nearest = 0;
    let nearestDistance = Number.POSITIVE_INFINITY;
    this.detentOffsetsPx.forEach((offset, index) => {
      if (index === 0 && this.options.swipeDismissal === false) return;
      const distance = Math.abs(offset - offsetPx);
      if (distance < nearestDistance) {
        nearest = index;
        nearestDistance = distance;
      }
    });
    return nearest;
  }

  private hasInteractiveOutside(): boolean {
    return this.options.inertOutside === false && this.options.closeOnOutsideClick === false;
  }

  private isNativeEdgePointer(event: PointerEvent): boolean {
    const view = this.parts.view;
    if (!view) return false;

    const rect = view.getBoundingClientRect();
    const edgeSize = Math.max(20, rect.width * 0.04);
    return (
      event.clientX - rect.left <= edgeSize ||
      rect.right - event.clientX <= edgeSize ||
      event.clientY - rect.top <= edgeSize ||
      rect.bottom - event.clientY <= edgeSize
    );
  }

  private applySafeArea(): void {
    const view = this.parts.view;
    if (!view) return;

    const edges = new Set(resolveSafeAreaEdges(this.options.safeArea));
    view.dataset.safeArea = edges.size > 0 ? Array.from(edges).join(' ') : 'none';
    for (const edge of safeAreaEdges) {
      view.style.setProperty(
        `--cap-sheet-applied-safe-area-${edge}`,
        edges.has(edge) ? `var(--cap-sheet-safe-area-${edge})` : '0em',
      );
    }
  }

  private addGlobalListeners(): void {
    const doc = this.root.ownerDocument;
    if (!this.documentListenersAttached) {
      doc.addEventListener('keydown', this.handleDocumentKeyDown);
      this.documentListenersAttached = true;
    }
    this.addViewListeners();
    this.addVisualViewportListeners();
  }

  private removeGlobalListeners(): void {
    const doc = this.root.ownerDocument;
    if (this.documentListenersAttached) {
      doc.removeEventListener('keydown', this.handleDocumentKeyDown);
      this.documentListenersAttached = false;
    }
    this.removeViewListeners();
    this.removeVisualViewportListeners();
  }

  private addViewListeners(): void {
    const view = this.parts.view;
    if (!view || this.viewListenersElement === view) return;

    this.removeViewListeners();
    view.addEventListener('click', this.handleViewClick);
    view.addEventListener('pointerdown', this.handlePointerDown);
    view.addEventListener('pointermove', this.handlePointerMove, { passive: false });
    view.addEventListener('pointerup', this.handlePointerUp);
    view.addEventListener('pointercancel', this.handlePointerUp);
    view.addEventListener('wheel', this.handleWheel, { passive: false });
    this.viewListenersElement = view;
  }

  private removeViewListeners(): void {
    const view = this.viewListenersElement;
    if (!view) return;

    view.removeEventListener('click', this.handleViewClick);
    view.removeEventListener('pointerdown', this.handlePointerDown);
    view.removeEventListener('pointermove', this.handlePointerMove);
    view.removeEventListener('pointerup', this.handlePointerUp);
    view.removeEventListener('pointercancel', this.handlePointerUp);
    view.removeEventListener('wheel', this.handleWheel);
    this.viewListenersElement = null;
  }

  private addVisualViewportListeners(): void {
    const visualViewport = this.root.ownerDocument.defaultView?.visualViewport;
    if (!visualViewport || this.visualViewportListenersAttached) return;

    visualViewport.addEventListener('resize', this.handleVisualViewportResize);
    visualViewport.addEventListener('scroll', this.handleVisualViewportResize);
    this.visualViewportListenersAttached = true;
    this.handleVisualViewportResize();
  }

  private removeVisualViewportListeners(): void {
    const visualViewport = this.root.ownerDocument.defaultView?.visualViewport;
    if (!visualViewport || !this.visualViewportListenersAttached) return;

    visualViewport.removeEventListener('resize', this.handleVisualViewportResize);
    visualViewport.removeEventListener('scroll', this.handleVisualViewportResize);
    this.visualViewportListenersAttached = false;
  }

  private updateDomState(presented: boolean): void {
    const view = this.parts.view;
    const content = this.parts.content;
    if (view) {
      view.hidden = !presented && Math.abs(this.currentOffsetPx) === Math.abs(this.detentOffsetsPx[0] || 0);
      view.dataset.presented = presented ? 'true' : 'false';
      view.dataset.status = this.status;
      view.style.setProperty('--cap-sheet-z-index', String(this.getStackZIndex()));
    }
    if (content) {
      content.setAttribute('aria-hidden', attributeBoolean(!presented));
      content.setAttribute('tabindex', content.getAttribute('tabindex') || '-1');
    }
    this.root.toggleAttribute('presented', presented);
  }

  private linkAccessibleNames(): void {
    if (!this.parts.content) return;
    if (this.parts.title) {
      if (!this.parts.title.id) this.parts.title.id = createId('cap-sheet-title');
      this.parts.content.setAttribute('aria-labelledby', this.parts.title.id);
    }
    if (this.parts.description) {
      if (!this.parts.description.id) this.parts.description.id = createId('cap-sheet-description');
      this.parts.content.setAttribute('aria-describedby', this.parts.description.id);
    }
  }

  private focusInitialElement(): void {
    const content = this.parts.content;
    if (!content) return;
    const target =
      this.parts.autoFocusTarget || content.querySelector<HTMLElement>('cap-auto-focus-target, [autofocus]');
    const focusable = target || getFocusable(content)[0] || content;
    requestAnimationFrame(() => focusable.focus({ preventScroll: this.options.nativeFocusScrollPrevention !== false }));
  }

  private restoreFocus(): void {
    if (this.options.restoreFocus === false) return;
    if (this.previousFocus instanceof HTMLElement && this.previousFocus.isConnected) {
      this.previousFocus.focus({ preventScroll: true });
    }
    this.previousFocus = null;
  }

  private trapFocus(event: KeyboardEvent): void {
    const content = this.parts.content;
    if (!content) return;
    const focusable = getFocusable(content);
    if (focusable.length === 0) {
      event.preventDefault();
      content.focus({ preventScroll: true });
      return;
    }

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const active = this.root.ownerDocument.activeElement;
    if (event.shiftKey && active === first) {
      event.preventDefault();
      last.focus({ preventScroll: true });
    } else if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus({ preventScroll: true });
    }
  }

  private lockPage(): void {
    if (this.lockedScroll) return;
    const body = this.root.ownerDocument.body;
    this.previousBodyOverflow = body.style.overflow;
    this.previousBodyTouchAction = body.style.touchAction;
    body.dataset.capSheetScrollLocked = 'true';
    body.style.overflow = 'hidden';
    body.style.touchAction = 'none';
    this.lockedScroll = true;
  }

  private unlockPage(): void {
    if (!this.lockedScroll) return;
    const body = this.root.ownerDocument.body;
    delete body.dataset.capSheetScrollLocked;
    body.style.overflow = this.previousBodyOverflow;
    body.style.touchAction = this.previousBodyTouchAction;
    this.previousBodyOverflow = '';
    this.previousBodyTouchAction = '';
    this.lockedScroll = false;
  }

  private applyInert(): void {
    if (this.options.inertOutside === false || !this.parts.view) return;
    const body = this.root.ownerDocument.body;
    const allowed = new Set<HTMLElement>([this.parts.view, ...this.parts.islands, ...this.parts.externalOverlays]);

    this.clearInert();
    for (const child of Array.from(body.children)) {
      if (!(child instanceof HTMLElement)) continue;
      const isAllowed = Array.from(allowed).some((element) => child === element || child.contains(element));
      if (isAllowed) continue;
      this.inertedElements.set(child, child.getAttribute('aria-hidden'));
      child.inert = true;
      child.setAttribute('aria-hidden', 'true');
    }
  }

  private clearInert(): void {
    for (const [element, ariaHidden] of this.inertedElements) {
      element.inert = false;
      if (ariaHidden === null) {
        element.removeAttribute('aria-hidden');
      } else {
        element.setAttribute('aria-hidden', ariaHidden);
      }
    }
    this.inertedElements.clear();
  }

  private retainThemeDimmer(): void {
    if (this.hasThemeDimmer || this.options.themeColorDimming !== 'auto') return;
    this.hasThemeDimmer = true;
    retainThemeColorDimmer();
  }

  private releaseThemeDimmer(): void {
    if (!this.hasThemeDimmer) return;
    this.hasThemeDimmer = false;
    releaseThemeColorDimmer(this.root.ownerDocument);
  }

  private updateThemeDimming(progress: number): void {
    if (!this.hasThemeDimmer || this.options.themeColorDimming !== 'auto') return;
    const color = this.parts.backdrop
      ? getComputedStyle(this.parts.backdrop).getPropertyValue('--cap-sheet-backdrop-color') || 'rgb(0 0 0)'
      : 'rgb(0 0 0)';
    setThemeColorDimming(this.root.ownerDocument, clamp(progress * 0.44, 0, 0.7), color);
  }

  private applyOutletAnimations(progress: number): void {
    this.updateOutletProgress();
    for (const outlet of this.parts.outlets) {
      const animation = (outlet as HTMLElement & { travelAnimation?: SheetProgressAnimation }).travelAnimation;
      if (!animation) continue;
      for (const [property, value] of Object.entries(animation)) {
        if (value === null || value === undefined) continue;
        if (Array.isArray(value)) {
          outlet.style.setProperty(property, tween(value[0], value[1], progress));
        } else if (typeof value === 'function') {
          const next = value({ progress, tween: (start, end) => tween(start, end, progress) });
          if (next !== null && next !== undefined) outlet.style.setProperty(property, String(next));
        } else {
          outlet.style.setProperty(property, String(value));
        }
      }
    }
  }

  private updateOutletProgress(): void {
    const travel = this.getTravelEvent();
    for (const outlet of this.parts.outlets) {
      outlet.style.setProperty('--cap-sheet-progress', String(travel.progress));
      outlet.style.setProperty('--cap-sheet-offset', `${travel.offset}em`);
      outlet.dataset.sheetStatus = travel.status;
    }
  }

  private emitPresentedChange(presented: boolean, source: Source): void {
    const detail: SheetPresentedChangeEvent = { presented, source };
    dispatch(this.root, 'cap-sheet-presented-change', detail);
  }

  private emitActiveDetentChange(activeDetent: number, previousActiveDetent: number): void {
    const detail: SheetActiveDetentChangeEvent = { activeDetent, previousActiveDetent };
    dispatch(this.root, 'cap-sheet-active-detent-change', detail);
  }

  private registerStack(): void {
    const nextStack = this.options.stack || this.root.closest<HTMLElement>('cap-sheet-stack')?.id || null;
    if (this.stackId === nextStack) return;
    this.unregisterStack();
    this.stackId = nextStack;
    if (!nextStack) return;
    const stack = stackRegistry.get(nextStack) || new Set<SheetController>();
    stack.add(this);
    stackRegistry.set(nextStack, stack);
    this.updateStack();
  }

  private unregisterStack(): void {
    if (!this.stackId) return;
    const stack = stackRegistry.get(this.stackId);
    stack?.delete(this);
    if (stack?.size === 0) stackRegistry.delete(this.stackId);
    this.stackId = null;
  }

  private getStackZIndex(): number {
    if (!this.stackId) return 1000;
    const stack = Array.from(stackRegistry.get(this.stackId) || []);
    const index = stack.indexOf(this);
    return 1000 + Math.max(index, 0) * 2;
  }

  private updateStack(): void {
    if (!this.stackId) return;
    const stack = Array.from(stackRegistry.get(this.stackId) || []);
    const presented = stack.filter((controller) => controller.presented);
    stack.forEach((controller, index) => {
      controller.parts.view?.style.setProperty('--cap-sheet-z-index', String(1000 + index * 2));
      const depth = presented.length - presented.indexOf(controller) - 1;
      const stackDepth = Math.max(depth, 0);
      controller.parts.content?.style.setProperty('--cap-sheet-stack-depth', String(stackDepth));
      controller.applyStackingAnimations(stackDepth);
    });
  }

  private applyStackingAnimations(depth: number): void {
    const progress = clamp(depth, 0, 4) / 4;
    for (const outlet of this.parts.outlets) {
      const animation = (outlet as HTMLElement & { stackingAnimation?: SheetProgressAnimation }).stackingAnimation;
      if (!animation) continue;
      for (const [property, value] of Object.entries(animation)) {
        if (value === null || value === undefined) continue;
        if (Array.isArray(value)) {
          outlet.style.setProperty(property, tween(value[0], value[1], progress));
        } else if (typeof value === 'function') {
          const next = value({ progress, tween: (start, end) => tween(start, end, progress) });
          if (next !== null && next !== undefined) outlet.style.setProperty(property, String(next));
        } else {
          outlet.style.setProperty(property, String(value));
        }
      }
    }
  }

  private setStatus(status: SheetTravelStatus): void {
    if (this.status === status) return;
    const previousStatus = this.status;
    this.status = status;
    dispatch(this.root, 'cap-sheet-travel-status-change', { previousStatus, status });
  }
}

function tween(start: string | number, end: string | number, progress: number): string {
  const startString = String(start);
  const endString = String(end);
  const startValue = Number.parseFloat(startString);
  const endValue = Number.parseFloat(endString);
  if (!Number.isFinite(startValue) || !Number.isFinite(endValue)) return progress < 1 ? startString : endString;

  const unit = endString.replace(String(endValue), '') || startString.replace(String(startValue), '');
  const next = startValue + (endValue - startValue) * progress;
  return `${next}${unit}`;
}
