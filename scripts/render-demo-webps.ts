#!/usr/bin/env bun

import { spawnSync } from 'node:child_process';
import { mkdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

type Kind =
  | 'bottom'
  | 'card'
  | 'depth'
  | 'detached'
  | 'detent'
  | 'keyboard'
  | 'lightbox'
  | 'long'
  | 'page'
  | 'page-bottom'
  | 'parallax'
  | 'persistent'
  | 'sidebar'
  | 'stacking'
  | 'toast'
  | 'top';

interface Demo {
  slug: string;
  title: string;
  caption: string;
  kind: Kind;
  accent: string;
}

const font = '/System/Library/Fonts/Helvetica.ttc';
const outDir = join(process.cwd(), 'docs', 'demos');
const width = 900;
const height = 620;
const frameCount = 36;

const demos: Demo[] = [
  {
    slug: 'long-sheet',
    title: 'Long Sheet',
    caption: 'Tall content with internal scroll',
    kind: 'long',
    accent: '#4f8f72',
  },
  {
    slug: 'sheet-with-detent',
    title: 'Sheet with Detent',
    caption: 'Peek, mid, and full resting points',
    kind: 'detent',
    accent: '#5f79d6',
  },
  {
    slug: 'sidebar',
    title: 'Sidebar',
    caption: 'Same sheet primitive from the side',
    kind: 'sidebar',
    accent: '#a15d54',
  },
  {
    slug: 'bottom-sheet',
    title: 'Bottom Sheet',
    caption: 'Native-feeling mobile bottom sheet',
    kind: 'bottom',
    accent: '#111111',
  },
  {
    slug: 'sheet-with-keyboard',
    title: 'Sheet with Keyboard',
    caption: 'Input stays above the visual viewport',
    kind: 'keyboard',
    accent: '#397c8f',
  },
  { slug: 'toast', title: 'Toast', caption: 'Non-blocking sheet-style notification', kind: 'toast', accent: '#263236' },
  {
    slug: 'detached-sheet',
    title: 'Detached Sheet',
    caption: 'Floating surface with edge gestures',
    kind: 'detached',
    accent: '#8f6a39',
  },
  {
    slug: 'page-from-bottom',
    title: 'Page from Bottom',
    caption: 'Full-page sheet entering vertically',
    kind: 'page-bottom',
    accent: '#6d67c8',
  },
  { slug: 'top-sheet', title: 'Top Sheet', caption: 'Top edge travel and dismissal', kind: 'top', accent: '#2d7c78' },
  {
    slug: 'sheet-with-stacking',
    title: 'Sheet with Stacking',
    caption: 'Multiple sheets with stacked depth',
    kind: 'stacking',
    accent: '#9554a1',
  },
  {
    slug: 'sheet-with-depth',
    title: 'Sheet with Depth',
    caption: 'Outlet scales behind the sheet',
    kind: 'depth',
    accent: '#6a7d2f',
  },
  {
    slug: 'parallax-page',
    title: 'Parallax Page',
    caption: 'Sheet progress drives page motion',
    kind: 'parallax',
    accent: '#bf5f3d',
  },
  { slug: 'page', title: 'Page', caption: 'Route-like sheet page transition', kind: 'page', accent: '#365da8' },
  { slug: 'lightbox', title: 'Lightbox', caption: 'Centered media overlay', kind: 'lightbox', accent: '#141414' },
  {
    slug: 'persistent-sheet-with-detent',
    title: 'Persistent Sheet with Detent',
    caption: 'Background remains interactive',
    kind: 'persistent',
    accent: '#19705f',
  },
  { slug: 'card', title: 'Card', caption: 'Compact centered sheet surface', kind: 'card', accent: '#8a573b' },
];

function run(command: string, args: string[]): void {
  const result = spawnSync(command, args, { stdio: 'inherit' });
  if (result.status !== 0) {
    throw new Error(`${command} failed with exit code ${result.status}`);
  }
}

function ease(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

function travel(frame: number): number {
  if (frame < 12) return ease(frame / 11);
  if (frame < 26) return 1;
  return ease(1 - (frame - 26) / 9);
}

function secondaryTravel(frame: number): number {
  if (frame < 10) return 0;
  if (frame < 20) return ease((frame - 10) / 9);
  if (frame < 29) return 1;
  return ease(1 - (frame - 29) / 6);
}

function drawRect(x1: number, y1: number, x2: number, y2: number, r = 0): string {
  const left = Math.min(x1, x2);
  const right = Math.max(x1, x2);
  const top = Math.min(y1, y2);
  const bottom = Math.max(y1, y2);
  const radius = Math.max(0, Math.min(r, (right - left) / 2, (bottom - top) / 2));
  return radius > 0
    ? `roundrectangle ${left},${top} ${right},${bottom} ${radius},${radius}`
    : `rectangle ${left},${top} ${right},${bottom}`;
}

function baseArgs(demo: Demo, progress: number): string[] {
  const radius = demo.kind === 'depth' ? 28 * progress : 0;
  const inset = demo.kind === 'depth' ? 18 * progress : 0;

  return [
    'magick',
    '-size',
    `${width}x${height}`,
    'canvas:#eee8dc',
    '-font',
    font,
    '-fill',
    '#101010',
    '-pointsize',
    '34',
    '-annotate',
    '+54+74',
    demo.title,
    '-fill',
    '#59554c',
    '-pointsize',
    '20',
    '-annotate',
    '+56+110',
    demo.caption,
    '-fill',
    '#f9f6ef',
    '-stroke',
    '#1a1a1a',
    '-strokewidth',
    '3',
    '-draw',
    drawRect(270 + inset, 26 + inset, 630 - inset, 594 - inset, 38 + radius),
    '-stroke',
    'none',
    '-fill',
    '#f7f2e8',
    '-draw',
    drawRect(286 + inset, 48 + inset, 614 - inset, 572 - inset, 24 + radius),
    '-fill',
    demo.accent,
    '-draw',
    drawRect(306 + inset, 72 + inset, 594 - inset, 132 + inset, 16),
    '-fill',
    '#ffffff',
    '-pointsize',
    '20',
    '-annotate',
    `+${326 + inset}+${109 + inset}`,
    'Capgo Sheets',
    '-fill',
    '#ffffff',
    '-draw',
    drawRect(528 + inset, 90 + inset, 570 + inset, 102 + inset, 6),
    '-fill',
    '#ded5c8',
    '-draw',
    drawRect(306 + inset, 158 + inset, 594 - inset, 230 + inset, 14),
    '-draw',
    drawRect(306 + inset, 250 + inset, 594 - inset, 322 + inset, 14),
    '-draw',
    drawRect(306 + inset, 342 + inset, 594 - inset, 414 + inset, 14),
  ];
}

function sheetArgs(demo: Demo, frame: number): string[] {
  const p = travel(frame);
  const p2 = secondaryTravel(frame);
  const screen = { left: 286, top: 48, right: 614, bottom: 572 };
  const surface = '#fffdf8';
  const muted = '#d9d1c4';
  const text = '#151515';
  const args: string[] = [];

  const backdrop = (opacity: number): string[] => [
    '-fill',
    `rgba(0,0,0,${opacity.toFixed(2)})`,
    '-draw',
    drawRect(screen.left, screen.top, screen.right, screen.bottom, 24),
  ];

  const handle = (x: number, y: number): string[] => ['-fill', '#bbb3a8', '-draw', drawRect(x, y, x + 72, y + 6, 3)];

  const contentLines = (x: number, y: number, count: number, maxWidth = 210): string[] => {
    const draws = Array.from({ length: count }, (_, index) => {
      const w = maxWidth - (index % 3) * 28;
      return drawRect(x, y + index * 24, x + w, y + index * 24 + 10, 5);
    }).join(' ');
    return ['-fill', muted, '-draw', draws];
  };

  const bottomSheet = (heightValue: number, detached = false): string[] => {
    const sheetHeight = heightValue * p;
    const y = screen.bottom - sheetHeight;
    const margin = detached ? 20 : 0;
    return [
      ...backdrop(0.22 * p),
      '-fill',
      surface,
      '-draw',
      drawRect(screen.left + margin, y, screen.right - margin, screen.bottom + 80, detached ? 24 : 26),
      ...handle(414, y + 22),
      '-fill',
      text,
      '-pointsize',
      '24',
      '-annotate',
      `+${screen.left + margin + 34}+${y + 76}`,
      demo.title,
      ...contentLines(screen.left + margin + 34, y + 108, demo.kind === 'long' ? 12 : 4),
    ];
  };

  if (demo.kind === 'bottom') return bottomSheet(265);
  if (demo.kind === 'long') return bottomSheet(470);
  if (demo.kind === 'detached') return bottomSheet(250, true);
  if (demo.kind === 'detent') {
    const h = 150 + 220 * p2;
    return bottomSheet(h);
  }
  if (demo.kind === 'persistent') {
    const h = 150 + 170 * p2;
    return [
      '-fill',
      surface,
      '-draw',
      drawRect(screen.left, screen.bottom - h, screen.right, screen.bottom + 80, 24),
      ...handle(414, screen.bottom - h + 22),
      '-fill',
      text,
      '-pointsize',
      '22',
      '-annotate',
      `+324+${screen.bottom - h + 78}`,
      'Persistent detent',
      ...contentLines(324, screen.bottom - h + 112, 4),
    ];
  }
  if (demo.kind === 'keyboard') {
    const y = screen.bottom - 292 * p - 118 * p2;
    return [
      ...backdrop(0.18 * p),
      '-fill',
      surface,
      '-draw',
      drawRect(screen.left, y, screen.right, screen.bottom + 80, 24),
      ...handle(414, y + 22),
      '-fill',
      text,
      '-pointsize',
      '23',
      '-annotate',
      `+324+${y + 72}`,
      'Reply',
      '-fill',
      '#f3eee6',
      '-draw',
      drawRect(324, y + 102, 576, y + 150, 12),
      '-fill',
      '#1f1f1f',
      '-draw',
      drawRect(338, y + 126, 430, y + 132, 3),
      '-fill',
      `rgba(210,204,196,${p2.toFixed(2)})`,
      '-draw',
      drawRect(screen.left, screen.bottom - 120 * p2, screen.right, screen.bottom, 18),
    ];
  }
  if (demo.kind === 'top') {
    const h = 240 * p;
    const y = screen.top - 80 + h;
    return [
      ...backdrop(0.2 * p),
      '-fill',
      surface,
      '-draw',
      drawRect(screen.left, screen.top - 80, screen.right, y, 24),
      ...handle(414, y - 32),
      '-fill',
      text,
      '-pointsize',
      '24',
      '-annotate',
      '+324+118',
      'Top controls',
      ...contentLines(324, 150, 3),
    ];
  }
  if (demo.kind === 'sidebar') {
    const x = screen.left - 230 + 230 * p;
    return [
      ...backdrop(0.18 * p),
      '-fill',
      surface,
      '-draw',
      drawRect(x, screen.top, x + 230, screen.bottom, 24),
      '-fill',
      text,
      '-pointsize',
      '24',
      '-annotate',
      `+${x + 28}+96`,
      'Menu',
      ...contentLines(x + 28, 134, 10, 150),
    ];
  }
  if (demo.kind === 'toast') {
    const y = screen.top + 30 + (1 - p) * 90;
    return [
      '-fill',
      `rgba(0,0,0,${0.08 * p})`,
      '-draw',
      drawRect(screen.left, screen.top, screen.right, screen.bottom, 24),
      '-fill',
      '#172126',
      '-draw',
      drawRect(324, y, 576, y + 82, 20),
      '-fill',
      '#ffffff',
      '-pointsize',
      '20',
      '-annotate',
      `+352+${y + 48}`,
      'Saved to itinerary',
    ];
  }
  if (demo.kind === 'stacking') {
    const yBack = screen.bottom - 270 * p;
    const yFront = screen.bottom - 220 * p2;
    return [
      ...backdrop(0.24 * Math.max(p, p2)),
      '-fill',
      '#eee8dc',
      '-draw',
      drawRect(screen.left + 18, yBack + 16, screen.right - 18, screen.bottom + 80, 24),
      '-fill',
      surface,
      '-draw',
      drawRect(screen.left, yFront, screen.right, screen.bottom + 80, 24),
      ...handle(414, yFront + 22),
      '-fill',
      text,
      '-pointsize',
      '23',
      '-annotate',
      `+324+${yFront + 76}`,
      'Second sheet',
      ...contentLines(324, yFront + 110, 4),
    ];
  }
  if (demo.kind === 'depth') return bottomSheet(265);
  if (demo.kind === 'parallax') {
    const shift = p * 74;
    return [
      '-fill',
      '#f2c66d',
      '-draw',
      drawRect(316, 210 - shift, 450, 296 - shift, 18),
      '-fill',
      '#6f9f8d',
      '-draw',
      drawRect(466, 248 - shift * 0.45, 586, 354 - shift * 0.45, 18),
      ...bottomSheet(190),
    ];
  }
  if (demo.kind === 'page-bottom') {
    const y = screen.bottom - (screen.bottom - screen.top) * p;
    return [
      '-fill',
      surface,
      '-draw',
      drawRect(screen.left, y, screen.right, screen.bottom, 24),
      '-fill',
      demo.accent,
      '-draw',
      drawRect(314, y + 34, 586, y + 98, 16),
      '-fill',
      text,
      '-pointsize',
      '24',
      '-annotate',
      `+324+${y + 146}`,
      'Full page',
      ...contentLines(324, y + 182, 8),
    ];
  }
  if (demo.kind === 'page') {
    const x = screen.right - (screen.right - screen.left) * p;
    return [
      '-fill',
      surface,
      '-draw',
      drawRect(x, screen.top, x + (screen.right - screen.left), screen.bottom, 24),
      '-fill',
      demo.accent,
      '-draw',
      drawRect(x + 28, 84, x + 300, 148, 16),
      '-fill',
      text,
      '-pointsize',
      '24',
      '-annotate',
      `+${x + 38}+196`,
      'Page transition',
      ...contentLines(x + 38, 232, 8),
    ];
  }
  if (demo.kind === 'lightbox') {
    const box = 232 * Math.max(p, 0.04);
    const x = 450 - box / 2;
    const y = 310 - box / 2;
    return [
      ...backdrop(0.55 * p),
      '-fill',
      '#fffaf0',
      '-draw',
      drawRect(x, y, x + box, y + box, 22),
      '-fill',
      demo.accent,
      '-draw',
      drawRect(x + 18, y + 18, x + box - 18, y + box - 72, 16),
      '-fill',
      '#eee3d2',
      '-draw',
      drawRect(x + 26, y + box - 48, x + box - 26, y + box - 36, 6),
    ];
  }
  if (demo.kind === 'card') {
    const boxW = 230 * Math.max(p, 0.04);
    const boxH = 260 * Math.max(p, 0.04);
    const x = 450 - boxW / 2;
    const y = 312 - boxH / 2;
    return [
      ...backdrop(0.2 * p),
      '-fill',
      surface,
      '-draw',
      drawRect(x, y, x + boxW, y + boxH, 24),
      '-fill',
      demo.accent,
      '-draw',
      drawRect(x + 24, y + 24, x + boxW - 24, y + 98, 16),
      ...contentLines(x + 24, y + 128, 4, 160),
    ];
  }

  return args;
}

mkdirSync(outDir, { recursive: true });
rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });

for (const demo of demos) {
  const tempDir = join(tmpdir(), `cap-sheets-${demo.slug}-${Date.now()}`);
  mkdirSync(tempDir, { recursive: true });

  try {
    for (let frame = 0; frame < frameCount; frame += 1) {
      const progress = travel(frame);
      const output = join(tempDir, `frame-${String(frame).padStart(3, '0')}.png`);
      run('magick', [...baseArgs(demo, progress).slice(1), ...sheetArgs(demo, frame), output]);
    }

    const frameGlob = join(tempDir, 'frame-*.png');
    const output = join(outDir, `${demo.slug}.webp`);
    run('magick', ['-delay', '5', '-loop', '0', frameGlob, '-quality', '82', output]);
    console.log(`rendered ${output}`);
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
}
