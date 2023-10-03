import { IFeatureStrategy, IStrategy } from 'interfaces/strategy';
import DefaultStrategy from 'component/feature/StrategyTypes/DefaultStrategy/DefaultStrategy';
import FlexibleStrategy from 'component/feature/StrategyTypes/FlexibleStrategy/FlexibleStrategy';
import UserWithIdStrategy from 'component/feature/StrategyTypes/UserWithIdStrategy/UserWithId';
import GeneralStrategy from 'component/feature/StrategyTypes/GeneralStrategy/GeneralStrategy';
import useUnleashContext from 'hooks/api/getters/useUnleashContext/useUnleashContext';
import produce from 'immer';
import React from 'react';
import { IFormErrors } from 'hooks/useFormErrors';

interface IFeatureStrategyTypeProps {
    hasAccess: boolean;
    strategy: Partial<IFeatureStrategy>;
    strategyDefinition: IStrategy;
    setStrategy: React.Dispatch<
        React.SetStateAction<Partial<IFeatureStrategy>>
    >;
    validateParameter: (name: string, value: string) => boolean;
    errors: IFormErrors;
}

export const FeatureStrategyType = ({
    hasAccess,
    strategy,
    strategyDefinition,
    setStrategy,
    validateParameter,
    errors,
}: IFeatureStrategyTypeProps) => {
    const { context } = useUnleashContext();

    const updateParameter = (name: string, value: string) => {
        setStrategy(
            produce(draft => {
                draft.parameters = draft.parameters ?? {};
                draft.parameters[name] = value;
            })
        );
        validateParameter(name, value);
    };

    switch (strategy.name) {
        case 'default':
            return <DefaultStrategy strategyDefinition={strategyDefinition} />;
        case 'flexibleRollout':
            return (
                <FlexibleStrategy
                    context={context}
                    parameters={strategy.parameters ?? {}}
                    updateParameter={updateParameter}
                    editable={hasAccess}
                />
            );
        case 'userWithId':
            return (
                <UserWithIdStrategy
                    parameters={strategy.parameters ?? {}}
                    updateParameter={updateParameter}
                    editable={hasAccess}
                    errors={errors}
                />
            );
        default:
            return (
                <GeneralStrategy
                    strategyDefinition={strategyDefinition}
                    parameters={strategy.parameters ?? {}}
                    updateParameter={updateParameter}
                    editable={hasAccess}
                    errors={errors}
                />
            );
    }
};
