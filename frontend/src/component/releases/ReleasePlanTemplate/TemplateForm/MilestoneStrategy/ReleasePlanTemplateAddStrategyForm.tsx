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
import { useUiFlag } from 'hooks/useUiFlag.ts';
import { StrategyFormBody } from 'component/feature/FeatureStrategy/FeatureStrategyForm/StrategyFormBody.tsx';
import { LegacyReleasePlanTemplateAddStrategyForm } from './LegacyReleasePlanTemplateAddStrategyForm.tsx';

export interface IReleasePlanTemplateAddStrategyFormProps {
    onCancel: () => void;
    strategy: Omit<IReleasePlanMilestoneStrategy, 'milestoneId'>;
    onAddUpdateStrategy: (
        strategy: Omit<IReleasePlanMilestoneStrategy, 'milestoneId'>,
    ) => void;
    editMode: boolean;
}

const NewReleasePlanTemplateAddStrategyForm = ({
    onCancel,
    strategy,
    onAddUpdateStrategy,
    editMode,
}: IReleasePlanTemplateAddStrategyFormProps) => {
    const [currentStrategy, setCurrentStrategy] = useState({
        ...strategy,
        name: strategy.name || strategy.strategyName || '',
    });
    const hasValidConstraints = useConstraintsValidation(strategy?.constraints);
    const errors = useFormErrors();

    if (!strategy || !currentStrategy) {
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
                errors={errors}
                canRenamePreexistingVariants
                onSubmit={(e) => {
                    e.preventDefault();
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

export const ReleasePlanTemplateAddStrategyForm = (
    props: IReleasePlanTemplateAddStrategyFormProps,
) => {
    const useConsolidated = useUiFlag('strategyFormConsolidation');
    return useConsolidated ? (
        <NewReleasePlanTemplateAddStrategyForm {...props} />
    ) : (
        <LegacyReleasePlanTemplateAddStrategyForm {...props} />
    );
};
