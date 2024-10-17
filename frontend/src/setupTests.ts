import '@testing-library/jest-dom';
import 'whatwg-fetch';
import 'regenerator-runtime';
import { beforeAll, vi } from 'vitest';

class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
}

if (!window.ResizeObserver) {
    window.ResizeObserver = ResizeObserver;
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
    const shouldIgnore = (ignoredMessages: string[], args: any[]) =>
        typeof args[0] === 'string' &&
        ignoredMessages.some((msg) => args[0].includes(msg));

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
