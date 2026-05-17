<script lang="ts">
  import { sheet } from '@capgo/capacitor-sheets/svelte'
  import type {
    SheetActiveDetentChangeEvent,
    SheetOptions as CapSheetOptions,
    SheetTravelEvent,
  } from '@capgo/capacitor-sheets'
  import { onMount } from 'svelte'

  type SheetPlacement = 'top' | 'bottom' | 'left' | 'right' | 'center'
  type SheetOptions = Partial<CapSheetOptions> & {
    onPresentedChange?: (event: { presented: boolean; source: string }) => void
    onActiveDetentChange?: (event: SheetActiveDetentChangeEvent) => void
    onTravel?: (event: SheetTravelEvent) => void
  }

  interface Usecase {
    slug: string
    title: string
    summary: string
    placement: SheetPlacement
    detents?: string[]
    handle?: boolean
    sheetClass?: string
    backdrop?: boolean
    options?: SheetOptions
    outlet?: 'depth' | 'parallax'
    child?: Usecase
  }

  interface SheetEntry {
    usecase: Usecase
    index: number
    child: boolean
    renderId: string
    stackId?: string
  }

  const DETACHED_CENTER_QUERY = '(min-width: 43.75rem)'

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
  ]

  const contacts = [
    ['one', 'Emma Schmidt', 'Blue Horizon'],
    ['two', 'Liam Muller', 'Evergreen Solutions'],
    ['three', 'Olivia Dupont', 'Nova Ventures'],
    ['four', 'Noah Garcia', 'Bridges Collective'],
    ['five', 'Ava Rossi', 'Vivid Ideas'],
    ['six', 'Sophia Ivanova', 'Rise Solutions'],
    ['seven', 'Mia Laurent', 'Northline Studio'],
    ['eight', 'Leo Park', 'Atlas Workshop'],
  ]

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
  ]

  const comments = [
    ['one', 'Emma Schmidt', 'The view is absolutely breathtaking. The city and sea feel perfectly balanced.'],
    ['two', 'Liam Muller', 'That waterline is unreal. I would frame this shot.'],
    ['three', 'Olivia Dupont', 'The hillside, the bright sky, and the white rooftops make the whole scene feel calm.'],
    ['four', 'Noah Garcia', 'The contrast between the village and open water is excellent.'],
    ['five', 'Ava Rossi', 'This makes me want to head straight to the coast. The composition feels inviting.'],
  ]

  let detachedCentered = false

  const depthUsecaseIndex = usecases.findIndex((usecase) => usecase.slug === 'sheet-with-depth')
  const depthUsecase = depthUsecaseIndex >= 0 ? usecases[depthUsecaseIndex] : undefined
  const depthOutletFor = depthUsecase ? getSheetId(depthUsecase, depthUsecaseIndex) : undefined

  onMount(() => {
    const query = window.matchMedia(DETACHED_CENTER_QUERY)
    const sync = () => {
      detachedCentered = query.matches
    }

    sync()
    query.addEventListener('change', sync)
    return () => query.removeEventListener('change', sync)
  })

  function sheetEntries(usecase: Usecase, index: number): SheetEntry[] {
    const stackId = usecase.child ? stackIdFor(index) : undefined
    const entries: SheetEntry[] = [
      {
        usecase,
        index,
        child: false,
        renderId: getSheetRenderId(usecase, index, false),
        stackId,
      },
    ]

    if (usecase.child) {
      entries.push({
        usecase: usecase.child,
        index,
        child: true,
        renderId: getSheetRenderId(usecase.child, index, true),
        stackId,
      })
    }

    return entries
  }

  function sheetOptions(entry: SheetEntry): SheetOptions {
    return {
      ...(entry.usecase.options || {}),
      contentPlacement: resolvedPlacement(entry.usecase),
      detents: entry.usecase.detents,
      onTravel: ({ progress }: SheetTravelEvent) => {
        document.getElementById(entry.renderId)?.style.setProperty('--demo-sheet-progress', progress.toFixed(3))
      },
    }
  }

  function travelOutlet(node: HTMLElement, type: 'depth' | 'parallax'): { destroy(): void } {
    Object.assign(node, {
      travelAnimation:
        type === 'depth'
          ? {
              transform: ({ progress }: { progress: number }) =>
                `translate3d(0, ${progress * 0.75}rem, 0) scale(${1 - progress * 0.09})`,
              filter: ({ progress }: { progress: number }) =>
                `saturate(${1 - progress * 0.18}) brightness(${1 - progress * 0.05})`,
              'border-radius': ({ progress }: { progress: number }) => `${progress * 1.5}rem`,
              'box-shadow': ({ progress }: { progress: number }) =>
                progress > 0.01 ? `0 ${progress * 1.25}rem ${progress * 3.5}rem rgb(20 23 22 / 0.2)` : 'none',
            }
          : { '--demo-parallax-progress': ({ progress }: { progress: number }) => String(progress) },
    })

    return {
      destroy() {
        Object.assign(node, { travelAnimation: undefined })
      },
    }
  }

  function hasHandle(usecase: Usecase): boolean {
    return usecase.handle !== false && usecase.placement !== 'center'
  }

  function resolvedPlacement(usecase: Usecase): SheetPlacement {
    return usecase.slug === 'detached-sheet' && detachedCentered ? 'center' : usecase.placement
  }

  function detentsAttribute(usecase: Usecase): string | undefined {
    return usecase.detents?.join(' ')
  }

  function sheetClass(usecase: Usecase): string {
    return ['demo-sheet-content', usecase.sheetClass].filter(Boolean).join(' ')
  }

  function cardLabel(usecase: Usecase): string {
    return usecase.title
      .split(' ')
      .map((part) => part[0])
      .join('')
      .slice(0, 3)
      .toUpperCase()
  }

  function placementLabel(placement: SheetPlacement): string {
    return placement === 'center' ? 'center' : `${placement} edge`
  }

  function stackIdFor(index: number): string {
    return `demo-stack-${index}`
  }

  function getSheetId(usecase: Usecase, index: number): string {
    return `demo-${index}-${usecase.slug}`
  }

  function getSheetRenderId(usecase: Usecase, index: number, child: boolean): string {
    return child ? `${getSheetId(usecase, index)}-child` : getSheetId(usecase, index)
  }

  function childSheetId(usecase: Usecase, index: number): string {
    return usecase.child ? `${getSheetId(usecase.child, index)}-child` : ''
  }

  function booleanAttributes(options?: SheetOptions): Record<string, string> {
    if (!options) return {}

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
    )
  }
