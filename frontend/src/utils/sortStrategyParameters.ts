import type { IStrategy, IFeatureStrategy } from 'interfaces/strategy';
import type { ParametersSchema } from 'openapi';

// Sort the keys in a parameters payload object by the
// order of the parameters in the strategy definition.
export const sortStrategyParameters = (
    parameters: ParametersSchema,
    strategyDefinition: IStrategy,
): Partial<IFeatureStrategy> => {
    const sortedParameterNames = strategyDefinition.parameters.map(
        (parameter) => parameter.name,
    );

    return Object.fromEntries(
        Object.entries(parameters).sort(
            (a, b) =>
                sortedParameterNames.indexOf(a[0]) -
                sortedParameterNames.indexOf(b[0]),
        ),
    );
};
