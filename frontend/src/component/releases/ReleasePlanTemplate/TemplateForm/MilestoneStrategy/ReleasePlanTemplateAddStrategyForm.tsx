import { Button } from '@mui/material';
import type { IReleasePlanMilestoneStrategy } from 'interfaces/releasePlans';
import { useState } from 'react';
import { useFormErrors } from 'hooks/useFormErrors';
import { useConstraintsValidation } from 'hooks/api/getters/useConstraintsValidation/useConstraintsValidation';
import { useStrategy } from 'hooks/api/getters/useStrategy/useStrategy';
import { StrategyFormBodySelector } from 'component/feature/FeatureStrategy/FeatureStrategyForm/StrategyFormBodySelector.tsx';
import { StrategyFormTemplate } from 'component/feature/FeatureStrategy/FeatureStrategyForm/StrategyFormTemplate';

export interface IReleasePlanTemplateAddStrategyFormProps {
    onCancel: () => void;
    strategy: Omit<IReleasePlanMilestoneStrategy, 'milestoneId'>;
    onAddUpdateStrategy: (
        strategy: Omit<IReleasePlanMilestoneStrategy, 'milestoneId'>,
    ) => void;
    editMode: boolean;
}

export const ReleasePlanTemplateAddStrategyForm = ({
    onCancel,
    strategy,
    onAddUpdateStrategy,
    editMode,
}: IReleasePlanTemplateAddStrategyFormProps) => {
    const normalizedStrategyName = strategy.name || strategy.strategyName;
    const [currentStrategy, setCurrentStrategy] = useState({
        ...strategy,
        name: normalizedStrategyName || '',
    });
    const hasValidConstraints = useConstraintsValidation(
        currentStrategy?.constraints,
    );
    const errors = useFormErrors();
    const { strategyDefinition } = useStrategy(normalizedStrategyName);

    if (!strategyDefinition) {
        return null;
    }

    return (
        <StrategyFormTemplate>
            <StrategyFormBodySelector
                strategy={currentStrategy}
                setStrategy={setCurrentStrategy}
                strategyDefinition={strategyDefinition}
                errors={errors}
                canRenamePreexistingVariants
                groupIdTooltip={
                    <>
                        Supports <strong>{'{{featureName}}'}</strong> as a
                        template variable. If not set, defaults to the feature
                        flag name.
                    </>
                }
                onSubmit={(_) => {
                    onAddUpdateStrategy(currentStrategy);
                }}
            >
                <Button onClick={onCancel}>Cancel</Button>
                <Button
                    variant='contained'
                    color='primary'
                    type='submit'
                    disabled={!hasValidConstraints || errors.hasFormErrors()}
                >
                    {editMode ? 'Add changes' : 'Add strategy'}
                </Button>
            </StrategyFormBodySelector>
        </StrategyFormTemplate>
    );
};
