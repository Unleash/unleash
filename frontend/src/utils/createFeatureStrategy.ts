import {
    IStrategy,
    IFeatureStrategy,
    IFeatureStrategyParameters,
    IStrategyParameter,
} from 'interfaces/strategy';

// Create a new feature strategy with default values from a strategy definition.
export const createFeatureStrategy = (
    featureId: string,
    strategyDefinition: IStrategy
): Omit<IFeatureStrategy, 'id'> => {
    const parameters: IFeatureStrategyParameters = {};

    strategyDefinition.parameters.forEach((parameter: IStrategyParameter) => {
        parameters[parameter.name] = createFeatureStrategyParameterValue(
            featureId,
            parameter
        );
    });

    return {
        name: strategyDefinition.name,
        constraints: [],
        parameters,
    };
};

// Create default feature strategy parameter values from a strategy definition.
const createFeatureStrategyParameterValue = (
    featureId: string,
    parameter: IStrategyParameter
): string => {
    if (
        parameter.name === 'rollout' ||
        parameter.name === 'percentage' ||
        parameter.type === 'percentage'
    ) {
        return '50';
    }

    if (parameter.name === 'stickiness') {
        return 'default';
    }

    if (parameter.name === 'groupId') {
        return featureId;
    }

    if (parameter.type === 'boolean') {
        return 'false';
    }

    return '';
};
