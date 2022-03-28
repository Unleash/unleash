import { IFeatureStrategy } from 'interfaces/strategy';
import DefaultStrategy from 'component/feature/StrategyTypes/DefaultStrategy/DefaultStrategy';
import FlexibleStrategy from 'component/feature/StrategyTypes/FlexibleStrategy/FlexibleStrategy';
import UserWithIdStrategy from 'component/feature/StrategyTypes/UserWithIdStrategy/UserWithId';
import GeneralStrategy from 'component/feature/StrategyTypes/GeneralStrategy/GeneralStrategy';
import { useStrategies } from 'hooks/api/getters/useStrategies/useStrategies';
import useUnleashContext from 'hooks/api/getters/useUnleashContext/useUnleashContext';
import produce from 'immer';
import React from 'react';

interface IFeatureStrategyTypeProps {
    hasAccess: boolean;
    strategy: Partial<IFeatureStrategy>;
    setStrategy: React.Dispatch<
        React.SetStateAction<Partial<IFeatureStrategy>>
    >;
}

export const FeatureStrategyType = ({
    hasAccess,
    strategy,
    setStrategy,
}: IFeatureStrategyTypeProps) => {
    const { strategies } = useStrategies();
    const { context } = useUnleashContext();

    const strategyDefinition = strategies.find(definition => {
        return definition.name === strategy.name;
    });

    const updateParameter = (field: string, value: unknown) => {
        setStrategy(
            produce(draft => {
                draft.parameters = draft.parameters ?? {};
                draft.parameters[field] = value;
            })
        );
    };

    if (!strategyDefinition) {
        return null;
    }

    switch (strategy.name) {
        case 'default':
            return <DefaultStrategy strategyDefinition={strategyDefinition} />;
        case 'flexibleRollout':
            return (
                <FlexibleStrategy
                    context={context}
                    parameters={strategy.parameters ?? []}
                    updateParameter={updateParameter}
                    editable={hasAccess}
                />
            );
        case 'userWithId':
            return (
                <UserWithIdStrategy
                    parameters={strategy.parameters ?? []}
                    updateParameter={updateParameter}
                    editable={hasAccess}
                />
            );
        default:
            return (
                <GeneralStrategy
                    strategyDefinition={strategyDefinition}
                    parameters={strategy.parameters ?? []}
                    updateParameter={updateParameter}
                    editable={hasAccess}
                />
            );
    }
};
