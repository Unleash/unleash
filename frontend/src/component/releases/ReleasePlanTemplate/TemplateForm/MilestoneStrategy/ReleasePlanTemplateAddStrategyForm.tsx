import { Button } from '@mui/material';
import FormTemplate from 'component/common/FormTemplate/FormTemplate';
import type { IReleasePlanMilestoneStrategy } from 'interfaces/releasePlans';
import { useState } from 'react';
import { useFormErrors } from 'hooks/useFormErrors';
import { useConstraintsValidation } from 'hooks/api/getters/useConstraintsValidation/useConstraintsValidation';
import {
    featureStrategyDocsLink,
    featureStrategyDocsLinkLabel,
    featureStrategyHelp,
} from 'component/feature/FeatureStrategy/FeatureStrategyEdit/FeatureStrategyEdit';
import { useStrategy } from 'hooks/api/getters/useStrategy/useStrategy';
import { StrategyFormBody } from 'component/feature/FeatureStrategy/FeatureStrategyForm/StrategyFormBody.tsx';

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
        <FormTemplate
            modal
            disablePadding
            description={featureStrategyHelp}
            documentationLink={featureStrategyDocsLink}
            documentationLinkLabel={featureStrategyDocsLinkLabel}
        >
            <StrategyFormBody
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
                <Button
                    variant='contained'
                    color='primary'
                    type='submit'
                    disabled={!hasValidConstraints || errors.hasFormErrors()}
                >
                    {editMode ? 'Add changes' : 'Add strategy'}
                </Button>
                <Button onClick={onCancel}>Cancel</Button>
            </StrategyFormBody>
        </FormTemplate>
    );
};
