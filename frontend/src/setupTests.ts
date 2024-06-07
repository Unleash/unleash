import '@testing-library/jest-dom';
import 'whatwg-fetch';
import 'regenerator-runtime';

class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
}

if (!window.ResizeObserver) {
    window.ResizeObserver = ResizeObserver;
}

process.env.TZ = 'UTC';
//
// const shouldSkip = (index: any) => index % 5 !== 0;
//
// let testCounter = 0;
//
// // @ts-ignore
// const customTest: typeof originalTest = (name, fn, options) => {
//     const fnToUse = shouldSkip(testCounter) ? originalTest.skip : originalTest;
//     testCounter++;
//     //@ts-ignore
//     return fnToUse(name, fn, options);
// };
//
// //@ts-ignore
// customTest.each = (cases: any) => {
//     return (name: string, fn: Function) => {
//         cases.forEach((testCase: any, index: number) => {
//             const testName = `${name} - ${JSON.stringify(testCase)}`;
//             const fnToUse = shouldSkip(testCounter + index)
//                 ? originalTest.skip
//                 : originalTest;
//             fnToUse(testName, () =>
//                 fn(...(Array.isArray(testCase) ? testCase : [testCase])),
//             );
//         });
//         testCounter += cases.length;
//     };
// };
// customTest.skip = originalTest.skip;
// //@ts-ignore
// global.test = customTest;
