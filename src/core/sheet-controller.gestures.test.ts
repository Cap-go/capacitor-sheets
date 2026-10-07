import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import '../components';
import type { CapSheet } from '../components/cap-sheet';

type ControllerInternals = {
  nearestDetentForOffset(offsetPx: number, velocity: number): number;
  detentOffsetsPx: number[];
  releaseVelocity(travel: { samples: { t: number; pos: number }[] }): number;
  pointerTravel: { samples: { t: number; pos: number }[]; velocity: number } | null;
};

function mountSheet(id = 'sheet-a'): CapSheet {
  const root = document.createElement('main');
  root.id = 'page-root';
  document.body.append(root);

  const sheet = document.createElement('cap-sheet') as CapSheet;
  sheet.id = id;
  sheet.setAttribute('content-placement', 'bottom');
  sheet.setAttribute('detents', '400px');
  sheet.innerHTML = `
    <cap-sheet-view>
      <cap-sheet-backdrop></cap-sheet-backdrop>
      <cap-sheet-content style="height: 400px">
        <cap-sheet-handle></cap-sheet-handle>
      </cap-sheet-content>
    </cap-sheet-view>
  `;
  document.body.append(sheet);

  const view = sheet.querySelector('cap-sheet-view')!;
  const content = sheet.querySelector('cap-sheet-content')!;
  vi.spyOn(view, 'getBoundingClientRect').mockReturnValue({
    x: 0,
    y: 0,
    width: 390,
    height: 844,
    top: 0,
    left: 0,
    right: 390,
    bottom: 844,
    toJSON: () => ({}),
  });
  vi.spyOn(content, 'getBoundingClientRect').mockReturnValue({
    x: 0,
    y: 444,
    width: 390,
    height: 400,
    top: 444,
    left: 0,
    right: 390,
    bottom: 844,
    toJSON: () => ({}),
  });

  return sheet;
}

function pointer(
  target: Element,
  type: 'pointerdown' | 'pointermove' | 'pointerup',
  init: PointerEventInit & { timeStamp?: number },
): void {
  const event = new PointerEvent(type, { bubbles: true, cancelable: true, pointerId: 1, ...init });
  if (init.timeStamp !== undefined) {
    Object.defineProperty(event, 'timeStamp', { value: init.timeStamp });
  }
  target.dispatchEvent(event);
}

beforeAll(() => {
  if (!HTMLElement.prototype.animate) {
    HTMLElement.prototype.animate = vi.fn(() => ({
      finished: Promise.resolve(),
      cancel: vi.fn(),
    })) as unknown as typeof HTMLElement.prototype.animate;
  }
});

