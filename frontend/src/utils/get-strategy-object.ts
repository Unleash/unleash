import { IStrategy, IParameter } from '../interfaces/strategy';
import { resolveDefaultParamValue } from './resolve-default-param-value';

export const getStrategyObject = (
    selectableStrategies: IStrategy[],
    name: string,
    featureId: string
) => {
    const selectedStrategy = selectableStrategies.find(
        strategy => strategy.name === name
    );
    const parameters = {} as IParameter;

    selectedStrategy?.parameters.forEach(({ name }: IParameter) => {
        parameters[name] = resolveDefaultParamValue(name, featureId);
    });

    return { name, parameters, constraints: [] };
};
