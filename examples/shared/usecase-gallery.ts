import type {
  SheetActiveDetentChangeEvent,
  SheetOptions as CapSheetOptions,
  SheetTravelEvent,
} from '@capgo/capacitor-sheets';

type SheetPlacement = 'top' | 'bottom' | 'left' | 'right' | 'center';
type SheetOptions = Partial<CapSheetOptions> & {
  onPresentedChange?: (event: { presented: boolean; source: string }) => void;
  onActiveDetentChange?: (event: SheetActiveDetentChangeEvent) => void;
  onTravel?: (event: SheetTravelEvent) => void;
};
type SetupSheet = (element: HTMLElement, options?: SheetOptions) => () => void;
type FrameworkName = 'Angular' | 'React' | 'Solid' | 'Svelte' | 'Vue';

interface Usecase {
  slug: string;
  title: string;
  summary: string;
  placement: SheetPlacement;
  detents?: string[];
  sheetClass?: string;
  backdrop?: boolean;
  options?: SheetOptions;
  outlet?: 'depth' | 'parallax';
  child?: Usecase;
}

const usecases: Usecase[] = [
  {
    slug: 'long-sheet',
    title: 'Long Sheet',
    summary: 'Tall scrollable content inside a mobile sheet.',
    placement: 'bottom',
    detents: ['20em', '42em'],
    sheetClass: 'demo-sheet--long',
  },
  {
    slug: 'sheet-with-detent',
    title: 'Sheet with Detent',
    summary: 'Peek, mid, and expanded resting points.',
    placement: 'bottom',
    detents: ['12em', '24em', '40em'],
  },
  {
    slug: 'sidebar',
    title: 'Sidebar',
    summary: 'The same primitive enters from the left edge.',
    placement: 'left',
    detents: ['24em'],
    sheetClass: 'demo-sheet--side',
  },
  {
    slug: 'bottom-sheet',
    title: 'Bottom Sheet',
    summary: 'A standard native-feeling mobile bottom sheet.',
    placement: 'bottom',
    detents: ['18em', '32em'],
  },
  {
    slug: 'sheet-with-keyboard',
    title: 'Sheet with Keyboard',
    summary: 'Focused inputs stay above the visual viewport.',
    placement: 'bottom',
    detents: ['24em', '38em'],
    sheetClass: 'demo-sheet--form',
    options: { nativeFocusScrollPrevention: true },
  },
  {
    slug: 'toast',
    title: 'Toast',
    summary: 'Non-blocking notification built from a sheet.',
    placement: 'bottom',
    detents: ['8em'],
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
    summary: 'A floating bottom surface with margins.',
    placement: 'bottom',
    detents: ['18em', '30em'],
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
    summary: 'Travel and dismiss from the top edge.',
    placement: 'top',
    detents: ['14em'],
    sheetClass: 'demo-sheet--top',
  },
  {
    slug: 'sheet-with-stacking',
    title: 'Sheet with Stacking',
    summary: 'A second sheet stacks above the first one.',
    placement: 'bottom',
    detents: ['20em', '32em'],
    child: {
      slug: 'sheet-with-stacking-child',
      title: 'Stacked Details',
      summary: 'Second layer on the same stack.',
      placement: 'bottom',
      detents: ['18em', '28em'],
      sheetClass: 'demo-sheet--stacked',
    },
  },
  {
    slug: 'sheet-with-depth',
    title: 'Sheet with Depth',
    summary: 'Sheet progress scales the page behind it.',
    placement: 'bottom',
    detents: ['20em', '34em'],
    outlet: 'depth',
  },
  {
    slug: 'parallax-page',
    title: 'Parallax Page',
    summary: 'Sheet progress drives a parallax background.',
    placement: 'bottom',
    detents: ['18em', '36em'],
    outlet: 'parallax',
  },
  {
    slug: 'page',
    title: 'Page',
    summary: 'Route-like page overlay from the right edge.',
    placement: 'right',
    detents: ['100dvw'],
    sheetClass: 'demo-sheet--page demo-sheet--right-page',
  },
  {
    slug: 'lightbox',
    title: 'Lightbox',
    summary: 'Centered media overlay with backdrop.',
    placement: 'center',
    sheetClass: 'demo-sheet--lightbox',
  },
  {
    slug: 'persistent-sheet-with-detent',
    title: 'Persistent Sheet with Detent',
    summary: 'Background remains interactive while open.',
    placement: 'bottom',
    detents: ['10em', '24em'],
    sheetClass: 'demo-sheet--persistent',
    options: {
      inertOutside: false,
      closeOnOutsideClick: false,
      focusTrap: false,
      swipeDismissal: false,
    },
  },
  {
    slug: 'card',
    title: 'Card',
    summary: 'Compact centered surface for decisions.',
    placement: 'center',
    sheetClass: 'demo-sheet--card',
  },
];

