import type { IStrategy, StrategyFormState } from 'interfaces/strategy';
import DefaultStrategy from 'component/feature/StrategyTypes/DefaultStrategy/DefaultStrategy';
import GeneralStrategy from 'component/feature/StrategyTypes/GeneralStrategy/GeneralStrategy';
import type { IFormErrors } from 'hooks/useFormErrors';
import { LegacyFlexibleStrategy } from 'component/feature/StrategyTypes/FlexibleStrategy/LegacyFlexibleStrategy';

interface IFeatureStrategyTypeProps<T extends StrategyFormState> {
    strategy: T;
    strategyDefinition: IStrategy;
    updateParameter: (field: string, value: string) => void;
    errors: IFormErrors;
    groupIdTooltip?: React.ReactNode;
}

export const LegacyFeatureStrategyType = <T extends StrategyFormState>({
    strategy,
    strategyDefinition,
    updateParameter,
    errors,
    groupIdTooltip,
}: IFeatureStrategyTypeProps<T>) => {
    switch (strategy.name) {
        case 'default':
            return <DefaultStrategy strategyDefinition={strategyDefinition} />;
        case 'flexibleRollout':
            return (
                <LegacyFlexibleStrategy
                    parameters={strategy.parameters ?? {}}
                    updateParameter={updateParameter}
                    errors={errors}
                    groupIdTooltip={groupIdTooltip}
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
