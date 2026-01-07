import {
    allOperators,
    inOperators,
    isInOperator,
    isStringOperator,
    stringOperators,
} from 'constants/operators';
import { isCaseSensitive } from './isCaseSensitive.js';

test('`IN` and `NOT_IN` are always case sensitive', () => {
    expect(
        inOperators
            .flatMap((operator) =>
                [true, false, undefined].map((caseInsensitive) =>
                    isCaseSensitive(operator, caseInsensitive),
                ),
            )
            .every((result) => result === true),
    ).toBe(true);
});

test('If `caseInsensitive` is true, all operators except for `IN` and `NOT_IN` are considered case insensitive', () => {
    expect(
        allOperators
            .filter((operator) => !isInOperator(operator))
            .map((operator) => isCaseSensitive(operator, true))
            .every((result) => result === false),
    ).toBe(true);
});

test.each([
    false,
    undefined,
])('If `caseInsensitive` is %s, only string (and in) operators are considered case sensitive', (caseInsensitive) => {
    const stringResults = stringOperators.map((operator) =>
        isCaseSensitive(operator, caseInsensitive),
    );
    const nonStringResults = allOperators
        .filter(
            (operator) =>
                !(isStringOperator(operator) || isInOperator(operator)),
        )
        .map((operator) => isCaseSensitive(operator, caseInsensitive));

    expect(stringResults.every((result) => result === true)).toBe(true);
    expect(nonStringResults.every((result) => result === false)).toBe(true);
});
