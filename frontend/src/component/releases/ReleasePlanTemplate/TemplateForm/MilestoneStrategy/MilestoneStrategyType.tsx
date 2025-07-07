import type { IFormErrors } from 'hooks/useFormErrors';
import type { IReleasePlanMilestoneStrategy } from 'interfaces/releasePlans';
import type { IStrategy } from 'interfaces/strategy';
import { MilestoneStrategyTypeFlexible } from './MilestoneStrategyTypeFlexible.tsx';
import GeneralStrategy from 'component/feature/StrategyTypes/GeneralStrategy/GeneralStrategy';
import DefaultStrategy from 'component/feature/StrategyTypes/DefaultStrategy/DefaultStrategy';

interface IMilestoneStrategyTypeProps {
    strategy: Omit<IReleasePlanMilestoneStrategy, 'milestoneId'>;
    strategyDefinition?: IStrategy;
    parameters: IReleasePlanMilestoneStrategy['parameters'];
    updateParameter: (field: string, value: string) => void;
    errors: IFormErrors;
}
export const MilestoneStrategyType = ({
    strategy,
    strategyDefinition,
    parameters,
    updateParameter,
    errors,
}: IMilestoneStrategyTypeProps) => {
    if (!strategyDefinition) {
        return null;
    }

    switch (strategy.strategyName) {
        case 'default':
            return <DefaultStrategy strategyDefinition={strategyDefinition} />;
        case 'flexibleRollout':
            return (
                <MilestoneStrategyTypeFlexible
                    parameters={parameters}
                    updateParameter={updateParameter}
                    errors={errors}
                    editable={true}
                />
            );
        default:
            return (
                <GeneralStrategy
                    strategyDefinition={strategyDefinition}
                    parameters={strategy.parameters ?? {}}
                    updateParameter={updateParameter}
                    editable={true}
                    errors={errors}
                />
            );
    }
};
