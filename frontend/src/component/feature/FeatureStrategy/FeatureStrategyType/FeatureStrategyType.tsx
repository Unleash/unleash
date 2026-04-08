import type { IStrategy, StrategyFormState } from 'interfaces/strategy';
import DefaultStrategy from 'component/feature/StrategyTypes/DefaultStrategy/DefaultStrategy';
import { FlexibleStrategy } from 'component/feature/StrategyTypes/FlexibleStrategy/FlexibleStrategy';
import GeneralStrategy from 'component/feature/StrategyTypes/GeneralStrategy/GeneralStrategy';
import type { IFormErrors } from 'hooks/useFormErrors';

interface IFeatureStrategyTypeProps<T extends StrategyFormState> {
    strategy: T;
    strategyDefinition: IStrategy;
    updateParameter: (field: string, value: string) => void;
    errors: IFormErrors;
}

export const FeatureStrategyType = <T extends StrategyFormState>({
    strategy,
    strategyDefinition,
    updateParameter,
    errors,
}: IFeatureStrategyTypeProps<T>) => {
    switch (strategy.name) {
        case 'default':
            return <DefaultStrategy strategyDefinition={strategyDefinition} />;
        case 'flexibleRollout':
            return (
                <FlexibleStrategy
                    parameters={strategy.parameters ?? {}}
                    updateParameter={updateParameter}
                    errors={errors}
                />
            );
        default:
            return (
                <GeneralStrategy
                    strategyDefinition={strategyDefinition}
                    parameters={strategy.parameters ?? {}}
                    updateParameter={updateParameter}
                    errors={errors}
                />
            );
    }
};
