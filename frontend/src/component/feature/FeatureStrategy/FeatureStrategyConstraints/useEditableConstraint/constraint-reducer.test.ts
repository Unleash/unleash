describe('changing context field', () => {
    test('changing context field to the same field is a no-op', () => {});
    test('changing context field to anything except currentTime clears value/values', () => {});
});
describe('changing operator', () => {
    test('changing operator to the same operator field is a no-op', () => {});
    test("changing the operator to anything that isn't date based clears the value", () => {});
    test('changing the operator to a non-date operator to a date operator sets the value to the current time', () => {});
    test('changing the operator from one date operator to another date operator leaves the value untouched', () => {});
});
describe('adding values', () => {
    describe('single-value constraints', () => {
        test('adding a value replaces the existing value', () => {});
    });
    describe('multi-value constraints', () => {
        test('adding a value to a multi-value constraint adds it to the set', () => {});
        test('adding a value to a multi-value constraint adds it to the list', () => {});
    });
});
describe('removing / clearing values', () => {
    describe('single-value constraints', () => {
        test('removing a value removes the existing value if it matches', () => {});
        test('clearing a value removes the existing value', () => {});
    });
    describe('multi-value constraints', () => {
        test('removing a value removes it from the set', () => {});
        test('clearing values removes all values from the set', () => {});
    });
});
describe('toggle options', () => {
    test('case sensitivity', () => {});
});

describe('match inversion / inclusive/exclusive operator (`constraint.inverted`)', () => {
    test('match inversion', () => {});
    test('inverting the operator does not affect selected values', () => {});
});
