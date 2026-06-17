<script setup lang="ts">
import { setupSheet } from '@capgo/capacitor-sheets/vue';
import type {
  SheetActiveDetentChangeEvent,
  SheetOptions as CapSheetOptions,
  SheetTravelEvent,
} from '@capgo/capacitor-sheets';
import type { ComponentPublicInstance } from 'vue';
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue';

import SheetBody from './SheetBody.vue';

type SheetPlacement = 'top' | 'bottom' | 'left' | 'right' | 'center';
type SheetOptions = Partial<CapSheetOptions> & {
  onPresentedChange?: (event: { presented: boolean; source: string }) => void;
  onActiveDetentChange?: (event: SheetActiveDetentChangeEvent) => void;
  onTravel?: (event: SheetTravelEvent) => void;
};

interface Usecase {
  slug: string;
  title: string;
  summary: string;
  placement: SheetPlacement;
  detents?: string[];
  handle?: boolean;
  sheetClass?: string;
  backdrop?: boolean;
  options?: SheetOptions;
  outlet?: 'depth' | 'parallax';
  child?: Usecase;
}

interface SheetEntry {
  usecase: Usecase;
  index: number;
  child: boolean;
  renderId: string;
  stackId?: string;
}

const DETACHED_CENTER_QUERY = '(min-width: 43.75rem)';

const usecases: Usecase[] = [
  {
    slug: 'long-sheet',
    title: 'Long Sheet',
    summary: 'A full-height story page that scrolls inside the sheet.',
    placement: 'bottom',
    detents: ['100dvh'],
    sheetClass: 'demo-sheet--long',
  },
  {
    slug: 'sheet-with-detent',
    title: 'Sheet with Detent',
    summary: 'A contact picker opens at a useful intermediate stop.',
    placement: 'bottom',
    detents: ['35em'],
    sheetClass: 'demo-sheet--detents',
    options: { defaultActiveDetent: 1, safeArea: 'none' },
  },
  {
    slug: 'sidebar',
    title: 'Sidebar',
    summary: 'A full-height navigation panel from the left edge.',
    placement: 'left',
    detents: ['20.25em'],
    handle: false,
    sheetClass: 'demo-sheet--side',
    options: { safeArea: 'none' },
  },
  {
    slug: 'bottom-sheet',
    title: 'Bottom Sheet',
    summary: 'A standard native-feeling mobile bottom sheet.',
    placement: 'bottom',
    detents: ['18em', '32em'],
    sheetClass: 'demo-sheet--bottom',
    options: { safeArea: 'none' },
  },
  {
    slug: 'sheet-with-keyboard',
    title: 'Sheet with Keyboard',
    summary: 'Focused inputs stay above the visual viewport.',
    placement: 'bottom',
    detents: ['24em', '38em'],
    sheetClass: 'demo-sheet--form',
    options: { defaultActiveDetent: 2, nativeFocusScrollPrevention: true },
  },
  {
    slug: 'toast',
    title: 'Toast',
    summary: 'Non-blocking notification built from a sheet.',
    placement: 'bottom',
    detents: ['8em'],
    handle: false,
    sheetClass: 'demo-sheet--toast',
    backdrop: false,
    options: {
      sheetRole: 'status',
      inertOutside: false,
      closeOnOutsideClick: false,
      closeOnEscape: true,
      focusTrap: false,
      restoreFocus: false,
    },
  },
  {
    slug: 'detached-sheet',
    title: 'Detached Sheet',
    summary: 'A floating confirmation surface with rounded corners.',
    placement: 'bottom',
    detents: ['32.5em'],
    sheetClass: 'demo-sheet--detached',
  },
  {
    slug: 'page-from-bottom',
    title: 'Page from Bottom',
    summary: 'A full-page flow presented from the bottom edge.',
    placement: 'bottom',
    detents: ['100dvh'],
    sheetClass: 'demo-sheet--page',
  },
  {
    slug: 'top-sheet',
    title: 'Top Sheet',
    summary: 'A top-anchored feature panel with a clear close control.',
    placement: 'top',
    detents: ['42em'],
    handle: false,
    sheetClass: 'demo-sheet--top',
    options: { safeArea: 'none' },
  },
  {
    slug: 'sheet-with-stacking',
    title: 'Sheet with Stacking',
    summary: 'A second sheet stacks above the first one.',
    placement: 'bottom',
    detents: ['20em', '32em'],
    sheetClass: 'demo-sheet--stack-parent',
    options: { defaultActiveDetent: 2, safeArea: 'none' },
    child: {
      slug: 'sheet-with-stacking-child',
      title: 'Stacked Details',
      summary: 'Second layer on the same stack.',
      placement: 'bottom',
      detents: ['18em', '28em'],
      sheetClass: 'demo-sheet--stacked',
      options: { defaultActiveDetent: 2, safeArea: 'none' },
    },
  },
  {
    slug: 'sheet-with-depth',
    title: 'Sheet with Depth',
    summary: 'Sheet progress scales the page behind it.',
    placement: 'bottom',
    detents: ['28em', '46em'],
    sheetClass: 'demo-sheet--depth',
    outlet: 'depth',
    options: { defaultActiveDetent: 2, safeArea: 'none' },
  },
  {
    slug: 'parallax-page',
    title: 'Parallax Page',
    summary: 'Sheet progress drives a parallax background.',
    placement: 'bottom',
    detents: ['18em', '36em'],
    sheetClass: 'demo-sheet--parallax',
    outlet: 'parallax',
    options: { safeArea: 'none' },
  },
  {
    slug: 'page',
    title: 'Page',
    summary: 'Route-like page overlay from the right edge.',
    placement: 'right',
    detents: ['100dvw'],
    handle: false,
    sheetClass: 'demo-sheet--page demo-sheet--right-page',
  },
  {
    slug: 'lightbox',
    title: 'Lightbox',
    summary: 'Full-screen image viewing with a dark comment sheet.',
    placement: 'center',
    handle: false,
    sheetClass: 'demo-sheet--lightbox',
    options: { safeArea: 'none' },
    child: {
      slug: 'lightbox-comments',
      title: 'Comments',
      summary: 'Dark comment sheet over the lightbox.',
      placement: 'bottom',
      detents: ['60dvh', '100dvh'],
      handle: false,
      sheetClass: 'demo-sheet--lightbox-comments',
      options: { defaultActiveDetent: 1, safeArea: 'none' },
    },
  },
  {
    slug: 'persistent-sheet-with-detent',
    title: 'Persistent Sheet with Detent',
    summary: 'A mini player stays available while the page remains interactive.',
    placement: 'bottom',
    detents: ['4.75em', '100dvh'],
    handle: false,
    sheetClass: 'demo-sheet--persistent',
    options: {
      defaultActiveDetent: 1,
      inertOutside: false,
      closeOnOutsideClick: false,
      focusTrap: false,
      swipeDismissal: false,
    },
  },
  {
    slug: 'card',
    title: 'Card',
    summary: 'A compact event card with one clear action.',
    placement: 'center',
    sheetClass: 'demo-sheet--card',
  },
];

