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
                args[0].includes(
                    'Warning: An update to %s inside a test was not wrapped in act',
                )
            )
        ) {
            consoleError(...args);
        }
    });
});
