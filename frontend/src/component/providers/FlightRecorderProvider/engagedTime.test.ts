import { afterEach, beforeEach, expect, it } from 'vitest';
import {
    type EngagedTimeTracker,
    startEngagedTimeTracker,
} from './engagedTime';

const MINUTE = 60 * 1000;
const IDLE_TIMEOUT = 30 * MINUTE;

let clock = 0;
const now = () => clock;
const advance = (ms: number) => {
    clock += ms;
};

const setVisibility = (state: 'visible' | 'hidden') => {
    Object.defineProperty(document, 'visibilityState', {
        value: state,
        configurable: true,
    });
    document.dispatchEvent(new Event('visibilitychange'));
};

const interact = () => document.dispatchEvent(new Event('mousemove'));

let tracker: EngagedTimeTracker;
const start = () => {
    tracker = startEngagedTimeTracker({ now, idleTimeoutMs: IDLE_TIMEOUT });
    return tracker;
};

beforeEach(() => {
    clock = 0;
    setVisibility('visible');
});

afterEach(() => {
    tracker?.stop();
});

it('counts the time the page stays visible', () => {
    const tracker = start();

    advance(5000);

    expect(tracker.engagedMs()).toBe(5000);
});

it('excludes the time the page spends hidden', () => {
    const tracker = start();

    advance(2000);
    setVisibility('hidden');
    advance(10 * MINUTE);

    expect(tracker.engagedMs()).toBe(2000);
});

it('resumes counting when the page becomes visible again', () => {
    const tracker = start();

    advance(2000);
    setVisibility('hidden');
    advance(10 * MINUTE);
    setVisibility('visible');
    advance(3000);

    expect(tracker.engagedMs()).toBe(5000);
});

it('caps a visible but untouched stretch at the idle timeout', () => {
    const tracker = start();

    advance(IDLE_TIMEOUT + 10 * MINUTE);

    expect(tracker.engagedMs()).toBe(IDLE_TIMEOUT);
});

it('excludes the idle gap once interaction resumes', () => {
    const tracker = start();

    advance(IDLE_TIMEOUT + 5 * MINUTE);
    interact();
    advance(1000);

    expect(tracker.engagedMs()).toBe(IDLE_TIMEOUT + 1000);
});
