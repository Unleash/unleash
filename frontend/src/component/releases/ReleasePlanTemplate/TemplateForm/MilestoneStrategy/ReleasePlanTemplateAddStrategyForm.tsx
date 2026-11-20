import { Button } from '@mui/material';
import type { IReleasePlanMilestoneStrategy } from 'interfaces/releasePlans';
import { useState } from 'react';
import { useFormErrors } from 'hooks/useFormErrors';
import { withIncompleteConstraintsDiscarded } from 'hooks/api/getters/useConstraintsValidation/useConstraintsValidation';
import { useUiFlag } from 'hooks/useUiFlag';
import { useStrategy } from 'hooks/api/getters/useStrategy/useStrategy';
import { StrategyFormBodySelector } from 'component/feature/FeatureStrategy/FeatureStrategyForm/StrategyFormBodySelector.tsx';
import { StrategyFormTemplate } from 'component/feature/FeatureStrategy/FeatureStrategyForm/StrategyFormTemplate';
import { FormFocusProvider } from 'component/feature/FeatureStrategy/FeatureStrategyForm/formFocus.tsx';
import { useStrategyFormValidation } from 'component/feature/FeatureStrategy/FeatureStrategyForm/useStrategyFormValidation.ts';

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
    const singlePageStrategyForm = useUiFlag('singlePageStrategyForm');
    const errors = useFormErrors();
    const { strategyDefinition } = useStrategy(normalizedStrategyName);
    const {
        focusRegistry,
        failedVariantsSubmit,
        clearFailedVariantsSubmit,
        validateParameter,
        formIsValid,
        validatingConstraints,
        legacyFormHasBlockingErrors,
    } = useStrategyFormValidation({
        strategy: currentStrategy,
        strategyDefinition,
        errors,
    });

    if (!strategyDefinition) {
        return null;
    }

    const onSubmit = async () => {
        if (!(await formIsValid())) return;

        onAddUpdateStrategy(
            singlePageStrategyForm
                ? withIncompleteConstraintsDiscarded(currentStrategy)
                : currentStrategy,
        );
    };

    return (
        <StrategyFormTemplate>
            <FormFocusProvider registry={focusRegistry}>
                <StrategyFormBodySelector
                    strategy={currentStrategy}
                    setStrategy={setCurrentStrategy}
                    strategyDefinition={strategyDefinition}
                    errors={errors}
                    failedVariantsSubmit={failedVariantsSubmit}
                    clearFailedVariantsSubmit={clearFailedVariantsSubmit}
                    validateParameter={validateParameter}
                    canRenamePreexistingVariants
                    groupIdTooltip={
                        <>
                            Supports <strong>{'{{featureName}}'}</strong> as a
                            template variable. If not set, defaults to the
                            feature flag name.
                        </>
                    }
                    onSubmit={onSubmit}
                >
                    <Button onClick={onCancel}>Cancel</Button>
                    <Button
                        variant='contained'
                        color='primary'
                        type='submit'
                        disabled={
                            validatingConstraints || legacyFormHasBlockingErrors
                        }
                    >
                        {editMode ? 'Add changes' : 'Add strategy'}
                    </Button>
                </StrategyFormBodySelector>
            </FormFocusProvider>
        </StrategyFormTemplate>
    );
};