export function mountUsecaseGallery(
  host: HTMLElement,
  options: { framework: FrameworkName; setupSheet: SetupSheet },
): () => void {
  host.innerHTML = renderGallery(options.framework);

  const cleanups: (() => void)[] = [];
  for (const sheet of Array.from(host.querySelectorAll<HTMLElement>('cap-sheet[data-demo-sheet]'))) {
    cleanups.push(options.setupSheet(sheet, getSheetOptions(sheet)));
  }

  for (const outlet of Array.from(host.querySelectorAll<HTMLElement>('[data-demo-outlet="depth"]'))) {
    Object.assign(outlet, {
      travelAnimation: {
        transform: ({ progress }: { progress: number }) =>
          `scale(${1 - progress * 0.07}) translateY(${-progress * 0.75}em)`,
        filter: ({ progress }: { progress: number }) => `saturate(${1 - progress * 0.18})`,
      },
    });
  }

  for (const outlet of Array.from(host.querySelectorAll<HTMLElement>('[data-demo-outlet="parallax"]'))) {
    Object.assign(outlet, {
      travelAnimation: {
        '--demo-parallax-progress': ({ progress }: { progress: number }) => String(progress),
      },
    });
  }

  return () => {
    for (const cleanup of cleanups) cleanup();
    host.innerHTML = '';
  };
}

function renderGallery(framework: FrameworkName): string {
  return `
    <main class="demo-app">
      <header class="demo-hero">
        <div>
          <p class="demo-kicker">${framework} playground</p>
          <h1>Capgo Sheets usecases</h1>
          <p>Open every sheet pattern from the real preview viewport. No fake phone frame, no clipped overlay.</p>
        </div>
        <a class="demo-link" href="https://github.com/Cap-go/capacitor-sheets" target="_blank" rel="noreferrer">GitHub</a>
      </header>

      <section class="demo-grid" aria-label="Sheet usecases">
        ${usecases.map((usecase, index) => renderCard(usecase, index)).join('')}
      </section>

      ${usecases.map((usecase, index) => renderSheet(usecase, index)).join('')}
    </main>
  `;
}

function renderCard(usecase: Usecase, index: number): string {
  const id = getSheetId(usecase, index);
  const outlet = usecase.outlet
    ? `<cap-sheet-outlet for="${id}" class="demo-card-art demo-card-art--${usecase.outlet}" data-demo-outlet="${usecase.outlet}">
        ${renderArt(usecase)}
      </cap-sheet-outlet>`
    : `<div class="demo-card-art">${renderArt(usecase)}</div>`;

  return `
    <article class="demo-card">
      ${outlet}
      <div class="demo-card-body">
        <p class="demo-chip">${placementLabel(usecase.placement)}</p>
        <h2>${escapeHtml(usecase.title)}</h2>
        <p>${escapeHtml(usecase.summary)}</p>
        <cap-sheet-trigger class="demo-button" for="${id}" action="present">Open demo</cap-sheet-trigger>
      </div>
    </article>
  `;
}