const detachedCentered = ref(false);
const sheetRefs = new Map<string, { element: HTMLElement; entry: SheetEntry }>();
let sheetCleanups: (() => void)[] = [];
let mediaQuery: MediaQueryList | undefined;
let mediaListener: (() => void) | undefined;

const depthUsecaseIndex = usecases.findIndex((usecase) => usecase.slug === 'sheet-with-depth');
const depthUsecase = depthUsecaseIndex >= 0 ? usecases[depthUsecaseIndex] : undefined;
const depthOutletFor = computed(() => (depthUsecase ? getSheetId(depthUsecase, depthUsecaseIndex) : undefined));

onMounted(() => {
  mediaQuery = window.matchMedia(DETACHED_CENTER_QUERY);
  const syncDetachedPlacement = () => {
    detachedCentered.value = mediaQuery?.matches ?? false;
  };

  syncDetachedPlacement();
  mediaQuery.addEventListener('change', syncDetachedPlacement);
  mediaListener = syncDetachedPlacement;
  nextTick(setupSheets);
});

watch(detachedCentered, () => {
  nextTick(setupSheets);
});

onUnmounted(() => {
  if (mediaQuery && mediaListener) {
    mediaQuery.removeEventListener('change', mediaListener);
  }
  cleanupSheets();
});

function setSheetRef(element: Element | ComponentPublicInstance | null, entry: SheetEntry): void {
  if (element instanceof HTMLElement) {
    sheetRefs.set(entry.renderId, { element, entry });
    return;
  }
  sheetRefs.delete(entry.renderId);
}

function sheetRefFor(entry: SheetEntry): (element: Element | ComponentPublicInstance | null) => void {
  return (element) => setSheetRef(element, entry);
}

