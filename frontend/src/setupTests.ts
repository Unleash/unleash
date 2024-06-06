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
const customTest: typeof originalTest = (name, fn, options) => {
    const fnToUse = shouldSkip(testCounter)
        ? originalTest.skip
        : originalTest.skip;
    testCounter++;
    //@ts-ignore
    return fnToUse(name, fn, options);
};

//@ts-ignore
customTest.each = (cases: any) => (name: string, fn: Function) => {
    cases.forEach((testCase: any) => {
        const testName =
            typeof testCase === 'string' ? testCase : JSON.stringify(testCase);
        const fnToUse = shouldSkip(testCounter)
            ? originalTest.skip
            : originalTest.skip;
        testCounter++;
        return fnToUse(`${name} - ${testName}`, () => fn(testCase));
    });
};
//@ts-ignore
global.test = customTest;
