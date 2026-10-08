import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import '../components';
import type { CapSheet } from '../components/cap-sheet';

type ControllerInternals = {
  nearestDetentForOffset(offsetPx: number, velocity: number): number;
  detentOffsetsPx: number[];
  releaseVelocity(travel: { samples: { t: number; pos: number }[] }): number;
  pointerTravel: { samples: { t: number; pos: number }[]; velocity: number; startOffsetPx: number } | null;
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

function toEmOffset(sheet: CapSheet, offsetPx: number): number {
  const content = sheet.querySelector('cap-sheet-content')!;
  const emPx = Number.parseFloat(window.getComputedStyle(content).fontSize) || 16;
  return offsetPx / emPx;
}

function holdAnimations(sheet: CapSheet): (() => void)[] {
  const pending: (() => void)[] = [];
  const hold = (): Animation => {
    let resolve: () => void = () => undefined;
    const finished = new Promise<void>((done) => {
      resolve = done;
    });
    pending.push(() => resolve());
    return { finished, cancel: () => resolve() } as unknown as Animation;
  };
  for (const selector of ['cap-sheet-content', 'cap-sheet-backdrop']) {
    const element = sheet.querySelector(selector) as HTMLElement;
    Object.defineProperty(element, 'animate', { configurable: true, value: hold });
  }
  return pending;
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
    await sheet.present({ animation: { duration: 0 } });

    const content = sheet.querySelector('cap-sheet-content') as HTMLElement;
    const renderedOffsetPx = 192;
    const internals = sheet.controller as unknown as ControllerInternals & {
      currentOffsetPx: number;
      activeMotion: { cancel: () => void } | null;
    };

    internals.currentOffsetPx = 0;
    content.style.transform = 'translate3d(0, 0em, 0)';
    internals.activeMotion = { cancel: vi.fn() };

    const originalGetComputedStyle = window.getComputedStyle.bind(window);
    const computedStyleSpy = vi.spyOn(window, 'getComputedStyle').mockImplementation((element, pseudo) => {
      const style = originalGetComputedStyle(element, pseudo);
      if (element === content) {
        Object.defineProperty(style, 'transform', {
          configurable: true,
          value: `matrix(1, 0, 0, 1, 0, ${renderedOffsetPx})`,
        });
      }
      return style;
    });

    const handle = sheet.querySelector('cap-sheet-handle')!;
    pointer(handle, 'pointerdown', { clientX: 195, clientY: 500 });
    expect(internals.pointerTravel?.startOffsetPx).toBeCloseTo(renderedOffsetPx, 0);

    pointer(handle, 'pointermove', { clientX: 195, clientY: 520 });
    expect(Number(sheet.controller.getTravelEvent().offset)).toBeCloseTo(toEmOffset(sheet, renderedOffsetPx + 20), 1);

    computedStyleSpy.mockRestore();
  });

  it('resumes an interrupted entering animation when a tap does not become a drag', async () => {
    const sheet = mountSheet();
    sheet.controller.connect();

    const pending = holdAnimations(sheet);

    const presentedChanges: boolean[] = [];
    sheet.addEventListener('cap-sheet-presented-change', (event) => {
      presentedChanges.push(Boolean((event as CustomEvent<{ presented: boolean }>).detail.presented));
    });

    void sheet.present({ animation: { duration: 300 } });
    expect(sheet.controller.status).toBe('entering');

    const handle = sheet.querySelector('cap-sheet-handle')!;
    pointer(handle, 'pointerdown', { clientX: 195, clientY: 600 });
    await Promise.resolve();
    await Promise.resolve();
    pointer(handle, 'pointerup', { clientX: 195, clientY: 602 });
    expect(sheet.controller.status).toBe('entering');

    pending.splice(0).forEach((finish) => finish());
    await vi.runAllTimersAsync();

    const internals = sheet.controller as unknown as ControllerInternals & { currentOffsetPx: number };
    expect(sheet.controller.status).toBe('idle');
    expect(internals.currentOffsetPx).toBeCloseTo(internals.detentOffsetsPx[sheet.controller.activeDetent] || 0, 3);
    expect(presentedChanges).toEqual([true]);
  });

  it('resumes an interrupted settling animation when a tap does not become a drag', async () => {
    const sheet = mountSheet();
    sheet.setAttribute('detents', '200px 400px');
    sheet.controller.connect();
    await sheet.present({ animation: { duration: 0 }, detent: 1 });

    const pending = holdAnimations(sheet);

    const detentChanges: number[] = [];
    sheet.addEventListener('cap-sheet-active-detent-change', (event) => {
      detentChanges.push(Number((event as CustomEvent<{ activeDetent: number }>).detail.activeDetent));
    });

    void sheet.controller.stepTo(2, { animation: { duration: 300 } });
    expect(sheet.controller.status).toBe('settling');

    const handle = sheet.querySelector('cap-sheet-handle')!;
    pointer(handle, 'pointerdown', { clientX: 195, clientY: 600 });
    await Promise.resolve();
    await Promise.resolve();
    pointer(handle, 'pointerup', { clientX: 195, clientY: 601 });
    expect(sheet.controller.status).toBe('settling');

    pending.splice(0).forEach((finish) => finish());
    await vi.runAllTimersAsync();

    const internals = sheet.controller as unknown as ControllerInternals & { currentOffsetPx: number };
    expect(sheet.controller.status).toBe('idle');
    expect(sheet.controller.activeDetent).toBe(2);
    expect(internals.currentOffsetPx).toBeCloseTo(internals.detentOffsetsPx[2] || 0, 3);
    expect(detentChanges).toEqual([2]);
  });

  it('completes the presentation lifecycle after a drag interrupts entering', async () => {
    const sheet = mountSheet();
    sheet.controller.connect();
    const pending = holdAnimations(sheet);

    const presentedChanges: boolean[] = [];
    const detentChanges: number[] = [];
    sheet.addEventListener('cap-sheet-presented-change', (event) => {
      presentedChanges.push(Boolean((event as CustomEvent<{ presented: boolean }>).detail.presented));
    });
    sheet.addEventListener('cap-sheet-active-detent-change', (event) => {
      detentChanges.push(Number((event as CustomEvent<{ activeDetent: number }>).detail.activeDetent));
    });

    void sheet.present({ animation: { duration: 300 } });
    expect(sheet.controller.status).toBe('entering');

    const internals = sheet.controller as unknown as ControllerInternals & { currentOffsetPx: number };
    internals.currentOffsetPx = 120;
    const handle = sheet.querySelector('cap-sheet-handle')!;
    pointer(handle, 'pointerdown', { clientX: 195, clientY: 600 });
    await Promise.resolve();
    await Promise.resolve();
    pointer(handle, 'pointermove', { clientX: 195, clientY: 560 });
    pointer(handle, 'pointermove', { clientX: 195, clientY: 500 });
    pointer(handle, 'pointerup', { clientX: 195, clientY: 500 });
    expect(sheet.controller.status).toBe('settling');

    while (pending.length > 0) {
      pending.splice(0).forEach((finish) => finish());
      await vi.runAllTimersAsync();
    }

    expect(sheet.controller.status).toBe('idle');
    expect(sheet.controller.presented).toBe(true);
    expect(sheet.controller.activeDetent).toBeGreaterThan(0);
    expect(presentedChanges).toEqual([true]);
    expect(detentChanges).toEqual([sheet.controller.activeDetent]);
  });

  it('keeps the first pointer gesture when a second pointer goes down during a tap', async () => {
    const sheet = mountSheet();
    sheet.controller.connect();
    const pending = holdAnimations(sheet);

    void sheet.present({ animation: { duration: 300 } });
    const handle = sheet.querySelector('cap-sheet-handle')!;
    pointer(handle, 'pointerdown', { clientX: 195, clientY: 600, pointerId: 1, isPrimary: true });
    await Promise.resolve();
    await Promise.resolve();
    pointer(handle, 'pointerdown', { clientX: 120, clientY: 620, pointerId: 2, isPrimary: false });
    pointer(handle, 'pointerup', { clientX: 120, clientY: 620, pointerId: 2, isPrimary: false });
    pointer(handle, 'pointerup', { clientX: 195, clientY: 601, pointerId: 1, isPrimary: true });
    expect(sheet.controller.status).toBe('entering');

    while (pending.length > 0) {
      pending.splice(0).forEach((finish) => finish());
      await vi.runAllTimersAsync();
    }

    const internals = sheet.controller as unknown as ControllerInternals & { currentOffsetPx: number };
    expect(sheet.controller.status).toBe('idle');
    expect(internals.currentOffsetPx).toBeCloseTo(internals.detentOffsetsPx[sheet.controller.activeDetent] || 0, 3);
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
