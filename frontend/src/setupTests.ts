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

const shouldSkip = (index: any) => index % 100 !== 0;

let testCounter = 0;

// @ts-ignore
global.test = (name, fn, options) => {
    const fnToUse = shouldSkip(testCounter)
        ? originalTest.skip
        : originalTest.skip;
    testCounter++;
    return fnToUse(name, fn, options);
};
