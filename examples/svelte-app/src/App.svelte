<script lang="ts">
  import { onMount } from 'svelte'
  import { setupSheet } from '@capgo/capacitor-sheets/svelte'
  import { mountUsecaseGallery } from '../../shared/usecase-gallery'

  let gallery: HTMLDivElement

  onMount(() =>
    mountUsecaseGallery(gallery, {
      framework: 'Svelte',
      setupSheet,
    }),
  )
</script>

<div bind:this={gallery}></div>
