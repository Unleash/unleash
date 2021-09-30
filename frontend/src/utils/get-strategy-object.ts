import { resolveDefaultParamValue } from '../component/feature/strategy/AddStrategy/utils';
import { IStrategy, IParameter } from '../interfaces/strategy';

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
