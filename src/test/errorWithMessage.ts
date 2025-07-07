import { expect } from 'vitest';

expect.extend({
    errorWithMessage(received, expected) {
        const { isNot, equals } = this;
        return {
            pass: equals(received.message, expected.message),
            message: () =>
                `${received} did ${isNot ? ' not' : ''} match ${expected}`,
            expected: expected.toString(),
            actual: received.toString(),
        };
    },
});
