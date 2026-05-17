<script setup lang="ts">
import { computed } from 'vue';

interface Usecase {
  slug: string;
  title: string;
  summary: string;
  child?: Usecase;
}

const props = defineProps<{
  usecase: Usecase;
  index: number;
  child?: boolean;
}>();

const childId = computed(() => (props.usecase.child ? `${getSheetId(props.usecase.child, props.index)}-child` : ''));

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

const comments = [
  ['one', 'Emma Schmidt', 'The view is absolutely breathtaking. The city and sea feel perfectly balanced.'],
  ['two', 'Liam Muller', 'That waterline is unreal. I would frame this shot.'],
  ['three', 'Olivia Dupont', 'The hillside, the bright sky, and the white rooftops make the whole scene feel calm.'],
  ['four', 'Noah Garcia', 'The contrast between the village and open water is excellent.'],
  ['five', 'Ava Rossi', 'This makes me want to head straight to the coast. The composition feels inviting.'],
];

function getSheetId(usecase: Usecase, index: number): string {
  return `demo-${index}-${usecase.slug}`;
}
</script>

<template>
  <cap-scroll v-if="usecase.slug === 'long-sheet'" class="demo-long-story" axis="y">
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

  <div v-else-if="usecase.slug === 'sheet-with-detent'" class="demo-contact-picker">
    <label class="demo-contact-search">
      <span>Search contacts</span>
      <input type="search" placeholder="Search for a contact" />
    </label>
    <cap-scroll class="demo-contact-list" axis="y">
      <cap-scroll-content>
        <article v-for="[tone, name, company] in contacts" :key="name" class="demo-contact-row">
          <span :class="`demo-contact-avatar demo-contact-avatar--${tone}`" aria-hidden="true"></span>
          <span class="demo-contact-copy">
            <strong>{{ name }}</strong>
            <small>{{ company }}</small>
          </span>
        </article>
      </cap-scroll-content>
    </cap-scroll>
  </div>

  <div v-else-if="usecase.slug === 'detached-sheet'" class="demo-meal-card">
    <div class="demo-meal-image" role="img" aria-label="Meal ingredients arranged on a table"></div>
    <cap-sheet-title>Your Meal is Coming</cap-sheet-title>
    <cap-sheet-description>
      Your food is on its way and will arrive soon! Sit back and get ready to enjoy your meal.
    </cap-sheet-description>
    <cap-sheet-trigger class="demo-button demo-meal-button" action="dismiss">Got it</cap-sheet-trigger>
  </div>

  <cap-scroll v-else-if="usecase.slug === 'sidebar'" class="demo-sidebar" axis="y">
    <cap-scroll-content>
      <div class="demo-sidebar-account">
        <span class="demo-sidebar-logo" aria-hidden="true"></span>
        <span>
          <strong>Acme Inc.</strong>
          <small>support@acme.com</small>
        </span>
      </div>
      <section v-for="[title, items] in sidebarGroups" :key="title" class="demo-sidebar-group">
        <h3>{{ title }}</h3>
        <ul>
          <li v-for="[icon, label] in items" :key="label">
            <span :class="`demo-sidebar-item-icon demo-sidebar-item-icon--${icon}`" aria-hidden="true"></span>
            <span>{{ label }}</span>
          </li>
        </ul>
      </section>
    </cap-scroll-content>
  </cap-scroll>

  <template v-else-if="usecase.slug === 'sheet-with-keyboard'">
    <cap-sheet-title>{{ usecase.title }}</cap-sheet-title>
    <cap-sheet-description>{{ usecase.summary }}</cap-sheet-description>
    <label class="demo-field">
      <span>Destination</span>
      <input placeholder="Type while the keyboard is open" />
    </label>
    <label class="demo-field">
      <span>Notes</span>
      <textarea rows="3" placeholder="The sheet follows visualViewport changes"></textarea>
    </label>
    <cap-sheet-trigger class="demo-button demo-button--quiet" action="dismiss">Close</cap-sheet-trigger>
  </template>

  <div v-else-if="usecase.slug === 'toast'" class="demo-toast-row">
    <div class="demo-toast-copy">
      <strong>Update ready</strong>
      <p>Outside content remains interactive.</p>
    </div>
    <cap-sheet-trigger class="demo-button demo-button--quiet" action="dismiss">Close</cap-sheet-trigger>
  </div>

  <div v-else-if="usecase.slug === 'top-sheet'" class="demo-top-sheet">
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

  <div v-else-if="usecase.slug === 'sheet-with-depth'" class="demo-depth-profile">
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

  <template v-else-if="usecase.slug === 'page-from-bottom' || usecase.slug === 'page'">
    <div class="demo-page-head">
      <span>{{ usecase.title }}</span>
      <cap-sheet-trigger class="demo-button demo-button--quiet" action="dismiss">Close</cap-sheet-trigger>
    </div>
    <div class="demo-page-layout">
      <p>{{ usecase.summary }}</p>
      <button type="button">Primary action</button>
      <button type="button">Secondary action</button>
    </div>
  </template>

  <template v-else-if="usecase.slug === 'sheet-with-stacking'">
    <cap-sheet-title>{{ usecase.title }}</cap-sheet-title>
    <cap-sheet-description>{{ usecase.summary }}</cap-sheet-description>
    <p class="demo-row">This first layer stays below the next sheet.</p>
    <div class="demo-actions">
      <cap-sheet-trigger class="demo-button" :for="childId" action="present">Open stacked sheet</cap-sheet-trigger>
      <cap-sheet-trigger class="demo-button demo-button--quiet" action="dismiss">Close</cap-sheet-trigger>
    </div>
  </template>

  <template v-else-if="usecase.slug === 'sheet-with-stacking-child'">
    <cap-sheet-title>{{ usecase.title }}</cap-sheet-title>
    <cap-sheet-description>{{ usecase.summary }}</cap-sheet-description>
    <p class="demo-row">Stack depth is handled by cap-sheet-stack.</p>
    <cap-sheet-trigger class="demo-button demo-button--quiet" action="dismiss">Close</cap-sheet-trigger>
  </template>

  <div v-else-if="usecase.slug === 'lightbox'" class="demo-lightbox">
    <cap-sheet-trigger class="demo-lightbox-close" action="dismiss" aria-label="Close lightbox"></cap-sheet-trigger>
    <div class="demo-lightbox-photo" role="img" aria-label="Santorini coast with white buildings and blue sea"></div>
    <cap-sheet-trigger class="demo-lightbox-comments-trigger" :for="childId" action="present">
      Comments
    </cap-sheet-trigger>
  </div>

  <div v-else-if="usecase.slug === 'lightbox-comments'" class="demo-lightbox-comments">
    <div class="demo-lightbox-comments-head">
      <cap-sheet-trigger
        class="demo-lightbox-comments-close"
        action="dismiss"
        aria-label="Close comments"
      ></cap-sheet-trigger>
      <cap-sheet-title>Comments</cap-sheet-title>
    </div>
    <div class="demo-lightbox-comments-list">
      <article v-for="[tone, name, text] in comments" :key="name" class="demo-lightbox-comment">
        <span :class="`demo-lightbox-avatar demo-lightbox-avatar--${tone}`" aria-hidden="true"></span>
        <div class="demo-lightbox-comment-bubble">
          <strong>{{ name }}</strong>
          <p>{{ text }}</p>
        </div>
      </article>
    </div>
  </div>

  <div v-else-if="usecase.slug === 'card'" class="demo-event-card">
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

  <div v-else-if="usecase.slug === 'persistent-sheet-with-detent'" class="demo-player">
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

  <template v-else>
    <cap-sheet-title v-if="!child">{{ usecase.title }}</cap-sheet-title>
    <cap-sheet-description v-if="!child">{{ usecase.summary }}</cap-sheet-description>
    <div class="demo-mini-list">
      <span>Safe area aware</span>
      <span>Gesture driven</span>
      <span>Framework neutral</span>
    </div>
    <cap-sheet-trigger class="demo-button demo-button--quiet" action="dismiss">Close</cap-sheet-trigger>
  </template>
</template>