function renderSheet(usecase: Usecase, index: number): string {
  if (!usecase.child) return renderSingleSheet(usecase, index);

  const stackId = `demo-stack-${index}`;
  return `
    <cap-sheet-stack id="${stackId}">
      ${renderSingleSheet(usecase, index, stackId)}
      ${renderSingleSheet(usecase.child, index, stackId, true)}
    </cap-sheet-stack>
  `;
}

function renderSingleSheet(usecase: Usecase, index: number, stackId?: string, child = false): string {
  const id = child ? `${getSheetId(usecase, index)}-child` : getSheetId(usecase, index);
  const detents = usecase.detents?.join(' ') || '';
  const hasHandle = usecase.placement !== 'center';
  const stackAttr = stackId ? ` stack="${stackId}"` : '';
  const detentAttr = detents ? ` detents="${escapeHtml(detents)}"` : '';
  const backdrop = usecase.backdrop === false ? '' : '<cap-sheet-backdrop></cap-sheet-backdrop>';
  const classes = ['demo-sheet-content', usecase.sheetClass].filter(Boolean).join(' ');

  return `
    <cap-sheet
      id="${id}"
      data-demo-sheet
      data-demo-placement="${usecase.placement}"
      data-demo-detents="${escapeHtml(detents)}"
      data-demo-usecase="${usecase.slug}"
      content-placement="${usecase.placement}"
      ${detentAttr}
      ${stackAttr}
      ${renderBooleanAttributes(usecase.options)}
    >
      <cap-sheet-portal>
        <cap-sheet-view>
          ${backdrop}
          <cap-sheet-content class="${classes}">
            <cap-sheet-bleeding-background></cap-sheet-bleeding-background>
            ${hasHandle ? '<cap-sheet-handle></cap-sheet-handle>' : ''}
            ${renderSheetBody(usecase, index, child)}
          </cap-sheet-content>
        </cap-sheet-view>
      </cap-sheet-portal>
    </cap-sheet>
  `;
}

function renderSheetBody(usecase: Usecase, index: number, child: boolean): string {
  const childId = usecase.child ? `${getSheetId(usecase.child, index)}-child` : '';
  const title = `<cap-sheet-title>${escapeHtml(usecase.title)}</cap-sheet-title>`;
  const description = `<cap-sheet-description>${escapeHtml(usecase.summary)}</cap-sheet-description>`;
  const close = '<cap-sheet-trigger class="demo-button demo-button--quiet" action="dismiss">Close</cap-sheet-trigger>';

  switch (usecase.slug) {
    case 'long-sheet':
      return `
        ${title}
        ${description}
        <cap-scroll class="demo-scroll" axis="y">
          <cap-scroll-content>
            ${Array.from({ length: 12 }, (_, item) => `<p class="demo-row">Route checkpoint ${item + 1}</p>`).join('')}
          </cap-scroll-content>
        </cap-scroll>
        ${close}
      `;
    case 'sheet-with-detent':
      return `
        ${title}
        ${description}
        <div class="demo-actions">
          <cap-sheet-trigger class="demo-button demo-button--quiet" action="step" detent="1">Peek</cap-sheet-trigger>
          <cap-sheet-trigger class="demo-button demo-button--quiet" action="step" detent="2">Mid</cap-sheet-trigger>
          <cap-sheet-trigger class="demo-button demo-button--quiet" action="step" detent="3">Full</cap-sheet-trigger>
          ${close}
        </div>
      `;
    case 'sheet-with-keyboard':
      return `
        ${title}
        ${description}
        <label class="demo-field">
          <span>Destination</span>
          <input placeholder="Type while the keyboard is open" />
        </label>
        <label class="demo-field">
          <span>Notes</span>
          <textarea rows="3" placeholder="The sheet follows visualViewport changes"></textarea>
        </label>
        ${close}
      `;
    case 'toast':
      return `
        <div class="demo-toast-row">
          <strong>Update ready</strong>
          ${close}
        </div>
        <p>Outside content remains interactive.</p>
      `;
    case 'page-from-bottom':
    case 'page':
      return `
        <div class="demo-page-head">
          <span>${escapeHtml(usecase.title)}</span>
          ${close}
        </div>
        <div class="demo-page-layout">
          <p>${escapeHtml(usecase.summary)}</p>
          <button type="button">Primary action</button>
          <button type="button">Secondary action</button>
        </div>
      `;
    case 'sheet-with-stacking':
      return `
        ${title}
        ${description}
        <p class="demo-row">This first layer stays below the next sheet.</p>
        <div class="demo-actions">
          <cap-sheet-trigger class="demo-button" for="${childId}" action="present">Open stacked sheet</cap-sheet-trigger>
          ${close}
        </div>
      `;
    case 'sheet-with-stacking-child':
      return `
        ${title}
        ${description}
        <p class="demo-row">Stack depth is handled by cap-sheet-stack.</p>
        ${close}
      `;
    case 'lightbox':
      return `
        <div class="demo-lightbox-media">01</div>
        ${title}
        ${description}
        ${close}
      `;
    case 'card':
      return `
        ${title}
        ${description}
        <div class="demo-actions">
          <cap-sheet-trigger class="demo-button" action="dismiss">Accept</cap-sheet-trigger>
          ${close}
        </div>
      `;
    case 'persistent-sheet-with-detent':
      return `
        ${title}
        ${description}
        <p class="demo-row">Tap cards behind this sheet while it is open.</p>
        <div class="demo-actions">
          <cap-sheet-trigger class="demo-button demo-button--quiet" action="step" detent="1">Compact</cap-sheet-trigger>
          <cap-sheet-trigger class="demo-button demo-button--quiet" action="step" detent="2">Expanded</cap-sheet-trigger>
          ${close}
        </div>
      `;
    default:
      return `
        ${child ? '' : title}
        ${child ? '' : description}
        <div class="demo-mini-list">
          <span>Safe area aware</span>
          <span>Gesture driven</span>
          <span>Framework neutral</span>
        </div>
        ${close}
      `;
  }
}

