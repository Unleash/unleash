import {
    checkFeatureFlagNamesAgainstPattern,
    checkFeatureNamingData,
} from './feature-naming-validation.js';

describe('validate incoming feature naming data', () => {
    test('patterns with leading ^ and trailing $ are treated the same as without', () => {
        const basePattern = '[a-z]+';
        const leading = `^${basePattern}`;
        const trailing = `${basePattern}$`;
        const leadingAndTrailing = `^${basePattern}$`;

        const allPatterns = [
            basePattern,
            leading,
            trailing,
            leadingAndTrailing,
        ];

        const invalidExamples = ['-name-', 'name-', '-name'];
        const validExample = 'justalpha';

        for (const pattern of allPatterns) {
            for (const example of invalidExamples) {
                expect(
                    checkFeatureNamingData({ pattern, example }),
                ).toMatchObject({
                    state: 'invalid',
                });
            }
            const validData = {
                pattern,
                example: validExample,
            };
            expect(checkFeatureNamingData(validData)).toMatchObject({
                state: 'valid',
            });
        }
    });

    test('pattern examples are tested against the pattern as if it were surrounded by ^ and $', () => {
        const pattern = '-[0-9]+';
        const validExample = '-23';
        const invalidExample1 = 'feat-15';
        const invalidExample2 = '-15-';

        expect(
            checkFeatureNamingData({
                pattern,
                example: validExample,
            }),
        ).toMatchObject({ state: 'valid' });

        for (const example of [invalidExample1, invalidExample2]) {
            expect(
                checkFeatureNamingData({
                    pattern,
                    example,
                }),
            ).toMatchObject({ state: 'invalid' });
        }
    });

    test('every branch of a top-level alternation has to match the whole example', () => {
        const pattern = 'release-[a-z]+|exp-[a-z]+';

        for (const example of ['release-checkout', 'exp-checkout']) {
            expect(checkFeatureNamingData({ pattern, example })).toMatchObject({
                state: 'valid',
            });
        }

        for (const example of [
            'release-checkout-2',
            'my-exp-checkout',
            'release-',
        ]) {
            expect(checkFeatureNamingData({ pattern, example })).toMatchObject({
                state: 'invalid',
            });
        }
    });

    test.each([
        '[a-z',
        '(release',
        'release-)|(exp-',
        '+',
    ])('patterns that are not valid regular expressions (%s) are invalid, with or without an example', (pattern) => {
        for (const data of [{ pattern }, { pattern, example: 'release-' }]) {
            const result = checkFeatureNamingData(data);

            if (result.state === 'valid') {
                expect.fail('Expected invalid result');
            }

            expect(result.reasons).toStrictEqual([
                expect.stringContaining("isn't a valid regular expression"),
            ]);
        }
    });

    test.each([
        ' ',
        '\\t',
        '\\n',
    ])('patterns with illegal characters (%s) are invalid', (string) => {
        const pattern = `-${string}[0-9]+`;

        expect(
            checkFeatureNamingData({
                pattern,
            }),
        ).toMatchObject({ state: 'invalid' });
    });

    test('feature naming data with a non-empty example but an empty pattern is invalid', () => {
        expect(
            checkFeatureNamingData({
                pattern: '',
                example: 'example',
            }),
        ).toMatchObject({ state: 'invalid' });
    });

    test('feature naming data with a non-empty description but an empty pattern is invalid', () => {
        expect(
            checkFeatureNamingData({
                pattern: '',
                description: 'description',
            }),
        ).toMatchObject({ state: 'invalid' });
    });

    test('if the pattern contains disallowed characters, a match is not attempted against the example', () => {
        const result = checkFeatureNamingData({
            pattern: 'a. [0-9]+',
            example: 'obviously-not-a-match',
        });

        if (result.state === 'valid') {
            expect.fail('Expected invalid result');
        }

        expect(result.reasons.length).toBe(1);
    });
});

describe('validate feature flag names against a pattern', () => {
    test('should validate names against a pattern', async () => {
        const featureNaming = {
            pattern: 'testpattern.+',
            example: 'testpattern-one!',
            description: 'naming description',
        };

        const validFeatures = ['testpattern-feature', 'testpattern-feature2'];
        const invalidFeatures = ['a', 'b', 'c'];
        const result = checkFeatureFlagNamesAgainstPattern(
            [...validFeatures, ...invalidFeatures],
            featureNaming.pattern,
        );

        expect(result).toMatchObject({
            state: 'invalid',
            invalidNames: new Set(invalidFeatures),
        });

        const validResult = checkFeatureFlagNamesAgainstPattern(
            validFeatures,
            featureNaming.pattern,
        );

        expect(validResult).toMatchObject({ state: 'valid' });
    });

    test.each([
        null,
        undefined,
        '',
    ])('should not validate names if the pattern is %s', (pattern) => {
        const featureNaming = {
            pattern,
        };
        const features = ['a', 'b'];
        const result = checkFeatureFlagNamesAgainstPattern(
            features,
            featureNaming.pattern,
        );

        expect(result).toMatchObject({ state: 'valid' });
    });

    test('should apply ^ and $ to every branch of a top-level alternation', async () => {
        const pattern = 'release-[a-z]+|exp-[a-z]+';
        const validFeatures = ['release-checkout', 'exp-checkout'];
        const invalidFeatures = [
            'release-checkout-2',
            'release-x and anything else',
            'my-exp-checkout',
            'checkout',
        ];

        expect(
            checkFeatureFlagNamesAgainstPattern(
                [...validFeatures, ...invalidFeatures],
                pattern,
            ),
        ).toMatchObject({
            state: 'invalid',
            invalidNames: new Set(invalidFeatures),
        });

        expect(
            checkFeatureFlagNamesAgainstPattern(validFeatures, pattern),
        ).toMatchObject({ state: 'valid' });
    });

    test.each([
        '^release-[a-z]+$|^exp-[a-z]+$',
        '(release|exp)-[a-z]+',
        '(?:release|exp)-[a-z]+',
    ])('should keep treating the already anchored or grouped pattern %s the same way', async (pattern) => {
        expect(
            checkFeatureFlagNamesAgainstPattern(
                ['release-checkout', 'exp-checkout', 'my-exp-checkout-2'],
                pattern,
            ),
        ).toMatchObject({
            state: 'invalid',
            invalidNames: new Set(['my-exp-checkout-2']),
        });
    });

    test('should validate names as if the pattern is surrounded by ^ and $.', async () => {
        const pattern = '-[0-9]+';
        const featureNaming = {
            pattern,
        };

        const features = ['a-95', '-95-', 'b-52-z'];
        const result = checkFeatureFlagNamesAgainstPattern(
            features,
            featureNaming.pattern,
        );

        expect(result).toMatchObject({
            state: 'invalid',
            invalidNames: new Set(features),
        });
    });
});
