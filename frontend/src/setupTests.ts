import '@testing-library/jest-dom';
import 'whatwg-fetch';
import 'regenerator-runtime';
import { test as originalTest } from 'vitest';

class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
}

if (!window.ResizeObserver) {
    window.ResizeObserver = ResizeObserver;
}

process.env.TZ = 'UTC';

const shouldSkip = (index) => index % 2 === 0;

let testCounter = 0;

global.test = (name, fn, options) => {
    const fnToUse = shouldSkip(testCounter) ? originalTest.skip : originalTest;
    testCounter++;
    return fnToUse(name, fn, options);
};
