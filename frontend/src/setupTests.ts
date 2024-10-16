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
];

const warningsToIgnore = [
    '[MSW] Found a redundant usage of query parameters in the request handler URL for',
    'An exception was caught and handled.',
    'MUI: You have provided an out-of-range value',
    "Failed to create chart: can't acquire context from the given item",
];

// ignore known React warnings
const consoleError = console.error;
const consoleWarn = console.warn;
beforeAll(() => {
    vi.spyOn(console, 'error').mockImplementation((...args) => {
        if (
            !(
                typeof args[0] === 'string' &&
                errorsToIgnore.some((message) => args[0].includes(message))
            )
        ) {
            consoleError(...args);
        }
    });
    vi.spyOn(console, 'warn').mockImplementation((...args) => {
        if (
            !(
                typeof args[0] === 'string' &&
                warningsToIgnore.some((message) => args[0].includes(message))
            )
        ) {
            consoleWarn(...args);
        }
    });
});
