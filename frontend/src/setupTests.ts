import '@testing-library/jest-dom';
import 'whatwg-fetch';
import 'regenerator-runtime';
import { beforeAll, vi } from 'vitest';

class ResizeObserver {
    callback: ResizeObserverCallback;
    observedTargets = new Set<Element>();
    constructor(callback: ResizeObserverCallback) {
        this.callback = callback;
    }
    observe(target: Element) {
        // Only fire once per target to avoid infinite loops when
        // @tanstack/react-virtual re-measures elements.
        if (this.observedTargets.has(target)) {
            return;
        }
        this.observedTargets.add(target);
        this.callback(
            [
                {
                    target,
                    contentRect: { width: 800, height: 800 },
                    borderBoxSize: [{ inlineSize: 800, blockSize: 800 }],
                    contentBoxSize: [{ inlineSize: 800, blockSize: 800 }],
                    devicePixelContentBoxSize: [],
                },
            ] as any,
            this as any,
        );
    }
    unobserve(target: Element) {
        this.observedTargets.delete(target);
    }
    disconnect() {
        this.observedTargets.clear();
    }
}

class IntersectionObserver {
    root: any;
    rootMargin: any;
    thresholds: any;

    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() {
        return [];
    }
}

if (!window.ResizeObserver) {
    window.ResizeObserver = ResizeObserver;
}

if (!window.IntersectionObserver) {
    window.IntersectionObserver = IntersectionObserver;
}

process.env.TZ = 'UTC';

const errorsToIgnore = [
    'Warning: An update to %s inside a test was not wrapped in act',
    "Failed to create chart: can't acquire context from the given item",
];

const warningsToIgnore = [
    '[MSW] Found a redundant usage of query parameters in the request handler URL for',
    'MUI: You have provided an out-of-range value',
];

const logsToIgnore = ['An exception was caught and handled.'];

// ignore known React warnings
const consoleError = console.error;
const consoleWarn = console.warn;
const consoleLog = console.log;
beforeAll(() => {
    const shouldIgnore = (messagesToIgnore: string[], args: any[]) =>
        typeof args[0] === 'string' &&
        messagesToIgnore.some((msg) => args[0].includes(msg));

    vi.spyOn(console, 'error').mockImplementation((...args) => {
        if (!shouldIgnore(errorsToIgnore, args)) {
            consoleError(...args);
        }
    });
    vi.spyOn(console, 'warn').mockImplementation((...args) => {
        if (!shouldIgnore(warningsToIgnore, args)) {
            consoleWarn(...args);
        }
    });
    vi.spyOn(console, 'log').mockImplementation((...args) => {
        if (!shouldIgnore(logsToIgnore, args)) {
            consoleLog(...args);
        }
    });
});
