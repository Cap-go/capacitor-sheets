let baseThemeColor: string | null = null;
let activeDimmerCount = 0;

function getThemeMeta(documentRef: Document): HTMLMetaElement | null {
  return documentRef.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
}

function parseHexColor(color: string): [number, number, number] | null {
  const normalized = color.trim().replace('#', '');
  if (![3, 6].includes(normalized.length)) return null;

  const expanded =
    normalized.length === 3
      ? normalized
          .split('')
          .map((char) => `${char}${char}`)
          .join('')
      : normalized;
  const value = Number.parseInt(expanded, 16);
  if (!Number.isFinite(value)) return null;

  return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
}

function parseRgbColor(color: string): [number, number, number] | null {
  const match = color.match(/rgba?\(([^)]+)\)/i);
  if (!match) return null;

  const values = match[1]
    .split(/[\s,/]+/)
    .map((item) => Number.parseFloat(item))
    .filter((item) => Number.isFinite(item));

  if (values.length < 3) return null;
  return [values[0], values[1], values[2]];
}

function toHex(channel: number): string {
  return Math.round(channel).toString(16).padStart(2, '0');
}

function blend(base: string, overlay: string, alpha: number): string | null {
  const baseRgb = parseHexColor(base) || parseRgbColor(base);
  const overlayRgb = parseHexColor(overlay) || parseRgbColor(overlay);
  if (!baseRgb || !overlayRgb) return null;

  const [r, g, b] = baseRgb.map((channel, index) => channel * (1 - alpha) + overlayRgb[index] * alpha);
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/** Updates the browser theme color while preserving sheet dimming overlays. */
export function updateThemeColor(color: string, documentRef: Document = document): void {
  const meta = getThemeMeta(documentRef);
  if (!meta) return;

  if (activeDimmerCount > 0) {
    baseThemeColor = color;
    return;
  }

  meta.content = color;
}

/** Applies a dimmed theme color for presented modal sheets. */
export function setThemeColorDimming(documentRef: Document, alpha: number, overlayColor = 'rgb(0 0 0)'): void {
  const meta = getThemeMeta(documentRef);
  if (!meta) return;

  if (baseThemeColor === null) {
    baseThemeColor = meta.content;
  }

  const next = blend(baseThemeColor, overlayColor, alpha);
  if (next) {
    meta.content = next;
  }
}

/** Registers an active theme-color dimmer. */
export function retainThemeColorDimmer(): void {
  activeDimmerCount += 1;
}

/** Releases a theme-color dimmer and restores the base color when possible. */
export function releaseThemeColorDimmer(documentRef: Document): void {
  activeDimmerCount = Math.max(0, activeDimmerCount - 1);
  if (activeDimmerCount === 0 && baseThemeColor !== null) {
    const meta = getThemeMeta(documentRef);
    if (meta) {
      meta.content = baseThemeColor;
    }
    baseThemeColor = null;
  }
}
