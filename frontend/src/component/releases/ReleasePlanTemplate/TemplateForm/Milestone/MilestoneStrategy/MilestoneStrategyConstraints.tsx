import { FeatureStrategyConstraintAccordionList } from 'component/feature/FeatureStrategy/FeatureStrategyConstraints/FeatureStrategyConstraintAccordionList/FeatureStrategyConstraintAccordionList';
import type { IReleasePlanMilestoneStrategy } from 'interfaces/releasePlans';
import type { IConstraint } from 'interfaces/strategy';
import { useEffect } from 'react';

interface IMilestoneStrategyConstraintsProps {
    strategy: Omit<IReleasePlanMilestoneStrategy, 'milestoneId'>;
    setStrategy: React.Dispatch<
        React.SetStateAction<Omit<IReleasePlanMilestoneStrategy, 'milestoneId'>>
    >;
}

const filterConstraints = (constraint: any) => {
    if (
        constraint.hasOwnProperty('values') &&
        (!constraint.hasOwnProperty('value') || constraint.value === '')
    ) {
        return constraint.values && constraint.values.length > 0;
    }

    if (constraint.hasOwnProperty('value')) {
        return constraint.value !== '';
    }
};

export const MilestoneStrategyConstraints = ({
    strategy,
    setStrategy,
}: IMilestoneStrategyConstraintsProps) => {
    useEffect(() => {
        return () => {
            if (!strategy.constraints) {
                return;
            }

            // If the component is unmounting we want to remove all constraints that do not have valid single value or
            // valid multivalues
            setStrategy((prev) => ({
                ...prev,
                constraints: prev.constraints?.filter(filterConstraints),
            }));
        };
    }, []);

    const constraints = strategy.constraints || [];

    const setConstraints = (value: React.SetStateAction<IConstraint[]>) => {
        setStrategy((prev) => {
            return {
                ...prev,
                constraints:
                    value instanceof Function
                        ? value(prev.constraints || [])
                        : value,
            };
        });
    };

    return (
        <FeatureStrategyConstraintAccordionList
            constraints={constraints}
            setConstraints={setConstraints}
            showCreateButton={true}
        />
    );
};
