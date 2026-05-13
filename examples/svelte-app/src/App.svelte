<script lang="ts">
  import { sheet } from '@capgo/capacitor-sheets/svelte'
</script>

<main class="page">
  <header>
    <strong>Svelte sheet</strong>
    <cap-sheet-trigger for="svelte-sheet" action="present">Open</cap-sheet-trigger>
  </header>

  <cap-sheet-outlet for="svelte-sheet" class="panel">Svelte</cap-sheet-outlet>

  <cap-sheet id="svelte-sheet" use:sheet={{ detents: ['16em', '30em'], contentPlacement: 'bottom' }}>
    <cap-sheet-view>
      <cap-sheet-backdrop />
      <cap-sheet-content class="sheet">
        <cap-sheet-handle />
        <cap-sheet-title>Svelte route</cap-sheet-title>
        <cap-sheet-description>Use a Svelte action when you want typed setup.</cap-sheet-description>
        <cap-sheet-trigger action="dismiss">Close</cap-sheet-trigger>
      </cap-sheet-content>
    </cap-sheet-view>
  </cap-sheet>
</main>