</script>

{#each usecases as usecase, index (usecase.slug)}
  {#if usecase.child}
    <cap-sheet-stack id={stackIdFor(index)}>
      {#each sheetEntries(usecase, index) as entry (entry.renderId)}
        <cap-sheet
          use:sheet={sheetOptions(entry)}
          id={entry.renderId}
          data-demo-sheet=""
          data-demo-placement={entry.usecase.placement}
          data-demo-detents={detentsAttribute(entry.usecase) || ''}
          data-demo-usecase={entry.usecase.slug}
          content-placement={resolvedPlacement(entry.usecase)}
          detents={detentsAttribute(entry.usecase)}
          stack={entry.stackId}
          {...booleanAttributes(entry.usecase.options)}
        >
          <cap-sheet-portal>
            <cap-sheet-view content-placement={resolvedPlacement(entry.usecase)}>
              {#if entry.usecase.backdrop !== false}
                <cap-sheet-backdrop></cap-sheet-backdrop>
              {/if}
              <cap-sheet-content class={sheetClass(entry.usecase)}>
                <cap-sheet-bleeding-background></cap-sheet-bleeding-background>
                {#if hasHandle(entry.usecase)}
                  <cap-sheet-handle></cap-sheet-handle>
                {/if}
                {#if entry.usecase.slug === 'sheet-with-stacking'}
                  <cap-sheet-title>{entry.usecase.title}</cap-sheet-title>
                  <cap-sheet-description>{entry.usecase.summary}</cap-sheet-description>
                  <p class="demo-row">This first layer stays below the next sheet.</p>
                  <div class="demo-actions">
                    <cap-sheet-trigger class="demo-button" for={childSheetId(entry.usecase, entry.index)} action="present">
                      Open stacked sheet
                    </cap-sheet-trigger>
                    <cap-sheet-trigger class="demo-button demo-button--quiet" action="dismiss">Close</cap-sheet-trigger>
                  </div>
                {:else if entry.usecase.slug === 'sheet-with-stacking-child'}
                  <cap-sheet-title>{entry.usecase.title}</cap-sheet-title>
                  <cap-sheet-description>{entry.usecase.summary}</cap-sheet-description>
                  <p class="demo-row">Stack depth is handled by cap-sheet-stack.</p>
                  <cap-sheet-trigger class="demo-button demo-button--quiet" action="dismiss">Close</cap-sheet-trigger>
                {:else if entry.usecase.slug === 'lightbox'}
                  <div class="demo-lightbox">
                    <cap-sheet-trigger class="demo-lightbox-close" action="dismiss" aria-label="Close lightbox"></cap-sheet-trigger>
                    <div class="demo-lightbox-photo" role="img" aria-label="Santorini coast with white buildings and blue sea"></div>
                    <cap-sheet-trigger class="demo-lightbox-comments-trigger" for={childSheetId(entry.usecase, entry.index)} action="present">
                      Comments
                    </cap-sheet-trigger>
                  </div>
                {:else if entry.usecase.slug === 'lightbox-comments'}
                  <div class="demo-lightbox-comments">
                    <div class="demo-lightbox-comments-head">
                      <cap-sheet-trigger
                        class="demo-lightbox-comments-close"
                        action="dismiss"
                        aria-label="Close comments"
                      ></cap-sheet-trigger>
                      <cap-sheet-title>Comments</cap-sheet-title>
                    </div>
                    <div class="demo-lightbox-comments-list">
                      {#each comments as [tone, name, text] (name)}
                        <article class="demo-lightbox-comment">
                          <span class={`demo-lightbox-avatar demo-lightbox-avatar--${tone}`} aria-hidden="true"></span>
                          <div class="demo-lightbox-comment-bubble">
                            <strong>{name}</strong>
                            <p>{text}</p>
                          </div>
                        </article>
                      {/each}
                    </div>
                  </div>
                {/if}
              </cap-sheet-content>
            </cap-sheet-view>
          </cap-sheet-portal>
        </cap-sheet>
      {/each}
    </cap-sheet-stack>
  {:else}
    {@const entry = sheetEntries(usecase, index)[0]}
    <cap-sheet
      use:sheet={sheetOptions(entry)}
      id={entry.renderId}
      data-demo-sheet=""
      data-demo-placement={usecase.placement}
      data-demo-detents={detentsAttribute(usecase) || ''}
      data-demo-usecase={usecase.slug}
      content-placement={resolvedPlacement(usecase)}
      detents={detentsAttribute(usecase)}
      {...booleanAttributes(usecase.options)}
    >
      <cap-sheet-portal>
        <cap-sheet-view content-placement={resolvedPlacement(usecase)}>
          {#if usecase.backdrop !== false}
            <cap-sheet-backdrop></cap-sheet-backdrop>
          {/if}
          <cap-sheet-content class={sheetClass(usecase)}>
            <cap-sheet-bleeding-background></cap-sheet-bleeding-background>
            {#if hasHandle(usecase)}
              <cap-sheet-handle></cap-sheet-handle>
            {/if}

            {#if usecase.slug === 'long-sheet'}
              <cap-scroll class="demo-long-story" axis="y">
                <cap-scroll-content>
                  <article>
                    <div class="demo-long-hero" role="img" aria-label="White country house beneath birds in a golden field">
                      <cap-sheet-trigger class="demo-long-close" action="dismiss" aria-label="Close story">
                        &times;
                      </cap-sheet-trigger>
                      <span class="demo-long-house" aria-hidden="true"></span>
                    </div>
                    <div class="demo-long-copy">
                      <cap-sheet-title>
                        Beneath the Golden Sky:<br />
                        A House in the Fields
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
            {:else if usecase.slug === 'sheet-with-detent'}
              <div class="demo-contact-picker">
                <label class="demo-contact-search">
                  <span>Search contacts</span>
                  <input type="search" placeholder="Search for a contact" />
                </label>
                <cap-scroll class="demo-contact-list" axis="y">
                  <cap-scroll-content>
                    {#each contacts as [tone, name, company] (name)}
                      <article class="demo-contact-row">
                        <span class={`demo-contact-avatar demo-contact-avatar--${tone}`} aria-hidden="true"></span>
                        <span class="demo-contact-copy">
                          <strong>{name}</strong>
                          <small>{company}</small>
                        </span>
                      </article>
                    {/each}
                  </cap-scroll-content>
                </cap-scroll>
              </div>
            {:else if usecase.slug === 'detached-sheet'}
              <div class="demo-meal-card">
                <div class="demo-meal-image" role="img" aria-label="Meal ingredients arranged on a table"></div>
                <cap-sheet-title>Your Meal is Coming</cap-sheet-title>
                <cap-sheet-description>
                  Your food is on its way and will arrive soon! Sit back and get ready to enjoy your meal.
                </cap-sheet-description>
                <cap-sheet-trigger class="demo-button demo-meal-button" action="dismiss">Got it</cap-sheet-trigger>
              </div>
            {:else if usecase.slug === 'sidebar'}
              <cap-scroll class="demo-sidebar" axis="y">
                <cap-scroll-content>
                  <div class="demo-sidebar-account">
                    <span class="demo-sidebar-logo" aria-hidden="true"></span>
                    <span>
                      <strong>Acme Inc.</strong>
                      <small>support@acme.com</small>
                    </span>
                  </div>
                  {#each sidebarGroups as [title, items] (title)}
                    <section class="demo-sidebar-group">
                      <h3>{title}</h3>
                      <ul>
                        {#each items as [icon, label] (label)}
                          <li>
                            <span class={`demo-sidebar-item-icon demo-sidebar-item-icon--${icon}`} aria-hidden="true"></span>
                            <span>{label}</span>
                          </li>
                        {/each}
                      </ul>
                    </section>
                  {/each}
                </cap-scroll-content>
              </cap-scroll>
            {:else if usecase.slug === 'sheet-with-keyboard'}
              <cap-sheet-title>{usecase.title}</cap-sheet-title>
              <cap-sheet-description>{usecase.summary}</cap-sheet-description>
              <label class="demo-field">
                <span>Destination</span>
                <input placeholder="Type while the keyboard is open" />
              </label>
              <label class="demo-field">
                <span>Notes</span>
                <textarea rows="3" placeholder="The sheet follows visualViewport changes"></textarea>
              </label>
              <cap-sheet-trigger class="demo-button demo-button--quiet" action="dismiss">Close</cap-sheet-trigger>
            {:else if usecase.slug === 'toast'}
              <div class="demo-toast-row">
                <div class="demo-toast-copy">
                  <strong>Update ready</strong>
                  <p>Outside content remains interactive.</p>
                </div>
                <cap-sheet-trigger class="demo-button demo-button--quiet" action="dismiss">Close</cap-sheet-trigger>
              </div>
            {:else if usecase.slug === 'top-sheet'}
              <div class="demo-top-sheet">
                <div class="demo-top-head">
                  <cap-sheet-trigger class="demo-icon-button" action="dismiss" aria-label="Close top sheet">
                    &times;
                  </cap-sheet-trigger>
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
            {:else if usecase.slug === 'sheet-with-depth'}
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
                  <cap-sheet-trigger class="demo-button demo-button--quiet" action="dismiss">Close</cap-sheet-trigger>
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
            {:else if usecase.slug === 'page-from-bottom' || usecase.slug === 'page'}
              <div class="demo-page-head">
                <span>{usecase.title}</span>
                <cap-sheet-trigger class="demo-button demo-button--quiet" action="dismiss">Close</cap-sheet-trigger>
              </div>
              <div class="demo-page-layout">
                <p>{usecase.summary}</p>
                <button type="button">Primary action</button>
                <button type="button">Secondary action</button>
              </div>
            {:else if usecase.slug === 'card'}
              <div class="demo-event-card">
                <cap-sheet-trigger class="demo-icon-button demo-event-card-close" action="dismiss" aria-label="Close card">
                  &times;
                </cap-sheet-trigger>
                <div class="demo-event-art" role="img" aria-label="Paint brushes on a workshop table"></div>
                <div class="demo-event-copy">
                  <cap-sheet-title>Paint and Sip</cap-sheet-title>
                  <cap-sheet-description>
                    Join a relaxed studio night with color, music, and a glass of something bright.
                  </cap-sheet-description>
                  <cap-sheet-trigger class="demo-button demo-event-primary" action="dismiss">Reserve spot</cap-sheet-trigger>
                </div>
              </div>
            {:else if usecase.slug === 'persistent-sheet-with-detent'}
              <div class="demo-player">
                <div class="demo-player-mini">
                  <cap-sheet-trigger class="demo-player-mini-main" action="step" detent="2" aria-label="Expand player">
                    <span class="demo-player-mini-art" aria-hidden="true"></span>
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
            {:else}
              <cap-sheet-title>{usecase.title}</cap-sheet-title>
              <cap-sheet-description>{usecase.summary}</cap-sheet-description>
              <div class="demo-mini-list">
                <span>Safe area aware</span>
                <span>Gesture driven</span>
                <span>Framework neutral</span>
              </div>
              <cap-sheet-trigger class="demo-button demo-button--quiet" action="dismiss">Close</cap-sheet-trigger>
            {/if}
          </cap-sheet-content>
        </cap-sheet-view>
      </cap-sheet-portal>
    </cap-sheet>
  {/if}
{/each}

<cap-sheet-outlet use:travelOutlet={'depth'} for={depthOutletFor} class="demo-depth-stage">
  <main class="demo-app">
    <header class="demo-hero">
      <div>
        <p class="demo-kicker">Svelte playground</p>
        <h1>Capgo Sheets usecases</h1>
        <p>Open every sheet pattern from the real preview viewport. No fake phone frame, no clipped overlay.</p>
      </div>
      <a class="demo-link" href="https://github.com/Cap-go/capacitor-sheets" target="_blank" rel="noreferrer">
        GitHub
      </a>
    </header>

    <section class="demo-grid" aria-label="Sheet usecases">
      {#each usecases as usecase, index (usecase.slug)}
        <article class="demo-card">
          {#if usecase.outlet === 'parallax'}
            <cap-sheet-outlet
              use:travelOutlet={'parallax'}
              for={getSheetId(usecase, index)}
              class="demo-card-art demo-card-art--parallax"
            >
              <span>{cardLabel(usecase)}</span>
              <i></i>
              <b></b>
            </cap-sheet-outlet>
          {:else}
            <div class="demo-card-art">
              <span>{cardLabel(usecase)}</span>
              <i></i>
              <b></b>
            </div>
          {/if}
          <div class="demo-card-body">
            <p class="demo-chip">{placementLabel(usecase.placement)}</p>
            <h2>{usecase.title}</h2>
            <p>{usecase.summary}</p>
            <cap-sheet-trigger class="demo-button" for={getSheetId(usecase, index)} action="present">
              Open demo
            </cap-sheet-trigger>
          </div>
        </article>
      {/each}
    </section>
  </main>
</cap-sheet-outlet>
