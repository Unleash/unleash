// test any number of leading and trailing ^ and $

import { BadDataError } from '../error';
import { validateAndProcessFeatureNamingPattern } from './project-service';

test('patterns with leading ^ and trailing $ are treated the same as without', () => {
    const basePattern = '[a-z]+';
    const leading = `^${basePattern}`;
    const trailing = `${basePattern}$`;
    const leadingAndTrailing = `^${basePattern}$`;

    const allPatterns = [basePattern, leading, trailing, leadingAndTrailing];

    const invalidExamples = ['-name-', 'name-', '-name'];
    const validExample = 'justalpha';

    for (const pattern of allPatterns) {
        for (const example of invalidExamples) {
            expect(() => {
                validateAndProcessFeatureNamingPattern({ pattern, example });
            }).toThrow(BadDataError);
        }
        const validData = {
            pattern,
            example: validExample,
        };
        expect(validateAndProcessFeatureNamingPattern(validData)).toMatchObject(
            validData,
        );
    }
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
