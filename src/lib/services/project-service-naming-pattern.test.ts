// test any number of leading and trailing ^ and $

import { BadDataError } from '../error';
import { validateAndProcessFeatureNamingPattern } from './project-service';

test.each([1, 3, 7])(
    'should replace %s leading ^ and trailing $',
    (instances) => {
        const pattern = '[a-z]+';
        const leading = `${'^'.repeat(instances)}${pattern}`;
        const trailing = `${pattern}${'$'.repeat(instances)}`;
        const leadingAndTrailing = `${'^'.repeat(
            instances,
        )}${pattern}${'$'.repeat(instances)}`;

        const leadingAndTrailingResult = validateAndProcessFeatureNamingPattern(
            {
                pattern: leadingAndTrailing,
            },
        );
        const leadingResult = validateAndProcessFeatureNamingPattern({
            pattern: leading,
        });
        const trailingResult = validateAndProcessFeatureNamingPattern({
            pattern: trailing,
        });

        expect(leadingAndTrailingResult.pattern).toBe(pattern);
        expect(leadingResult.pattern).toBe(pattern);
        expect(trailingResult.pattern).toBe(pattern);
    },
);

test('^ and $ inside the pattern is left untouched', () => {
    const pattern = '[a-z]-^something$-X';

    expect(validateAndProcessFeatureNamingPattern({ pattern })).toMatchObject({
        pattern,
    });
});

test('trailing ^ and leading $ are left untouched', () => {
    const pattern = '$[a-z]-^';

    expect(validateAndProcessFeatureNamingPattern({ pattern })).toMatchObject({
        pattern,
    });
});

test('pattern examples are tested against the pattern as if it were surrounded by ^ and $', () => {
    const pattern = '-[0-9]+';
    const validExample = '-23';
    const invalidExample1 = 'feat-15';
    const invalidExample2 = '-15-';

    expect(
        validateAndProcessFeatureNamingPattern({
            pattern,
            example: validExample,
        }),
    ).toMatchObject({ pattern, example: validExample });

    for (const example of [invalidExample1, invalidExample2]) {
        expect(() => {
            validateAndProcessFeatureNamingPattern({
                pattern,
                example,
            });
        }).toThrow(BadDataError);
    }
});
