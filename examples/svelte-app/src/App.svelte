<script lang="ts">
  import { onMount } from 'svelte'

  import { mountUsecaseGallery } from './usecase-gallery'

  let gallery: HTMLDivElement

  onMount(() => mountUsecaseGallery(gallery))
</script>

<div bind:this={gallery}></div>
