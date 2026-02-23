import type { IStrategy, StrategyFormState } from 'interfaces/strategy';
import DefaultStrategy from 'component/feature/StrategyTypes/DefaultStrategy/DefaultStrategy';
import OldFlexibleStrategy, {
    FlexibleStrategy,
} from 'component/feature/StrategyTypes/FlexibleStrategy/FlexibleStrategy';
import GeneralStrategy from 'component/feature/StrategyTypes/GeneralStrategy/GeneralStrategy';
import produce from 'immer';
import type React from 'react';
import type { IFormErrors } from 'hooks/useFormErrors';
import { useUiFlag } from 'hooks/useUiFlag';

interface IFeatureStrategyTypeProps<T extends StrategyFormState> {
    strategy: T;
    strategyDefinition: IStrategy;
    setStrategy: React.Dispatch<React.SetStateAction<T>>;
    validateParameter: (name: string, value: string) => boolean;
    errors: IFormErrors;
}

export const FeatureStrategyType = <T extends StrategyFormState>({
    strategy,
    strategyDefinition,
    setStrategy,
    validateParameter,
    errors,
}: IFeatureStrategyTypeProps<T>) => {
    const useNewFlexibleStrategy = useUiFlag('strategyFormConsolidation');
    const updateParameter = (name: string, value: string) => {
        setStrategy(
            produce((draft) => {
                draft.parameters = draft.parameters ?? {};
                draft.parameters[name] = value;
            }),
        );
        validateParameter(name, value);
    };

    switch (strategy.name) {
        case 'default':
            return <DefaultStrategy strategyDefinition={strategyDefinition} />;
        case 'flexibleRollout':
            return useNewFlexibleStrategy ? (
                <FlexibleStrategy
                    parameters={strategy.parameters ?? {}}
                    updateParameter={updateParameter}
                    editable={hasAccess}
                    errors={errors}
                />
            ) : (
                <OldFlexibleStrategy
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
