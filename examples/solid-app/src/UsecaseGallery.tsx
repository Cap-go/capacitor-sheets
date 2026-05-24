import { setupSheet } from '@capgo/capacitor-sheets/solid';
import type {
  SheetActiveDetentChangeEvent,
  SheetOptions as CapSheetOptions,
  SheetTravelEvent,
} from '@capgo/capacitor-sheets';
import { createEffect, createSignal, For, onCleanup, onMount } from 'solid-js';
import type { JSX } from 'solid-js';

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

const DETACHED_CENTER_QUERY = '(min-width: 43.75rem)';

const usecases: Usecase[] = [
  {
    slug: 'long-sheet',
    title: 'Long Sheet',
    summary: 'A full-height story page that scrolls inside the sheet.',
    placement: 'bottom',
    detents: ['100dvh'],
    sheetClass: 'demo-sheet--long',
    options: { safeArea: 'none' },
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
    options: { nativeFocusScrollPrevention: true, safeArea: 'none' },
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
    options: { safeArea: 'none' },
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
    sheetClass: 'demo-sheet--page demo-sheet--right-page',
    options: { safeArea: 'none' },
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
      safeArea: 'none',
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

const contacts = [
  ['one', 'Emma Schmidt', 'Blue Horizon'],
  ['two', 'Liam Muller', 'Evergreen Solutions'],
  ['three', 'Olivia Dupont', 'Nova Ventures'],
  ['four', 'Noah Garcia', 'Bridges Collective'],
  ['five', 'Ava Rossi', 'Vivid Ideas'],
  ['six', 'Sophia Ivanova', 'Rise Solutions'],
  ['seven', 'Mia Laurent', 'Northline Studio'],
  ['eight', 'Leo Park', 'Atlas Workshop'],
];

const sidebarGroups: [string, [string, string][]][] = [
  [
    'Dashboard',
    [
      ['overview', 'Overview'],
      ['analytics', 'Analytics'],
      ['activity', 'Recent Activity'],
    ],
  ],
  [
    'Projects',
    [
      ['projects', 'All Projects'],
      ['home', 'My Projects'],
      ['archive', 'Archived Projects'],
      ['create', 'Create New Project'],
    ],
  ],
  [
    'Teams',
    [
      ['team', 'Team Members'],
      ['shield', 'Roles & Permissions'],
      ['invite', 'Invite Members'],
      ['settings', 'Team Settings'],
    ],
  ],
  [
    'Settings',
    [
      ['account', 'Account Settings'],
      ['profile', 'Profile Settings'],
      ['billing', 'Billing Information'],
      ['integrations', 'Integrations'],
      ['notifications', 'Notifications'],
    ],
  ],
];

export function UsecaseGallery() {
  const depthUsecaseIndex = usecases.findIndex((usecase) => usecase.slug === 'sheet-with-depth');
  const depthUsecase = depthUsecaseIndex >= 0 ? usecases[depthUsecaseIndex] : undefined;
  const depthOutletFor = depthUsecase ? getSheetId(depthUsecase, depthUsecaseIndex) : undefined;

  return (
    <>
      <For each={usecases}>{(usecase, index) => <SheetTree usecase={usecase} index={index()} />}</For>

      <TravelOutlet for={depthOutletFor} class="demo-depth-stage" type="depth">
        <main class="demo-app">
          <header class="demo-hero">
            <div>
              <p class="demo-kicker">Solid playground</p>
              <h1>Capgo Sheets usecases</h1>
              <p>Open every sheet pattern from the real preview viewport. No fake phone frame, no clipped overlay.</p>
            </div>
            <a class="demo-link" href="https://github.com/Cap-go/capacitor-sheets" target="_blank" rel="noreferrer">
              GitHub
            </a>
          </header>

          <section class="demo-grid" aria-label="Sheet usecases">
            <For each={usecases}>{(usecase, index) => <UsecaseCard usecase={usecase} index={index()} />}</For>
          </section>
        </main>
      </TravelOutlet>
    </>
  );
}

function SheetTree(props: { usecase: Usecase; index: number }) {
  if (!props.usecase.child) return <DemoSheet usecase={props.usecase} index={props.index} />;

  const stackId = `demo-stack-${props.index}`;
  return (
    <cap-sheet-stack id={stackId}>
      <DemoSheet usecase={props.usecase} index={props.index} stackId={stackId} />
      <DemoSheet usecase={props.usecase.child} index={props.index} stackId={stackId} child />
    </cap-sheet-stack>
  );
}

function DemoSheet(props: { usecase: Usecase; index: number; stackId?: string; child?: boolean }) {
  let sheet!: HTMLElement;
  let cleanup: (() => void) | undefined;
  const [placement, setPlacement] = createSignal<SheetPlacement>(getResponsivePlacement(props.usecase));
  const id = getSheetRenderId(props.usecase, props.index, props.child === true);
  const detents = props.usecase.detents?.join(' ') || undefined;
  const hasHandle = props.usecase.handle !== false && props.usecase.placement !== 'center';
  const hasBleedingBackground = shouldRenderBleedingBackground(props.usecase);
  const booleanAttributes = renderBooleanAttributes(props.usecase.options);

  onMount(() => {
    if (props.usecase.slug !== 'detached-sheet') return;

    const query = window.matchMedia(DETACHED_CENTER_QUERY);
    const sync = () => setPlacement(query.matches ? 'center' : props.usecase.placement);
    sync();
    query.addEventListener('change', sync);
    onCleanup(() => query.removeEventListener('change', sync));
  });

  createEffect(() => {
    const currentPlacement = placement();
    if (!sheet) return;

    cleanup?.();
    cleanup = setupSheet(sheet, {
      ...(props.usecase.options || {}),
      contentPlacement: currentPlacement,
      detents: props.usecase.detents,
      onTravel: ({ progress }) => sheet.style.setProperty('--demo-sheet-progress', progress.toFixed(3)),
    });
  });

  onCleanup(() => cleanup?.());

  return (
    <cap-sheet
      ref={(element) => {
        sheet = element as HTMLElement;
      }}
      id={id}
      data-demo-sheet=""
      data-demo-placement={props.usecase.placement}
      data-demo-detents={detents || ''}
      data-demo-usecase={props.usecase.slug}
      content-placement={placement()}
      detents={detents}
      stack={props.stackId}
      {...booleanAttributes}
    >
      <cap-sheet-portal>
        <cap-sheet-view content-placement={placement()}>
          {props.usecase.backdrop === false ? null : <cap-sheet-backdrop />}
          <cap-sheet-content class={['demo-sheet-content', props.usecase.sheetClass].filter(Boolean).join(' ')}>
            {hasBleedingBackground ? <cap-sheet-bleeding-background /> : null}
            {hasHandle ? <cap-sheet-handle /> : null}
            <SheetBody usecase={props.usecase} index={props.index} child={props.child === true} />
          </cap-sheet-content>
        </cap-sheet-view>
      </cap-sheet-portal>
    </cap-sheet>
  );
}

function UsecaseCard(props: { usecase: Usecase; index: number }) {
  const id = getSheetId(props.usecase, props.index);
  const art = <CardArt usecase={props.usecase} />;

  return (
    <article class="demo-card">
      {props.usecase.outlet === 'parallax' ? (
        <TravelOutlet for={id} class="demo-card-art demo-card-art--parallax" type="parallax">
          {art}
        </TravelOutlet>
      ) : (
        <div class="demo-card-art">{art}</div>
      )}
      <div class="demo-card-body">
        <p class="demo-chip">{placementLabel(props.usecase.placement)}</p>
        <h2>{props.usecase.title}</h2>
        <p>{props.usecase.summary}</p>
        <cap-sheet-trigger class="demo-button" for={id} action="present">
          Open demo
        </cap-sheet-trigger>
      </div>
    </article>
  );
}

function TravelOutlet(props: { children: JSX.Element; class: string; for?: string; type: 'depth' | 'parallax' }) {
  let outlet!: HTMLElement & { travelAnimation?: Record<string, unknown> };

  onMount(() => {
    outlet.travelAnimation =
      props.type === 'depth'
        ? {
            transform: ({ progress }: { progress: number }) =>
              `translate3d(0, ${progress * 1.25}rem, 0) scale(${1 - progress * 0.14})`,
            filter: ({ progress }: { progress: number }) =>
              `saturate(${1 - progress * 0.32}) brightness(${1 - progress * 0.1})`,
            'border-radius': ({ progress }: { progress: number }) => `${progress * 2}rem`,
            'box-shadow': ({ progress }: { progress: number }) =>
              progress > 0.01 ? `0 ${progress * 1.75}rem ${progress * 5}rem rgb(20 23 22 / 0.24)` : 'none',
          }
        : { '--demo-parallax-progress': ({ progress }: { progress: number }) => String(progress) };
  });

  return (
    <cap-sheet-outlet
      ref={(element) => {
        outlet = element as HTMLElement & { travelAnimation?: Record<string, unknown> };
      }}
      for={props.for}
      class={props.class}
    >
      {props.children}
    </cap-sheet-outlet>
  );
}

function SheetBody(props: { usecase: Usecase; index: number; child: boolean }) {
  const childId = props.usecase.child ? `${getSheetId(props.usecase.child, props.index)}-child` : '';
  const title = <cap-sheet-title>{props.usecase.title}</cap-sheet-title>;
  const description = <cap-sheet-description>{props.usecase.summary}</cap-sheet-description>;
  const close = (
    <cap-sheet-trigger class="demo-button demo-button--quiet" action="dismiss">
      Close
    </cap-sheet-trigger>
  );

  switch (props.usecase.slug) {
    case 'long-sheet':
      return <LongSheetStory />;
    case 'sheet-with-detent':
      return <ContactPicker />;
    case 'detached-sheet':
      return <MealCard />;
    case 'sidebar':
      return <SidebarContent />;
    case 'sheet-with-keyboard':
      return (
        <>
          {title}
          {description}
          <label class="demo-field">
            <span>Destination</span>
            <input placeholder="Type while the keyboard is open" />
          </label>
          <label class="demo-field">
            <span>Notes</span>
            <textarea rows={3} placeholder="The sheet follows visualViewport changes" />
          </label>
          {close}
        </>
      );
    case 'toast':
      return (
        <div class="demo-toast-row">
          <div class="demo-toast-copy">
            <strong>Update ready</strong>
            <p>Outside content remains interactive.</p>
          </div>
          {close}
        </div>
      );
    case 'top-sheet':
      return <TopSheetContent />;
    case 'sheet-with-depth':
      return <DepthProfile close={close} />;
    case 'page-from-bottom':
    case 'page':
      return <PageContent usecase={props.usecase} close={close} />;
    case 'sheet-with-stacking':
      return (
        <>
          {title}
          {description}
          <p class="demo-row">This first layer stays below the next sheet.</p>
          <div class="demo-actions">
            <cap-sheet-trigger class="demo-button" for={childId} action="present">
              Open stacked sheet
            </cap-sheet-trigger>
            {close}
          </div>
        </>
      );
    case 'sheet-with-stacking-child':
      return (
        <>
          {title}
          {description}
          <p class="demo-row">Stack depth is handled by cap-sheet-stack.</p>
          {close}
        </>
      );
    case 'lightbox':
      return <Lightbox childId={childId} />;
    case 'lightbox-comments':
      return <LightboxComments />;
    case 'card':
      return <EventCard />;
    case 'persistent-sheet-with-detent':
      return <PersistentPlayer />;
    default:
      return (
        <>
          {props.child ? null : title}
          {props.child ? null : description}
          <div class="demo-mini-list">
            <span>Safe area aware</span>
            <span>Gesture driven</span>
            <span>Framework neutral</span>
          </div>
          {close}
        </>
      );
  }
}

function LongSheetStory() {
  return (
    <cap-scroll class="demo-long-story">
      <cap-scroll-content>
        <article>
          <div class="demo-long-hero" role="img" aria-label="White country house beneath birds in a golden field">
            <cap-sheet-trigger class="demo-long-close" action="dismiss" aria-label="Close story">
              &times;
            </cap-sheet-trigger>
            <span class="demo-long-house" aria-hidden="true" />
          </div>
          <div class="demo-long-copy">
            <cap-sheet-title>
              Beneath the Golden Sky:
              <br />A House in the Fields
            </cap-sheet-title>
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
  );
}

function ContactPicker() {
  return (
    <div class="demo-contact-picker">
      <label class="demo-contact-search">
        <span>Search contacts</span>
        <input type="search" placeholder="Search for a contact" />
      </label>
      <cap-scroll class="demo-contact-list">
        <cap-scroll-content>
          <For each={contacts}>
            {([tone, name, company]) => (
              <article class="demo-contact-row">
                <span class={`demo-contact-avatar demo-contact-avatar--${tone}`} aria-hidden="true" />
                <span class="demo-contact-copy">
                  <strong>{name}</strong>
                  <small>{company}</small>
                </span>
              </article>
            )}
          </For>
        </cap-scroll-content>
      </cap-scroll>
    </div>
  );
}

function MealCard() {
  return (
    <div class="demo-meal-card">
      <div class="demo-meal-image" role="img" aria-label="Meal ingredients arranged on a table" />
      <cap-sheet-title>Your Meal is Coming</cap-sheet-title>
      <cap-sheet-description>
        Your food is on its way and will arrive soon! Sit back and get ready to enjoy your meal.
      </cap-sheet-description>
      <cap-sheet-trigger class="demo-button demo-meal-button" action="dismiss">
        Got it
      </cap-sheet-trigger>
    </div>
  );
}

function SidebarContent() {
  return (
    <cap-scroll class="demo-sidebar">
      <cap-scroll-content>
        <div class="demo-sidebar-account">
          <span class="demo-sidebar-logo" aria-hidden="true" />
          <span>
            <strong>Acme Inc.</strong>
            <small>support@acme.com</small>
          </span>
        </div>
        <For each={sidebarGroups}>
          {([title, items]) => (
            <section class="demo-sidebar-group">
              <h3>{title}</h3>
              <ul>
                <For each={items}>
                  {([icon, label]) => (
                    <li>
                      <span class={`demo-sidebar-item-icon demo-sidebar-item-icon--${icon}`} aria-hidden="true" />
                      <span>{label}</span>
                    </li>
                  )}
                </For>
              </ul>
            </section>
          )}
        </For>
      </cap-scroll-content>
    </cap-scroll>
  );
}

function TopSheetContent() {
  return (
    <div class="demo-top-sheet">
      <div class="demo-top-head">
        <cap-sheet-trigger class="demo-icon-button" action="dismiss" aria-label="Close top sheet">
          &times;
        </cap-sheet-trigger>
      </div>
      <div class="demo-top-copy">
        <cap-sheet-title>Terrace Loft is Available</cap-sheet-title>
        <div class="demo-top-visual" role="img" aria-label="Modern terrace home with blue sky" />
        <cap-sheet-description>
          A bright two-bedroom stay with skyline views, warm interiors, and a private garden terrace.
        </cap-sheet-description>
        <cap-sheet-trigger class="demo-button demo-top-primary" action="dismiss">
          Book it now
        </cap-sheet-trigger>
      </div>
    </div>
  );
}

function DepthProfile(props: { close: JSX.Element }) {
  return (
    <div class="demo-depth-profile">
      <div class="demo-depth-cover" role="img" aria-label="Mountain lake at sunrise" />
      <div class="demo-depth-avatar" aria-hidden="true" />
      <cap-sheet-title>Maya Chen</cap-sheet-title>
      <cap-sheet-description>
        Product designer, weekend climber, and host of quiet cabins across the alpine coast.
      </cap-sheet-description>
      <div class="demo-depth-stats" aria-label="Profile stats">
        <span>
          <strong>42</strong>
          <small>stays</small>
        </span>
        <span>
          <strong>4.9</strong>
          <small>rating</small>
        </span>
        <span>
          <strong>18k</strong>
          <small>views</small>
        </span>
      </div>
      <div class="demo-actions demo-actions--compact">
        <cap-sheet-trigger class="demo-button" action="dismiss">
          Follow
        </cap-sheet-trigger>
        {props.close}
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
  );
}

function PageContent(props: { usecase: Usecase; close: JSX.Element }) {
  return (
    <>
      <div class="demo-page-head">
        <span>{props.usecase.title}</span>
        {props.close}
      </div>
      <div class="demo-page-layout">
        <p>{props.usecase.summary}</p>
        <button type="button">Primary action</button>
        <button type="button">Secondary action</button>
      </div>
    </>
  );
}

function Lightbox(props: { childId: string }) {
  return (
    <div class="demo-lightbox">
      <cap-sheet-trigger class="demo-lightbox-close" action="dismiss" aria-label="Close lightbox" />
      <div class="demo-lightbox-photo" role="img" aria-label="Santorini coast with white buildings and blue sea" />
      <cap-sheet-trigger class="demo-lightbox-comments-trigger" for={props.childId} action="present">
        Comments
      </cap-sheet-trigger>
    </div>
  );
}

function LightboxComments() {
  const comments = [
    ['one', 'Emma Schmidt', 'The view is absolutely breathtaking. The city and sea feel perfectly balanced.'],
    ['two', 'Liam Muller', 'That waterline is unreal. I would frame this shot.'],
    ['three', 'Olivia Dupont', 'The hillside, the bright sky, and the white rooftops make the whole scene feel calm.'],
    ['four', 'Noah Garcia', 'The contrast between the village and open water is excellent.'],
    ['five', 'Ava Rossi', 'This makes me want to head straight to the coast. The composition feels inviting.'],
  ];

  return (
    <div class="demo-lightbox-comments">
      <div class="demo-lightbox-comments-head">
        <cap-sheet-trigger class="demo-lightbox-comments-close" action="dismiss" aria-label="Close comments" />
        <cap-sheet-title>Comments</cap-sheet-title>
      </div>
      <div class="demo-lightbox-comments-list">
        <For each={comments}>
          {([tone, name, text]) => (
            <article class="demo-lightbox-comment">
              <span class={`demo-lightbox-avatar demo-lightbox-avatar--${tone}`} aria-hidden="true" />
              <div class="demo-lightbox-comment-bubble">
                <strong>{name}</strong>
                <p>{text}</p>
              </div>
            </article>
          )}
        </For>
      </div>
    </div>
  );
}

function EventCard() {
  return (
    <div class="demo-event-card">
      <cap-sheet-trigger class="demo-icon-button demo-event-card-close" action="dismiss" aria-label="Close card">
        &times;
      </cap-sheet-trigger>
      <div class="demo-event-art" role="img" aria-label="Paint brushes on a workshop table" />
      <div class="demo-event-copy">
        <cap-sheet-title>Paint and Sip</cap-sheet-title>
        <cap-sheet-description>
          Join a relaxed studio night with color, music, and a glass of something bright.
        </cap-sheet-description>
        <cap-sheet-trigger class="demo-button demo-event-primary" action="dismiss">
          Reserve spot
        </cap-sheet-trigger>
      </div>
    </div>
  );
}

function PersistentPlayer() {
  return (
    <div class="demo-player">
      <div class="demo-player-mini">
        <cap-sheet-trigger class="demo-player-mini-main" action="step" detent="2" aria-label="Expand player">
          <span class="demo-player-mini-art" aria-hidden="true" />
          <span>
            <strong>Barcelona Dreams</strong>
            <small>Eira Voss</small>
          </span>
        </cap-sheet-trigger>
        <cap-sheet-trigger class="demo-icon-button" action="dismiss" aria-label="Close player">
          &times;
        </cap-sheet-trigger>
      </div>
      <div class="demo-player-expanded">
        <div class="demo-player-art" role="img" aria-label="Barcelona Dreams album cover" />
        <div class="demo-player-copy">
          <cap-sheet-title>Barcelona Dreams</cap-sheet-title>
          <cap-sheet-description>Eira Voss</cap-sheet-description>
        </div>
        <input class="demo-player-range" type="range" min="0" max="1000" value="700" aria-label="Track progress" />
        <div class="demo-player-controls" aria-label="Playback controls">
          <button type="button" aria-label="Previous track">
            Back
          </button>
          <button type="button" aria-label="Play track">
            Play
          </button>
          <button type="button" aria-label="Next track">
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

function CardArt(props: { usecase: Usecase }) {
  const label = props.usecase.title
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 3)
    .toUpperCase();

  return (
    <>
      <span>{label}</span>
      <i />
      <b />
    </>
  );
}

function getResponsivePlacement(usecase: Usecase): SheetPlacement {
  if (
    usecase.slug === 'detached-sheet' &&
    typeof window !== 'undefined' &&
    window.matchMedia?.(DETACHED_CENTER_QUERY).matches
  ) {
    return 'center';
  }
  return usecase.placement;
}

function getSheetId(usecase: Usecase, index: number): string {
  return `demo-${index}-${usecase.slug}`;
}

function getSheetRenderId(usecase: Usecase, index: number, child: boolean): string {
  return child ? `${getSheetId(usecase, index)}-child` : getSheetId(usecase, index);
}

function placementLabel(placement: SheetPlacement): string {
  return placement === 'center' ? 'center' : `${placement} edge`;
}

function shouldRenderBleedingBackground(usecase: Usecase): boolean {
  return usecase.placement !== 'center' && usecase.slug !== 'detached-sheet' && usecase.slug !== 'toast';
}

function renderBooleanAttributes(options?: SheetOptions): Record<string, string> {
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