function setTravelOutlet(element: Element | ComponentPublicInstance | null, type: 'depth' | 'parallax'): void {
  if (!(element instanceof HTMLElement)) return;

  Object.assign(element, {
    travelAnimation:
      type === 'depth'
        ? {
            transform: ({ progress }: { progress: number }) =>
              `translate3d(0, ${progress * 1.25}rem, 0) scale(${1 - progress * 0.14})`,
            filter: ({ progress }: { progress: number }) =>
              `saturate(${1 - progress * 0.32}) brightness(${1 - progress * 0.1})`,
            'border-radius': ({ progress }: { progress: number }) => `${progress * 2}rem`,
            'box-shadow': ({ progress }: { progress: number }) =>
              progress > 0.01 ? `0 ${progress * 1.75}rem ${progress * 5}rem rgb(20 23 22 / 0.24)` : 'none',
          }
        : { '--demo-parallax-progress': ({ progress }: { progress: number }) => String(progress) },
  });
}

function travelOutletRefFor(type: 'depth' | 'parallax'): (element: Element | ComponentPublicInstance | null) => void {
  return (element) => setTravelOutlet(element, type);
}

function setupSheets(): void {
  cleanupSheets();

  sheetRefs.forEach(({ element, entry }) => {
    sheetCleanups.push(
      setupSheet(element, {
        ...(entry.usecase.options || {}),
        contentPlacement: resolvedPlacement(entry.usecase),
        detents: entry.usecase.detents,
        onTravel: ({ progress }) => element.style.setProperty('--demo-sheet-progress', progress.toFixed(3)),
      }),
    );
  });
}

function cleanupSheets(): void {
  sheetCleanups.forEach((cleanup) => cleanup());
  sheetCleanups = [];
}

function sheetEntries(usecase: Usecase, index: number): SheetEntry[] {
  const stackId = usecase.child ? stackIdFor(index) : undefined;
  const entries: SheetEntry[] = [
    {
      usecase,
      index,
      child: false,
      renderId: getSheetRenderId(usecase, index, false),
      stackId,
    },
  ];

  if (usecase.child) {
    entries.push({
      usecase: usecase.child,
      index,
      child: true,
      renderId: getSheetRenderId(usecase.child, index, true),
      stackId,
    });
  }

  return entries;
}

function hasHandle(usecase: Usecase): boolean {
  return usecase.handle !== false && usecase.placement !== 'center';
}

function shouldRenderBleedingBackground(usecase: Usecase): boolean {
  return usecase.placement !== 'center' && usecase.slug !== 'detached-sheet' && usecase.slug !== 'toast';
}

function resolvedPlacement(usecase: Usecase): SheetPlacement {
  return usecase.slug === 'detached-sheet' && detachedCentered.value ? 'center' : usecase.placement;
}

function detentsAttribute(usecase: Usecase): string | undefined {
  return usecase.detents?.join(' ');
}

function sheetClass(usecase: Usecase): string {
  return ['demo-sheet-content', usecase.sheetClass].filter(Boolean).join(' ');
}

function cardLabel(usecase: Usecase): string {
  return usecase.title
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 3)
    .toUpperCase();
}

function placementLabel(placement: SheetPlacement): string {
  return placement === 'center' ? 'center' : `${placement} edge`;
}

function stackIdFor(index: number): string {
  return `demo-stack-${index}`;
}

function getSheetId(usecase: Usecase, index: number): string {
  return `demo-${index}-${usecase.slug}`;
}

function getSheetRenderId(usecase: Usecase, index: number, child: boolean): string {
  return child ? `${getSheetId(usecase, index)}-child` : getSheetId(usecase, index);
}

function booleanAttributes(options?: SheetOptions): Record<string, string> {
  if (!options) return {};

  return Object.fromEntries(
    [
      ['swipe-dismissal', options.swipeDismissal],
      ['inert-outside', options.inertOutside],
      ['close-on-outside-click', options.closeOnOutsideClick],
      ['close-on-escape', options.closeOnEscape],
      ['focus-trap', options.focusTrap],
      ['restore-focus', options.restoreFocus],
      ['native-focus-scroll-prevention', options.nativeFocusScrollPrevention],
    ]
      .filter(([, value]) => typeof value === 'boolean')
      .map(([name, value]) => [name, String(value)]),
  );
}
</script>

