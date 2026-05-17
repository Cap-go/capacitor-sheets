<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'

import { mountUsecaseGallery } from './usecase-gallery'

const galleryRef = ref<HTMLElement | null>(null)
let cleanup: (() => void) | undefined

onMounted(() => {
  if (galleryRef.value) {
    cleanup = mountUsecaseGallery(galleryRef.value)
  }
})

onUnmounted(() => cleanup?.())
</script>

<template>
  <div ref="galleryRef"></div>
</template>
