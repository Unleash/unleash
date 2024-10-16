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

// ignore known React warnings
const consoleError = console.error;
beforeAll(() => {
    vi.spyOn(console, 'error').mockImplementation((...args) => {
        if (
            !(
                typeof args[0] === 'string' &&
                (args[0].includes(
                    'Warning: An update to %s inside a test was not wrapped in act',
                ) ||
                    args[0].includes(
                        '[MSW] Found a redundant usage of query parameters in the request handler URL for',
                    ) ||
                    args[0].includes('An exception was caught and handled.') ||
                    args[0].includes(
                        'MUI: You have provided an out-of-range value',
                    ) ||
                    args[0].includes(
                        "Failed to create chart: can't acquire context from the given item",
                    ))
            )
        ) {
            consoleError(...args);
        }
    });
});