beforeEach(() => {
  document.body.innerHTML = '';
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('sheet-controller gesture fixes', () => {
  it('computes release velocity from the last 100ms of movement', () => {
    const sheet = mountSheet();
    sheet.controller.connect();
    const releaseVelocity = (
      sheet.controller as unknown as { releaseVelocity(travel: { samples: { t: number; pos: number }[] }): number }
    ).releaseVelocity.bind(sheet.controller);

    const travel = {
      samples: [
        { t: 1_000, pos: 500 },
        { t: 2_500, pos: 582 },
        { t: 2_516, pos: 596 },
      ],
    };
    vi.spyOn(performance, 'now').mockReturnValue(3_032);
    expect(Math.abs(releaseVelocity(travel))).toBeLessThan(100);
  });

  it('uses release velocity instead of a stale last-frame fling sample', async () => {
    const sheet = mountSheet();
    sheet.controller.connect();
    await sheet.present({ animation: { duration: 0 } });
    const controller = sheet.controller as unknown as ControllerInternals;
    controller.detentOffsetsPx = [400, 0, 0];
    sheet.controller.activeDetent = 1;

    const handle = sheet.querySelector('cap-sheet-handle')!;
    let now = 1_000;
    vi.spyOn(performance, 'now').mockImplementation(() => now);

    pointer(handle, 'pointerdown', { clientX: 195, clientY: 500, timeStamp: now });
    now += 1_500;
    pointer(handle, 'pointermove', { clientX: 195, clientY: 582, timeStamp: now });
    now += 16;
    pointer(handle, 'pointermove', { clientX: 195, clientY: 596, timeStamp: now });
    now += 516;

    const internals = sheet.controller as unknown as ControllerInternals;
    const travel = internals.pointerTravel!;
    const releaseVelocity = internals.releaseVelocity(travel);
    const offset = 96;

    expect(Math.abs(travel.velocity)).toBeGreaterThan(700);
    expect(Math.abs(releaseVelocity)).toBeLessThan(100);
    expect(controller.nearestDetentForOffset(offset, travel.velocity)).toBe(0);
    expect(controller.nearestDetentForOffset(offset, releaseVelocity)).toBeGreaterThan(0);
  });

  it('starts a drag from the rendered transform while an animation is running', async () => {
    const sheet = mountSheet();
    sheet.controller.connect();
    const content = sheet.querySelector('cap-sheet-content') as HTMLElement;

    const presentPromise = sheet.present({ animation: { duration: 420, skip: false } });
    await vi.advanceTimersByTimeAsync(210);

    content.style.transform = 'translate3d(0, 12em, 0)';
    const handle = sheet.querySelector('cap-sheet-handle')!;
    pointer(handle, 'pointerdown', { clientX: 195, clientY: 500 });
    pointer(handle, 'pointermove', { clientX: 195, clientY: 520 });
    pointer(handle, 'pointerup', { clientX: 195, clientY: 520 });

    await presentPromise.catch(() => undefined);
    expect(sheet.controller.getTravelEvent().status).not.toBe('exiting');
  });

  it('restores page interactivity after overlapping present and dismiss', async () => {
    const sheetA = mountSheet('sheet-a');
    const sheetB = mountSheet('sheet-b');
    sheetA.controller.connect();
    sheetB.controller.connect();

    const pageRoot = document.getElementById('page-root') as HTMLElement;

    await sheetA.present({ animation: { duration: 0 } });
    const dismissA = sheetA.dismiss({ animation: { duration: 0 } });
    const presentB = sheetB.present({ animation: { duration: 0 } });
    await Promise.all([dismissA, presentB]);
    await sheetB.dismiss({ animation: { duration: 0 } });

    expect(pageRoot.hasAttribute('inert')).toBe(false);
    expect(Boolean((pageRoot as HTMLElement & { inert?: boolean }).inert)).toBe(false);
    expect(pageRoot.getAttribute('aria-hidden')).toBeNull();
  });

  it('does not reset offset when configure runs during a drag', async () => {
    const sheet = mountSheet();
    sheet.controller.connect();
    await sheet.present({ animation: { duration: 0 } });

    const handle = sheet.querySelector('cap-sheet-handle')!;
    const offsets: number[] = [];
    sheet.addEventListener('cap-sheet-travel', (event) => {
      const detail = (event as CustomEvent<{ offset: string }>).detail;
      offsets.push(Number.parseFloat(detail.offset));
    });

    pointer(handle, 'pointerdown', { clientX: 195, clientY: 500 });
    pointer(handle, 'pointermove', { clientX: 195, clientY: 620 });
    const offsetDuringDrag = sheet.controller.getTravelEvent().offset;
    sheet.configure({ swipe: true });
    await vi.advanceTimersByTimeAsync(16);

    expect(sheet.controller.status).toBe('dragging');
    expect(sheet.controller.getTravelEvent().offset).toBe(offsetDuringDrag);
    expect(offsets.at(-1)).toBe(Number.parseFloat(String(offsetDuringDrag)));
  });

  it('does not loop remeasure when configure is triggered by a mutation observer', async () => {
    const sheet = mountSheet();
    sheet.controller.connect();
    await sheet.present({ animation: { duration: 0 } });

    const view = sheet.querySelector('cap-sheet-view')!;
    let remeasureCount = 0;
    const originalRemeasure = sheet.controller.remeasure.bind(sheet.controller);
    sheet.controller.remeasure = (...args) => {
      remeasureCount += 1;
      return originalRemeasure(...args);
    };

    const observer = new MutationObserver(() => sheet.configure({ swipe: true }));
    observer.observe(view, { childList: true, subtree: true });
    sheet.configure({ swipe: true });
    await vi.advanceTimersByTimeAsync(32);
    observer.disconnect();

    expect(remeasureCount).toBeLessThanOrEqual(2);
  });
});
