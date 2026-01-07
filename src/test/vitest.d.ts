import 'vitest';

interface CustomMatchers<
    R = string | RegExp | Constructable | Error | undefined,
> {
    errorWithMessage: (message) => R;
}

declare module 'vitest' {
    interface Assertion<T = any> extends CustomMatchers<T> {}
    interface AsymmetricMatchersContaining extends CustomMatchers {}
}