<template>
  <template v-for="(usecase, index) in usecases" :key="usecase.slug">
    <cap-sheet-stack v-if="usecase.child" :id="stackIdFor(index)">
      <cap-sheet
        v-for="entry in sheetEntries(usecase, index)"
        :id="entry.renderId"
        :key="entry.renderId"
        :ref="sheetRefFor(entry)"
        data-demo-sheet=""
        :data-demo-placement="entry.usecase.placement"
        :data-demo-detents="detentsAttribute(entry.usecase) || ''"
        :data-demo-usecase="entry.usecase.slug"
        :content-placement="resolvedPlacement(entry.usecase)"
        :detents="detentsAttribute(entry.usecase)"
        :stack="entry.stackId"
        v-bind="booleanAttributes(entry.usecase.options)"
      >
        <cap-sheet-portal>
          <cap-sheet-view :content-placement="resolvedPlacement(entry.usecase)">
            <cap-sheet-backdrop v-if="entry.usecase.backdrop !== false"></cap-sheet-backdrop>
            <cap-sheet-content :class="sheetClass(entry.usecase)">
              <cap-sheet-bleeding-background
                v-if="shouldRenderBleedingBackground(entry.usecase)"
              ></cap-sheet-bleeding-background>
              <cap-sheet-handle v-if="hasHandle(entry.usecase)"></cap-sheet-handle>
              <SheetBody :usecase="entry.usecase" :index="entry.index" :child="entry.child" />
            </cap-sheet-content>
          </cap-sheet-view>
        </cap-sheet-portal>
      </cap-sheet>
    </cap-sheet-stack>

    <cap-sheet
      v-else
      :id="getSheetId(usecase, index)"
      :ref="sheetRefFor(sheetEntries(usecase, index)[0])"
      data-demo-sheet=""
      :data-demo-placement="usecase.placement"
      :data-demo-detents="detentsAttribute(usecase) || ''"
      :data-demo-usecase="usecase.slug"
      :content-placement="resolvedPlacement(usecase)"
      :detents="detentsAttribute(usecase)"
      v-bind="booleanAttributes(usecase.options)"
    >
      <cap-sheet-portal>
        <cap-sheet-view :content-placement="resolvedPlacement(usecase)">
          <cap-sheet-backdrop v-if="usecase.backdrop !== false"></cap-sheet-backdrop>
          <cap-sheet-content :class="sheetClass(usecase)">
            <cap-sheet-bleeding-background
              v-if="shouldRenderBleedingBackground(usecase)"
            ></cap-sheet-bleeding-background>
            <cap-sheet-handle v-if="hasHandle(usecase)"></cap-sheet-handle>
            <SheetBody :usecase="usecase" :index="index" />
          </cap-sheet-content>
        </cap-sheet-view>
      </cap-sheet-portal>
    </cap-sheet>
  </template>

  <cap-sheet-outlet :ref="travelOutletRefFor('depth')" :for="depthOutletFor" class="demo-depth-stage">
    <main class="demo-app">
      <header class="demo-hero">
        <div class="demo-hero-copy">
          <div class="demo-brand">
            <img class="demo-logo" src="/capgo-sheets-logo.svg" alt="" />
            <p class="demo-kicker">Vue playground</p>
          </div>
          <h1>Capgo Sheets usecases</h1>
          <p>Open every sheet pattern from the real preview viewport. No fake phone frame, no clipped overlay.</p>
        </div>
        <a class="demo-link" href="https://github.com/Cap-go/capacitor-sheets" target="_blank" rel="noreferrer">
          GitHub
        </a>
      </header>

      <section class="demo-grid" aria-label="Sheet usecases">
        <article v-for="(usecase, index) in usecases" :key="usecase.slug" class="demo-card">
          <cap-sheet-outlet
            v-if="usecase.outlet === 'parallax'"
            :ref="travelOutletRefFor('parallax')"
            :for="getSheetId(usecase, index)"
            class="demo-card-art demo-card-art--parallax"
          >
            <span>{{ cardLabel(usecase) }}</span>
            <i></i>
            <b></b>
          </cap-sheet-outlet>
          <div v-else class="demo-card-art">
            <span>{{ cardLabel(usecase) }}</span>
            <i></i>
            <b></b>
          </div>
          <div class="demo-card-body">
            <p class="demo-chip">{{ placementLabel(usecase.placement) }}</p>
            <h2>{{ usecase.title }}</h2>
            <p>{{ usecase.summary }}</p>
            <cap-sheet-trigger class="demo-button" :for="getSheetId(usecase, index)" action="present">
              Open demo
            </cap-sheet-trigger>
          </div>
        </article>
      </section>
    </main>
  </cap-sheet-outlet>
</template>
