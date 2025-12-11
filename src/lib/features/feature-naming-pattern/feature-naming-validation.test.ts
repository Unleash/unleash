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
