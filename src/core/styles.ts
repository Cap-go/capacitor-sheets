const STYLE_ID = 'capgo-capacitor-sheets-styles';

const CSS = `
:root {
  --cap-sheet-100-lvh-dvh-pct: max(100%, 100vh);
  --cap-sheet-backdrop-color: rgb(0 0 0);
  --cap-sheet-backdrop-opacity: 0.44;
  --cap-sheet-radius: 1.5em;
  --cap-sheet-handle-color: rgb(115 115 115);
  --cap-sheet-surface: Canvas;
  --cap-sheet-shadow: 0 0.5em 2.5em rgb(0 0 0 / 0.18);
  --cap-sheet-z-index: 1000;
  --cap-sheet-safe-area-top: max(env(safe-area-inset-top, 0em), var(--safe-area-inset-top, 0em));
  --cap-sheet-safe-area-bottom: max(env(safe-area-inset-bottom, 0em), var(--safe-area-inset-bottom, 0em));
  --cap-sheet-safe-area-left: max(env(safe-area-inset-left, 0em), var(--safe-area-inset-left, 0em));
  --cap-sheet-safe-area-right: max(env(safe-area-inset-right, 0em), var(--safe-area-inset-right, 0em));
  --cap-sheet-applied-safe-area-top: var(--cap-sheet-safe-area-top);
  --cap-sheet-applied-safe-area-bottom: var(--cap-sheet-safe-area-bottom);
  --cap-sheet-applied-safe-area-left: var(--cap-sheet-safe-area-left);
  --cap-sheet-applied-safe-area-right: var(--cap-sheet-safe-area-right);
}

@supports (height: 1dvh) {
  :root {
    --cap-sheet-100-lvh-dvh-pct: max(100dvh, 100lvh);
  }
}

cap-sheet,
cap-sheet-portal,
cap-sheet-special-wrapper,
cap-sheet-special-wrapper-content,
cap-sheet-stack {
  display: contents;
}

cap-sheet-view {
  position: fixed;
  inset: 0;
  display: grid;
  width: 100%;
  height: var(--cap-sheet-100-lvh-dvh-pct);
  z-index: var(--cap-sheet-z-index);
  pointer-events: none;
  touch-action: none;
  overscroll-behavior: none;
  contain: layout style;
  box-sizing: border-box;
  padding-block-start: var(--cap-sheet-applied-safe-area-top, 0em);
  padding-block-end: calc(var(--cap-sheet-applied-safe-area-bottom, 0em) + var(--cap-sheet-keyboard-offset, 0em));
  padding-inline-start: var(--cap-sheet-applied-safe-area-left, 0em);
  padding-inline-end: var(--cap-sheet-applied-safe-area-right, 0em);
}

cap-sheet-view[hidden] {
  display: none;
}

cap-sheet-view[content-placement="top"] {
  align-items: start;
  justify-items: center;
}

cap-sheet-view[content-placement="bottom"],
cap-sheet-view:not([content-placement]) {
  align-items: end;
  justify-items: center;
}

cap-sheet-view[content-placement="left"] {
  align-items: center;
  justify-items: start;
}

cap-sheet-view[content-placement="right"] {
  align-items: center;
  justify-items: end;
}

cap-sheet-view[content-placement="center"] {
  align-items: center;
  justify-items: center;
}

cap-sheet-backdrop {
  position: absolute;
  inset: 0;
  display: block;
  background: var(--cap-sheet-backdrop-color);
  opacity: 0;
  pointer-events: auto;
  touch-action: none;
  will-change: opacity;
}

cap-sheet-content {
  box-sizing: border-box;
  position: relative;
  display: block;
  width: min(100%, 34em);
  max-height: 100%;
  color: CanvasText;
  background: var(--cap-sheet-surface);
  border-radius: var(--cap-sheet-radius) var(--cap-sheet-radius) 0 0;
  box-shadow: var(--cap-sheet-shadow);
  overflow: auto;
  overscroll-behavior: contain;
  pointer-events: auto;
  touch-action: pan-x pan-y;
  will-change: transform, opacity;
  -webkit-overflow-scrolling: touch;
}

cap-sheet-view[content-placement="top"] cap-sheet-content {
  border-radius: 0 0 var(--cap-sheet-radius) var(--cap-sheet-radius);
}

cap-sheet-view[content-placement="left"] cap-sheet-content {
  width: min(88%, 28em);
  height: 100%;
  max-height: 100%;
  border-radius: 0 var(--cap-sheet-radius) var(--cap-sheet-radius) 0;
}

cap-sheet-view[content-placement="right"] cap-sheet-content {
  width: min(88%, 28em);
  height: 100%;
  max-height: 100%;
  border-radius: var(--cap-sheet-radius) 0 0 var(--cap-sheet-radius);
}

cap-sheet-view[content-placement="center"] cap-sheet-content {
  width: min(90%, 30em);
  max-height: min(90%, 42em);
  border-radius: var(--cap-sheet-radius);
}

cap-sheet-bleeding-background {
  position: absolute;
  inset: 0;
  z-index: -1;
  display: block;
  background: var(--cap-sheet-surface);
  border-radius: inherit;
  pointer-events: none;
}

cap-sheet-view[content-placement="bottom"] cap-sheet-bleeding-background,
cap-sheet-view:not([content-placement]) cap-sheet-bleeding-background {
  inset-block-end: -8em;
}

cap-sheet-view[content-placement="top"] cap-sheet-bleeding-background {
  inset-block-start: -8em;
}

cap-sheet-view[content-placement="left"] cap-sheet-bleeding-background {
  inset-inline-start: -8em;
}

cap-sheet-view[content-placement="right"] cap-sheet-bleeding-background {
  inset-inline-end: -8em;
}

cap-sheet-handle {
  box-sizing: border-box;
  display: grid;
  place-items: center;
  width: 100%;
  height: 2.25em;
  cursor: grab;
  touch-action: none;
}

cap-sheet-handle::before {
  content: "";
  display: block;
  width: 2.75em;
  height: 0.3125em;
  border-radius: 999em;
  background: var(--cap-sheet-handle-color);
  opacity: 0.65;
}

cap-sheet-handle:active {
  cursor: grabbing;
}

cap-sheet-title,
cap-sheet-description {
  display: block;
}

cap-sheet-outlet {
  display: block;
  transform-origin: center;
  will-change: transform, opacity, filter;
}

cap-scroll {
  display: block;
  overflow: auto;
  overscroll-behavior: contain;
  -webkit-overflow-scrolling: touch;
  scroll-behavior: smooth;
}

cap-scroll[axis="x"] {
  overflow-x: auto;
  overflow-y: hidden;
}

cap-scroll[axis="y"],
cap-scroll:not([axis]) {
  overflow-x: hidden;
  overflow-y: auto;
}

cap-scroll-content {
  display: block;
  min-width: 100%;
  min-height: 100%;
}

cap-fixed {
  position: fixed;
  inset-inline: 0;
  z-index: calc(var(--cap-sheet-z-index) + 1);
}

cap-island,
cap-external-overlay {
  display: contents;
}

cap-visually-hidden,
cap-auto-focus-target[hidden-target] {
  position: absolute;
  width: 0.0625em;
  height: 0.0625em;
  margin: -0.0625em;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
  border: 0;
  padding: 0;
}
`;

/** Injects the structural styles required by the sheet web components. */
export function injectCapSheetStyles(root: Document = document): void {
  if (root.getElementById(STYLE_ID)) return;

  const style = root.createElement('style');
  style.id = STYLE_ID;
  style.textContent = CSS;
  root.head.appendChild(style);
}

export { CSS as CAP_SHEETS_CSS };
