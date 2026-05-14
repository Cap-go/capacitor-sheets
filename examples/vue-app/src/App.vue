<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { setupSheet } from '@capgo/capacitor-sheets/vue'
import { mountUsecaseGallery } from '../../shared/usecase-gallery'

const galleryRef = ref<HTMLElement | null>(null)
let cleanup: (() => void) | undefined

onMounted(() => {
  if (galleryRef.value) {
    cleanup = mountUsecaseGallery(galleryRef.value, {
      framework: 'Vue',
      setupSheet,
    })
  }
})

onUnmounted(() => cleanup?.())
</script>

<template>
  <div ref="galleryRef"></div>
</template>
