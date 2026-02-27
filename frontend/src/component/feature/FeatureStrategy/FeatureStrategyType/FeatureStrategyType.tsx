import type { IStrategy, StrategyFormState } from 'interfaces/strategy';
import DefaultStrategy from 'component/feature/StrategyTypes/DefaultStrategy/DefaultStrategy';
import LegacyFlexibleStrategy, {
    FlexibleStrategy,
} from 'component/feature/StrategyTypes/FlexibleStrategy/FlexibleStrategy';
import GeneralStrategy from 'component/feature/StrategyTypes/GeneralStrategy/GeneralStrategy';
import type { IFormErrors } from 'hooks/useFormErrors';
import produce from 'immer';

interface IFeatureStrategyTypeProps<T extends StrategyFormState> {
    strategy: T;
    strategyDefinition: IStrategy;
    updateParameter: (field: string, value: string) => void;
    errors: IFormErrors;
}

// todo: delete with flag `strategyFormConsolidation`
interface ILegacyFeatureStrategyTypeProps<T extends StrategyFormState> {
    strategy: T;
    strategyDefinition: IStrategy;
    setStrategy: React.Dispatch<React.SetStateAction<T>>;
    validateParameter: (name: string, value: string) => boolean;
    errors: IFormErrors;
}

// todo: delete with flag `strategyFormConsolidation`
export const LegacyFeatureStrategyType = <T extends StrategyFormState>({
    strategy,
    strategyDefinition,
    setStrategy,
    validateParameter,
    errors,
}: ILegacyFeatureStrategyTypeProps<T>) => {
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
            return (
                <LegacyFlexibleStrategy
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
