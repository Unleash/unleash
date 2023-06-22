import { BadDataError } from '../../error';

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
