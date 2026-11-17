/**
 * Test Suite: app.js Mobile VisualViewport & Dynamic Language Popover Height Clamping
 * Isolated ESM module import so DOMContentLoaded binds to this test's visualViewport & DOM.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { setupTestEnvironment } from './fixtures/test-env.js';

describe('app.js — Mobile visualViewport padding & dynamic .lang-menu clamping', () => {
  it('clamps --lang-menu-max-h / .lang-menu.style.maxHeight when visualViewport shrinks and pads editor +120px', async () => {
    const env = setupTestEnvironment();
    const vvListeners = new Map();

    const visualViewportMock = {
      height: 800,
      offsetTop: 0,
      addEventListener(evt, fn) {
        if (!vvListeners.has(evt)) vvListeners.set(evt, new Set());
        vvListeners.get(evt).add(fn);
      },
      removeEventListener(evt, fn) {
        vvListeners.get(evt)?.delete(fn);
      },
    };

    const winListeners = new Map();
    globalThis.window.addEventListener = (evt, fn) => {
      if (!winListeners.has(evt)) winListeners.set(evt, new Set());
      winListeners.get(evt).add(fn);
    };
    globalThis.window.removeEventListener = (evt, fn) => {
      winListeners.get(evt)?.delete(fn);
    };
    globalThis.window.innerWidth = 360;
    globalThis.window.innerHeight = 800;
    globalThis.window.visualViewport = visualViewportMock;
    globalThis.window.matchMedia = (q) => ({
      matches: q.includes('640px'),
      media: q,
      addEventListener() {},
      removeEventListener() {},
    });
    globalThis.matchMedia = globalThis.window.matchMedia;

    // Make style.setProperty work on SimpleDOMNode for CSS custom properties
    const popover = env.elements.get('lang-popover') || document.querySelector('#lang-popover');
    const menu = env.elements.get('lang-menu') || document.querySelector('#lang-menu');
    const trigger = env.elements.get('lang-trigger') || document.querySelector('#lang-trigger');
    const bar = env.floatBar;

    const cssProps = new Map();
    popover.style.setProperty = (k, v) => cssProps.set(k, v);
    menu.style.setProperty = (k, v) => cssProps.set(`menu:${k}`, v);

    let mockBarRect = { top: 684, height: 106 };
    bar.getBoundingClientRect = () => mockBarRect;

    // Synchronous rAF for deterministic viewport sync
    globalThis.requestAnimationFrame = (cb) => { cb(); return 1; };
    globalThis.window.requestAnimationFrame = globalThis.requestAnimationFrame;

    await import('../app.js');
    document.dispatchEvent('DOMContentLoaded');

    // Simulate soft keyboard opening (visualViewport shrinks from 800 -> 460)
    visualViewportMock.height = 460;
    mockBarRect = { top: 346, height: 106 };
    for (const fn of vvListeners.get('resize') || []) fn();

    // Editor fallback paddingBottom clears 2-row mobile .float-bar (kbOffset 340 + 120 = 460px)
    assert.strictEqual(bar.style.bottom, '348px');
    assert.strictEqual(env.editor.style.paddingBottom, '460px');

    // Opening language popover clamps .lang-menu maxHeight cleanly inside viewport (barTop 344 - 74 = 270px)
    trigger.click();
    assert.strictEqual(popover.hidden, false);

    const maxH = parseInt(menu.style.maxHeight, 10);
    assert.strictEqual(maxH, 270, `Clamped .lang-menu maxHeight (${maxH}px) must use effectiveBarTop - 74 for >= 8px top clearance`);
    assert.strictEqual(cssProps.get('--lang-menu-max-h'), `${maxH}px`);

    // Re-expanding visualViewport (460 -> 800) updates maxHeight cleanly after .float-bar bottom transitionend
    visualViewportMock.height = 800;
    for (const fn of vvListeners.get('resize') || []) fn();
    // Simulate CSS bottom transition completing and updating barRect
    mockBarRect = { top: 684, height: 106 };
    bar.dispatchEvent({ type: 'transitionend', propertyName: 'bottom' });
    assert.strictEqual(parseInt(menu.style.maxHeight, 10), 420, 'transitionend on .float-bar must re-expand .lang-menu maxHeight');

    // Very short viewport still clamps safely >= 140px
    visualViewportMock.height = 220;
    mockBarRect = { top: 104, height: 106 };
    for (const fn of vvListeners.get('resize') || []) fn();
    assert.strictEqual(parseInt(menu.style.maxHeight, 10), 140);
  });
});
