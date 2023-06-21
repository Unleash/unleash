import { BadDataError } from '../../error';

const MAX_COMPLEXITY = 30000;

export const validateQueryComplexity = (
    environmentsCount: number,
    featuresCount: number,
    contextCombinationsCount: number,
): void => {
    const totalCount =
        environmentsCount * featuresCount * contextCombinationsCount;

    const reason = `Rejecting evaluation as it would generate ${totalCount} combinations exceeding ${MAX_COMPLEXITY} limit. `;
    const action = `Please reduce the number of selected environments (${environmentsCount}), features (${featuresCount}), context field combinations (${contextCombinationsCount}).`;

    if (totalCount > MAX_COMPLEXITY) {
        throw new BadDataError(reason + action);
    }
};
