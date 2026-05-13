<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { setupSheet } from '@capgo/capacitor-sheets/vue'

const sheetRef = ref<HTMLElement | null>(null)
let cleanup: (() => void) | undefined

onMounted(() => {
  if (sheetRef.value) {
    cleanup = setupSheet(sheetRef.value, {
      detents: ['16em', '30em'],
      contentPlacement: 'bottom',
    })
  }
})

onUnmounted(() => cleanup?.())
</script>

<template>
  <main class="page">
    <nav>
      <strong>Vue trip sheet</strong>
      <cap-sheet-trigger for="vue-sheet" action="present">Open</cap-sheet-trigger>
    </nav>

    <cap-sheet-outlet for="vue-sheet" class="scene">
      <span>Vue</span>
    </cap-sheet-outlet>

    <cap-sheet id="vue-sheet" ref="sheetRef">
      <cap-sheet-view>
        <cap-sheet-backdrop />
        <cap-sheet-content class="sheet">
          <cap-sheet-handle />
          <cap-sheet-title>Vue booking</cap-sheet-title>
          <cap-sheet-description>Same custom elements, Vue lifecycle setup.</cap-sheet-description>
          <cap-sheet-trigger action="dismiss">Close</cap-sheet-trigger>
        </cap-sheet-content>
      </cap-sheet-view>
    </cap-sheet>
  </main>
</template>
