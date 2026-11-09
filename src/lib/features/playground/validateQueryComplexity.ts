import { BadDataError } from '../../error/index.js';

const MAX_COMPLEXITY = 30000;

export const validateQueryComplexity = (
    environmentsCount: number,
    featuresCount: number,
    contextCombinationsCount: number,
    limit = MAX_COMPLEXITY,
): void => {
    const totalCount =
        environmentsCount * featuresCount * contextCombinationsCount;

    const reason = `Rejecting evaluation as it would generate ${totalCount} combinations exceeding ${limit} limit. `;
    const action = `Please reduce the number of selected environments (${environmentsCount}), features (${featuresCount}), context field combinations (${contextCombinationsCount}).`;

    if (totalCount > limit) {
        throw new BadDataError(reason + action);
    }
};

export const validateContextComplexity = (
    contextCombinationsCount: number,
    limit = MAX_COMPLEXITY,
): void => {
    if (contextCombinationsCount > limit) {
        throw new BadDataError(
            `Rejecting evaluation as the context would expand into ${contextCombinationsCount} combinations exceeding ${limit} limit. Please reduce the number of comma separated values in the context fields.`,
        );
    }
};
