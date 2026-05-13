/** Placement of the sheet content inside the viewport. */
export type SheetPlacement = 'top' | 'bottom' | 'left' | 'right' | 'center';

/** Swipe track used when the content can be dismissed from an edge. */
export type SheetTrack = Exclude<SheetPlacement, 'center'>;

/** Runtime travel state emitted by sheet lifecycle events. */
export type SheetTravelStatus = 'idle' | 'entering' | 'exiting' | 'dragging' | 'settling';

/** Built-in animation presets tuned for mobile WebViews. */
export type SheetAnimationPreset = 'gentle' | 'smooth' | 'snappy';

/** Easing string accepted by the Web Animations API. */
export type SheetEasing = 'linear' | 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out' | string;

/** Declarative transform/opacity animation driven by sheet travel or stack progress. */
export type SheetProgressAnimation = Record<
  string,
  | string
  | number
  | [string | number, string | number]
  | ((context: {
      progress: number;
      tween: (start: string | number, end: string | number) => string;
    }) => string | number | null | undefined)
  | null
  | undefined
>;

/** Animation options for programmatic present, dismiss, and detent steps. */
export interface SheetAnimationSettings {
  /** Named preset. Defaults to `smooth`. */
  preset?: SheetAnimationPreset;
  /** Duration in milliseconds. Ignored when `skip` is true. */
  duration?: number;
  /** CSS easing used by WAAPI. */
  easing?: SheetEasing;
  /** Skip the animation and snap to the final state. */
  skip?: boolean | 'auto';
  /** For dual-track sheets, select the track used by this programmatic movement. */
  track?: SheetTrack;
  /** Keep content fixed while related outlets/backdrops animate. */
  contentMove?: boolean;
}

/** Trigger action used by `<cap-sheet-trigger>` and `<cap-sheet-handle>`. */
export type SheetTriggerAction =
  | 'present'
  | 'dismiss'
  | 'toggle'
  | 'step'
  | {
      type: 'step';
      direction?: 'up' | 'down';
      detent?: number;
    };

/** Options accepted by the `<cap-sheet>` custom element and setup helpers. */
export interface SheetOptions {
  /** Unique component id used by `for` attributes. */
  componentId?: string;
  /** Sheet stack id. Use the closest `<cap-sheet-stack>` when omitted. */
  stack?: string;
  /** Initial uncontrolled presentation state. */
  defaultPresented?: boolean;
  /** Controlled presentation state. */
  presented?: boolean;
  /** Initial detent index for uncontrolled sheets. */
  defaultActiveDetent?: number;
  /** Controlled detent index. */
  activeDetent?: number;
  /** Intermediate detents between dismissed `0` and fully presented `n`. */
  detents?: string | string[];
  /** WAI-ARIA role applied to `<cap-sheet-view>`. */
  sheetRole?: 'dialog' | 'alertdialog' | 'status' | string;
  /** Where content sits when fully presented. */
  contentPlacement?: SheetPlacement;
  /** Edge tracks that can dismiss the sheet. */
  tracks?: SheetTrack | SheetTrack[];
  /** Enables pointer, touch, trackpad, and wheel travel gestures. */
  swipe?: boolean;
  /** Allows swiping to detent `0` and dismissing. */
  swipeDismissal?: boolean;
  /** Allows a soft overshoot past the end detents. */
  swipeOvershoot?: boolean;
  /** Prevents gestures from escaping to page scroll while the sheet can travel. */
  swipeTrap?: boolean;
  /** Prevents interaction outside the sheet view while presented. */
  inertOutside?: boolean;
  /** Blocks OS edge navigation conflicts near the travel edge when possible. */
  nativeEdgeSwipePrevention?: boolean;
  /** Keeps focused inputs visible while the visual viewport changes. */
  nativeFocusScrollPrevention?: boolean;
  /** Dismiss when clicking outside the sheet content. */
  closeOnOutsideClick?: boolean;
  /** Dismiss when pressing Escape. */
  closeOnEscape?: boolean;
  /** Keep keyboard focus inside the sheet view while modal. */
  focusTrap?: boolean;
  /** Restore focus to the trigger when dismissed. */
  restoreFocus?: boolean;
  /** Blend the page theme color with the backdrop color. */
  themeColorDimming?: false | 'auto';
  /** Animation settings used when presenting. */
  enteringAnimationSettings?: SheetAnimationSettings;
  /** Animation settings used when dismissing. */
  exitingAnimationSettings?: SheetAnimationSettings;
  /** Animation settings used when stepping between detents. */
  steppingAnimationSettings?: SheetAnimationSettings;
}

/** Detail emitted by presentation state changes. */
export interface SheetPresentedChangeEvent {
  presented: boolean;
  source: 'programmatic' | 'trigger' | 'gesture' | 'escape' | 'outside';
}

/** Detail emitted by detent state changes. */
export interface SheetActiveDetentChangeEvent {
  activeDetent: number;
  previousActiveDetent: number;
}

/** Detail emitted continuously while the sheet travels. */
export interface SheetTravelEvent {
  /** Current normalized travel progress from dismissed `0` to fully presented `1`. */
  progress: number;
  /** Active detent index nearest to the current travel position. */
  activeDetent: number;
  /** Current offset from the presented position, in em. */
  offset: number;
  /** Current travel status. */
  status: SheetTravelStatus;
}

/** Detail emitted when the sheet travel status changes. */
export interface SheetTravelStatusChangeEvent {
  /** Previous travel status. */
  previousStatus: SheetTravelStatus;
  /** Current travel status. */
  status: SheetTravelStatus;
}

/** Detail emitted when the available detent travel range changes. */
export interface SheetTravelRangeChangeEvent {
  /** Detent offsets from dismissed to fully presented, expressed in em. */
  offsets: number[];
  /** Number of active travel stops, including dismissed and fully presented stops. */
  count: number;
}

/** Imperative controller exposed by `<cap-scroll>`. */
export interface ScrollController {
  /** Return scroll progress from `0` to `1`. */
  getProgress: () => number;
  /** Return traveled distance in CSS pixels. */
  getDistance: () => number;
  /** Return available travel distance in CSS pixels. */
  getAvailableDistance: () => number;
  /** Scroll to an absolute progress or distance. */
  scrollTo: (options: ScrollToTravelOptions) => void;
  /** Scroll by a relative progress or distance. */
  scrollBy: (options: ScrollByTravelOptions) => void;
}

/** Options for absolute scroll movement. */
export interface ScrollToTravelOptions {
  /** Destination progress from `0` to `1`. */
  progress?: number;
  /** Destination distance in CSS pixels. */
  distance?: number;
  /** Native scroll behavior. */
  behavior?: ScrollBehavior;
}

/** Options for relative scroll movement. */
export interface ScrollByTravelOptions {
  /** Relative progress delta from `-1` to `1`. */
  progress?: number;
  /** Relative distance in CSS pixels. */
  distance?: number;
  /** Native scroll behavior. */
  behavior?: ScrollBehavior;
}
