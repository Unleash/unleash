import type { IFeatureToggle } from 'interfaces/featureToggle';
import type {
    StrategyFormParameters,
    StrategyFormState,
} from 'interfaces/strategy';
import type {
    CreateFeatureStrategySchema,
    ParametersSchema,
} from 'openapi/index.js';
import { deepOmit, type DeepOmit } from '../../../utils/deepOmit.js';

const isDefined = (
    parameter: [string, string | undefined],
): parameter is [string, string] => parameter[1] !== undefined;

const dropUndefined = (
    parameters: StrategyFormParameters = {},
): ParametersSchema =>
    Object.fromEntries(Object.entries(parameters).filter(isDefined));

export const createStrategyPayload = (
    strategy: StrategyFormState,
): CreateFeatureStrategySchema => ({
    name: strategy.name,
    title: strategy.title,
    constraints: strategy.constraints ?? [],
    parameters: dropUndefined(strategy.parameters),
    variants: strategy.variants ?? [],
    segments: strategy.segments ?? [],
    disabled: strategy.disabled ?? false,
});

export const comparisonModerator = (
    data: IFeatureToggle,
): DeepOmit<IFeatureToggle, keyof IFeatureToggle> => {
    const tempData = { ...data };

    return deepOmit(
        tempData,
        'lastSeenAt',
        'yes',
        'no',
        'lifecycle',
        'collaborators',
        'releasePlans',
    );
};
