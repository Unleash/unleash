import type { IFeatureNaming } from '../../types/model.js';

// The pattern has to match the whole name. It's wrapped in a group so that
// the anchors apply to all of it, including every branch of a top-level
// alternation such as `a-.+|b-.+`. Compiling the bare pattern first makes
// sure that it's a valid regular expression on its own and can't break out
// of that group.
const compileRegex = (pattern: string) => {
    new RegExp(pattern);
    return new RegExp(`^(?:${pattern})$`);
};

const tryCompileRegex = (pattern: string): RegExp | undefined => {
    try {
        return compileRegex(pattern);
    } catch {
        return undefined;
    }
};

const disallowedStrings = [' ', '\\t', '\\s', '\\n', '\\r', '\\f', '\\v'];

// Helper functions for error messages
const whitespaceError = (pattern: string) =>
    `Feature flag names cannot contain whitespace. You've provided a feature flag naming pattern that contains a whitespace character: "${pattern}". Remove any whitespace characters from your pattern.`;

const invalidPatternError = (pattern: string) =>
    `You've provided a feature flag naming pattern ("${pattern}") that isn't a valid regular expression.`;

const exampleMismatchError = (example: string, pattern: string) =>
    `You've provided a feature flag naming example ("${example}") that doesn't match your feature flag naming pattern ("${pattern}").`;

const invalidValueError = (valueName: string) =>
    `You've provided a feature flag naming ${valueName}, but no feature flag naming pattern. You must specify a pattern to use a ${valueName}.`;

export const checkFeatureNamingData = (
    featureNaming: IFeatureNaming,
):
    | { state: 'valid' }
    | { state: 'invalid'; reasons: [string, ...string[]] } => {
    const { pattern, example, description } = featureNaming;
    const errors: string[] = [];

    if (disallowedStrings.some((str) => pattern?.includes(str))) {
        errors.push(whitespaceError(pattern as string));
    } else if (pattern) {
        const regex = tryCompileRegex(pattern);
        if (!regex) {
            errors.push(invalidPatternError(pattern));
        } else if (example && !regex.test(example)) {
            errors.push(exampleMismatchError(example, pattern));
        }
    }

    if (!pattern && example) {
        errors.push(invalidValueError('example'));
    }

    if (!pattern && description) {
        errors.push(invalidValueError('description'));
    }

    const [first, ...rest] = errors;
    if (first) {
        return { state: 'invalid', reasons: [first, ...rest] };
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