function getSheetOptions(sheet: HTMLElement): SheetOptions {
  const slug = sheet.dataset.demoUsecase || '';
  const usecase = findUsecase(slug);
  const detents = sheet.dataset.demoDetents?.trim();

  return {
    ...(usecase?.options || {}),
    contentPlacement: (sheet.dataset.demoPlacement as SheetPlacement | undefined) || usecase?.placement || 'bottom',
    detents: detents ? detents.split(/\s+/) : usecase?.detents,
    onTravel: ({ progress }) => {
      sheet.style.setProperty('--demo-sheet-progress', progress.toFixed(3));
    },
  };
}

function findUsecase(slug: string): Usecase | undefined {
  for (const usecase of usecases) {
    if (usecase.slug === slug) return usecase;
    if (usecase.child?.slug === slug) return usecase.child;
  }
  return undefined;
}

function getSheetId(usecase: Usecase, index: number): string {
  return `demo-${index}-${usecase.slug}`;
}

function renderArt(usecase: Usecase): string {
  const label = usecase.title
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 3)
    .toUpperCase();

  return `
    <span>${escapeHtml(label)}</span>
    <i></i>
    <b></b>
  `;
}

function placementLabel(placement: SheetPlacement): string {
  if (placement === 'center') return 'center';
  return `${placement} edge`;
}

function renderBooleanAttributes(options?: SheetOptions): string {
  if (!options) return '';

  return [
    ['swipe-dismissal', options.swipeDismissal],
    ['inert-outside', options.inertOutside],
    ['close-on-outside-click', options.closeOnOutsideClick],
    ['close-on-escape', options.closeOnEscape],
    ['focus-trap', options.focusTrap],
    ['restore-focus', options.restoreFocus],
    ['native-focus-scroll-prevention', options.nativeFocusScrollPrevention],
  ]
    .filter(([, value]) => typeof value === 'boolean')
    .map(([name, value]) => `${name}="${String(value)}"`)
    .join(' ');
}

function escapeHtml(value: string): string {
  return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
}
