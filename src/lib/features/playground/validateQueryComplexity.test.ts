import { validateQueryComplexity } from './validateQueryComplexity';
import { BadDataError } from '../../error';

test('should not throw error when total combinations are under MAX_COMPLEXITY', () => {
    const environmentsCount = 10;
    const featuresCount = 10;
    const contextCombinationsCount = 10;

    expect(() =>
        validateQueryComplexity(
            environmentsCount,
            featuresCount,
            contextCombinationsCount,
        ),
    ).not.toThrow();
});

test('should throw BadDataError when total combinations are over MAX_COMPLEXITY', () => {
    const environmentsCount = 2;
    const featuresCount = 200;
    const contextCombinationsCount = 10000;

    const expectedMessage = `Rejecting evaluation as it would generate 4000000 combinations exceeding 30000 limit. Please reduce the number of selected environments (2), features (200), context field combinations (10000).`;

    expect(() =>
        validateQueryComplexity(
            environmentsCount,
            featuresCount,
            contextCombinationsCount,
        ),
    ).toThrow(BadDataError);
    expect(() =>
        validateQueryComplexity(
            environmentsCount,
            featuresCount,
            contextCombinationsCount,
        ),
    ).toThrow(expectedMessage);
});
