// test any number of leading and trailing ^ and $

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
