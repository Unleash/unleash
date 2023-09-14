import { IFeatureNaming } from '../../types/model';

const compileRegex = (pattern: string) => new RegExp(`^${pattern}$`);

export const checkFeatureNamingData = (
    featureNaming?: IFeatureNaming,
):
    | { state: 'valid' }
    | { state: 'invalid'; reasons: [string, ...string[]] } => {
    if (featureNaming) {
        const { pattern, example, description } = featureNaming;
        const errors: string[] = [];
        const disallowedStrings = [
            ' ',
            '\\t',
            '\\s',
            '\\n',
            '\\r',
            '\\f',
            '\\v',
        ];

        if (disallowedStrings.some((str) => pattern.includes(str))) {
            return {
                state: 'invalid',
                reason: `Feature flag names can not contain whitespace. You've provided a feature flag naming pattern that contains a whitespace character: "${pattern}". Remove any whitespace characters from your pattern.`,
            };
        } else if (pattern && example && !example.match(compileRegex(pattern))) {
            errors.push(
                `You've provided a feature flag naming example ("${example}") that doesn't match your feature flag naming pattern ("${pattern}"). Please provide an example that matches your supplied pattern. Bear in mind that the pattern must match the whole example, as if it were surrounded by '^' and "$".`,
            );
        }

        if (!pattern && example) {
            errors.push(
                "You've provided a feature flag naming example, but no feature flag naming pattern. You must specify a pattern to use an example.",
            );
        }

        if (!pattern && description) {
            errors.push(
                "You've provided a feature flag naming pattern description, but no feature flag naming pattern. You must have a pattern to use a description.",
            );
        }

        const [first, ...rest] = errors;
        if (first) {
            return { state: 'invalid', reasons: [first, ...rest] };
        }
    }

    return { state: 'valid' };
};

export type FeatureNameCheckResult =
    | { state: 'valid' }
    | {
          state: 'invalid';
          invalidNames: Set<string>;
      };

export const checkFeatureFlagNamesAgainstPattern = (
    featureNames: string[],
    pattern: string | null | undefined,
): FeatureNameCheckResult => {
    if (pattern) {
        const regex = compileRegex(pattern);
        const mismatchedNames = featureNames.filter(
            (name) => !regex.test(name),
        );

        if (mismatchedNames.length > 0) {
            return {
                state: 'invalid',
                invalidNames: new Set(mismatchedNames),
            };
        }
    }
    return { state: 'valid' };
};
