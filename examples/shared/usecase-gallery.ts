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
  handle?: boolean;
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
    summary: 'A full-height story page that scrolls inside the sheet.',
    placement: 'bottom',
    detents: ['100dvh'],
    handle: false,
    sheetClass: 'demo-sheet--long',
  },
  {
    slug: 'sheet-with-detent',
    title: 'Sheet with Detent',
    summary: 'A contact picker opens at a useful intermediate stop.',
    placement: 'bottom',
    detents: ['35em'],
    sheetClass: 'demo-sheet--detents',
    options: { defaultActiveDetent: 1 },
  },
  {
    slug: 'sidebar',
    title: 'Sidebar',
    summary: 'A full-height navigation panel from the left edge.',
    placement: 'left',
    detents: ['20.25em'],
    handle: false,
    sheetClass: 'demo-sheet--side',
  },
  {
    slug: 'bottom-sheet',
    title: 'Bottom Sheet',
    summary: 'A standard native-feeling mobile bottom sheet.',
    placement: 'bottom',
    detents: ['18em', '32em'],
    sheetClass: 'demo-sheet--bottom',
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
  },
  {
    slug: 'sheet-with-stacking',
    title: 'Sheet with Stacking',
    summary: 'A second sheet stacks above the first one.',
    placement: 'bottom',
    detents: ['20em', '32em'],
    sheetClass: 'demo-sheet--stack-parent',
    options: { defaultActiveDetent: 2 },
    child: {
      slug: 'sheet-with-stacking-child',
      title: 'Stacked Details',
      summary: 'Second layer on the same stack.',
      placement: 'bottom',
      detents: ['18em', '28em'],
      sheetClass: 'demo-sheet--stacked',
      options: { defaultActiveDetent: 2 },
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
    options: { defaultActiveDetent: 2 },
  },
  {
    slug: 'parallax-page',
    title: 'Parallax Page',
    summary: 'Sheet progress drives a parallax background.',
    placement: 'bottom',
    detents: ['18em', '36em'],
    sheetClass: 'demo-sheet--parallax',
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
    summary: 'Full-screen image viewing with a dark comment sheet.',
    placement: 'center',
    handle: false,
    sheetClass: 'demo-sheet--lightbox',
    child: {
      slug: 'lightbox-comments',
      title: 'Comments',
      summary: 'Dark comment sheet over the lightbox.',
      placement: 'bottom',
      detents: ['60dvh', '100dvh'],
      handle: false,
      sheetClass: 'demo-sheet--lightbox-comments',
      options: { defaultActiveDetent: 1 },
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
          `translate3d(0, ${progress * 0.75}rem, 0) scale(${1 - progress * 0.09})`,
        filter: ({ progress }: { progress: number }) =>
          `saturate(${1 - progress * 0.18}) brightness(${1 - progress * 0.05})`,
        'border-radius': ({ progress }: { progress: number }) => `${progress * 1.5}rem`,
        'box-shadow': ({ progress }: { progress: number }) =>
          progress > 0.01 ? `0 ${progress * 1.25}rem ${progress * 3.5}rem rgb(20 23 22 / 0.2)` : 'none',
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
  const depthUsecaseIndex = usecases.findIndex((usecase) => usecase.slug === 'sheet-with-depth');
  const depthUsecase = depthUsecaseIndex >= 0 ? usecases[depthUsecaseIndex] : undefined;
  const depthOutletFor = depthUsecase ? ` for="${getSheetId(depthUsecase, depthUsecaseIndex)}"` : '';

  return `
    ${usecases.map((usecase, index) => renderSheet(usecase, index)).join('')}

    <cap-sheet-outlet${depthOutletFor} class="demo-depth-stage" data-demo-outlet="depth">
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
      </main>
    </cap-sheet-outlet>
  `;
}

function renderCard(usecase: Usecase, index: number): string {
  const id = getSheetId(usecase, index);
  const outlet =
    usecase.outlet === 'parallax'
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
  const hasHandle = usecase.handle !== false && usecase.placement !== 'center';
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
        <cap-scroll class="demo-long-story" axis="y">
          <cap-scroll-content>
            <article>
              <div class="demo-long-hero" role="img" aria-label="White country house beneath birds in a golden field">
                <cap-sheet-trigger class="demo-long-close" action="dismiss" aria-label="Close story">&#215;</cap-sheet-trigger>
                <span class="demo-long-house" aria-hidden="true"></span>
              </div>
              <div class="demo-long-copy">
                <cap-sheet-title>Beneath the Golden Sky:<br />A House in the Fields</cap-sheet-title>
                <cap-sheet-description>Where the Winds Carry Forgotten Stories</cap-sheet-description>
                <p class="demo-long-byline">by Elara Whitmore</p>
                <p>
                  In the heart of the vast, golden fields, where the sky met the earth in a tender embrace, stood a quiet
                  house that seemed to remember every season.
                </p>
                <p>
                  Its windows held the late light, its porch faced the moving wheat, and every evening the birds drew soft
                  lines across the pale blue air.
                </p>
                <p>
                  Travelers passed it slowly, as if the road itself asked them to look twice before returning to the noise
                  beyond the fields.
                </p>
              </div>
            </article>
          </cap-scroll-content>
        </cap-scroll>
      `;
    case 'sheet-with-detent':
      return `
        <div class="demo-contact-picker">
          <label class="demo-contact-search">
            <span>Search contacts</span>
            <input type="search" placeholder="Search for a contact" />
          </label>
          <cap-scroll class="demo-contact-list" axis="y">
            <cap-scroll-content>
              ${renderContacts()}
            </cap-scroll-content>
          </cap-scroll>
        </div>
      `;
    case 'detached-sheet':
      return `
        <div class="demo-meal-card">
          <div class="demo-meal-image" role="img" aria-label="Meal ingredients arranged on a table"></div>
          <cap-sheet-title>Your Meal is Coming</cap-sheet-title>
          <cap-sheet-description>
            Your food is on its way and will arrive soon! Sit back and get ready to enjoy your meal.
          </cap-sheet-description>
          <cap-sheet-trigger class="demo-button demo-meal-button" action="dismiss">Got it</cap-sheet-trigger>
        </div>
      `;
    case 'sidebar':
      return `
        <cap-scroll class="demo-sidebar" axis="y">
          <cap-scroll-content>
            <div class="demo-sidebar-account">
              <span class="demo-sidebar-logo" aria-hidden="true"></span>
              <span>
                <strong>Acme Inc.</strong>
                <small>support@acme.com</small>
              </span>
            </div>
            ${renderSidebarGroup('Dashboard', [
              ['overview', 'Overview'],
              ['analytics', 'Analytics'],
              ['activity', 'Recent Activity'],
            ])}
            ${renderSidebarGroup('Projects', [
              ['projects', 'All Projects'],
              ['home', 'My Projects'],
              ['archive', 'Archived Projects'],
              ['create', 'Create New Project'],
            ])}
            ${renderSidebarGroup('Teams', [
              ['team', 'Team Members'],
              ['shield', 'Roles & Permissions'],
              ['invite', 'Invite Members'],
              ['settings', 'Team Settings'],
            ])}
            ${renderSidebarGroup('Settings', [
              ['account', 'Account Settings'],
              ['profile', 'Profile Settings'],
              ['billing', 'Billing Information'],
              ['integrations', 'Integrations'],
              ['notifications', 'Notifications'],
            ])}
          </cap-scroll-content>
        </cap-scroll>
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
          <div class="demo-toast-copy">
            <strong>Update ready</strong>
            <p>Outside content remains interactive.</p>
          </div>
          ${close}
        </div>
      `;
    case 'top-sheet':
      return `
        <div class="demo-top-sheet">
          <div class="demo-top-head">
            <cap-sheet-trigger class="demo-icon-button" action="dismiss" aria-label="Close top sheet">&#215;</cap-sheet-trigger>
          </div>
          <div class="demo-top-copy">
            <cap-sheet-title>Terrace Loft is Available</cap-sheet-title>
            <div class="demo-top-visual" role="img" aria-label="Modern terrace home with blue sky"></div>
            <cap-sheet-description>
              A bright two-bedroom stay with skyline views, warm interiors, and a private garden terrace.
            </cap-sheet-description>
            <cap-sheet-trigger class="demo-button demo-top-primary" action="dismiss">Book it now</cap-sheet-trigger>
          </div>
        </div>
      `;
    case 'sheet-with-depth':
      return `
        <div class="demo-depth-profile">
          <div class="demo-depth-cover" role="img" aria-label="Mountain lake at sunrise"></div>
          <div class="demo-depth-avatar" aria-hidden="true"></div>
          <cap-sheet-title>Maya Chen</cap-sheet-title>
          <cap-sheet-description>
            Product designer, weekend climber, and host of quiet cabins across the alpine coast.
          </cap-sheet-description>
          <div class="demo-depth-stats" aria-label="Profile stats">
            <span><strong>42</strong><small>stays</small></span>
            <span><strong>4.9</strong><small>rating</small></span>
            <span><strong>18k</strong><small>views</small></span>
          </div>
          <div class="demo-actions demo-actions--compact">
            <cap-sheet-trigger class="demo-button" action="dismiss">Follow</cap-sheet-trigger>
            ${close}
          </div>
          <div class="demo-depth-list">
            <article>
              <span>Latest guide</span>
              <strong>Three ridge walks above Lake Annecy</strong>
            </article>
            <article>
              <span>Open weekend</span>
              <strong>Cabin No. 7 has two nights free</strong>
            </article>
          </div>
        </div>
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
        <div class="demo-lightbox">
          <cap-sheet-trigger class="demo-lightbox-close" action="dismiss" aria-label="Close lightbox"></cap-sheet-trigger>
          <div class="demo-lightbox-photo" role="img" aria-label="Santorini coast with white buildings and blue sea"></div>
          <cap-sheet-trigger class="demo-lightbox-comments-trigger" for="${childId}" action="present">Comments</cap-sheet-trigger>
        </div>
      `;
    case 'lightbox-comments':
      return `
        <div class="demo-lightbox-comments">
          <div class="demo-lightbox-comments-head">
            <cap-sheet-trigger class="demo-lightbox-comments-close" action="dismiss" aria-label="Close comments"></cap-sheet-trigger>
            <cap-sheet-title>Comments</cap-sheet-title>
          </div>
          <div class="demo-lightbox-comments-list">
            <article class="demo-lightbox-comment">
              <span class="demo-lightbox-avatar demo-lightbox-avatar--one" aria-hidden="true"></span>
              <div class="demo-lightbox-comment-bubble">
                <strong>Emma Schmidt</strong>
                <p>The view is absolutely breathtaking. The city and sea feel perfectly balanced.</p>
              </div>
            </article>
            <article class="demo-lightbox-comment">
              <span class="demo-lightbox-avatar demo-lightbox-avatar--two" aria-hidden="true"></span>
              <div class="demo-lightbox-comment-bubble">
                <strong>Liam Muller</strong>
                <p>That waterline is unreal. I would frame this shot.</p>
              </div>
            </article>
            <article class="demo-lightbox-comment">
              <span class="demo-lightbox-avatar demo-lightbox-avatar--three" aria-hidden="true"></span>
              <div class="demo-lightbox-comment-bubble">
                <strong>Olivia Dupont</strong>
                <p>The hillside, the bright sky, and the white rooftops make the whole scene feel calm.</p>
              </div>
            </article>
            <article class="demo-lightbox-comment">
              <span class="demo-lightbox-avatar demo-lightbox-avatar--four" aria-hidden="true"></span>
              <div class="demo-lightbox-comment-bubble">
                <strong>Noah Garcia</strong>
                <p>The contrast between the village and open water is excellent.</p>
              </div>
            </article>
            <article class="demo-lightbox-comment">
              <span class="demo-lightbox-avatar demo-lightbox-avatar--five" aria-hidden="true"></span>
              <div class="demo-lightbox-comment-bubble">
                <strong>Ava Rossi</strong>
                <p>This makes me want to head straight to the coast. The composition feels inviting.</p>
              </div>
            </article>
          </div>
        </div>
      `;
    case 'card':
      return `
        <div class="demo-event-card">
          <cap-sheet-trigger class="demo-icon-button demo-event-card-close" action="dismiss" aria-label="Close card">&#215;</cap-sheet-trigger>
          <div class="demo-event-art" role="img" aria-label="Paint brushes on a workshop table"></div>
          <div class="demo-event-copy">
            <cap-sheet-title>Paint and Sip</cap-sheet-title>
            <cap-sheet-description>
              Join a relaxed studio night with color, music, and a glass of something bright.
            </cap-sheet-description>
            <cap-sheet-trigger class="demo-button demo-event-primary" action="dismiss">Reserve spot</cap-sheet-trigger>
          </div>
        </div>
      `;
    case 'persistent-sheet-with-detent':
      return `
        <div class="demo-player">
          <div class="demo-player-mini">
            <cap-sheet-trigger class="demo-player-mini-main" action="step" detent="2" aria-label="Expand player">
              <span class="demo-player-mini-art" aria-hidden="true"></span>
              <span>
                <strong>Barcelona Dreams</strong>
                <small>Eira Voss</small>
              </span>
            </cap-sheet-trigger>
            <cap-sheet-trigger class="demo-icon-button" action="dismiss" aria-label="Close player">&#215;</cap-sheet-trigger>
          </div>
          <div class="demo-player-expanded">
            <div class="demo-player-art" role="img" aria-label="Barcelona Dreams album cover"></div>
            <div class="demo-player-copy">
              <cap-sheet-title>Barcelona Dreams</cap-sheet-title>
              <cap-sheet-description>Eira Voss</cap-sheet-description>
            </div>
            <input class="demo-player-range" type="range" min="0" max="1000" value="700" aria-label="Track progress" />
            <div class="demo-player-controls" aria-label="Playback controls">
              <button type="button" aria-label="Previous track">Back</button>
              <button type="button" aria-label="Play track">Play</button>
              <button type="button" aria-label="Next track">Next</button>
            </div>
          </div>
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

function renderContacts(): string {
  return [
    ['one', 'Emma Schmidt', 'Blue Horizon'],
    ['two', 'Liam Muller', 'Evergreen Solutions'],
    ['three', 'Olivia Dupont', 'Nova Ventures'],
    ['four', 'Noah Garcia', 'Bridges Collective'],
    ['five', 'Ava Rossi', 'Vivid Ideas'],
    ['six', 'Sophia Ivanova', 'Rise Solutions'],
    ['seven', 'Mia Laurent', 'Northline Studio'],
    ['eight', 'Leo Park', 'Atlas Workshop'],
  ]
    .map(
      ([tone, name, company]) => `
        <article class="demo-contact-row">
          <span class="demo-contact-avatar demo-contact-avatar--${tone}" aria-hidden="true"></span>
          <span class="demo-contact-copy">
            <strong>${name}</strong>
            <small>${company}</small>
          </span>
        </article>
      `,
    )
    .join('');
}

function renderSidebarGroup(title: string, items: [string, string][]): string {
  return `
    <section class="demo-sidebar-group">
      <h3>${escapeHtml(title)}</h3>
      <ul>
        ${items
          .map(
            ([icon, label]) => `
              <li>
                <span class="demo-sidebar-item-icon demo-sidebar-item-icon--${icon}" aria-hidden="true"></span>
                <span>${escapeHtml(label)}</span>
              </li>
            `,
          )
          .join('')}
      </ul>
    </section>
  `;
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
