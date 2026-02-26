import { Button, styled } from '@mui/material';
import FormTemplate from 'component/common/FormTemplate/FormTemplate';
import type { IReleasePlanMilestoneStrategy } from 'interfaces/releasePlans';
import { useState } from 'react';
import { useFormErrors } from 'hooks/useFormErrors';
import produce from 'immer';
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

const StyledCancelButton = styled(Button)(({ theme }) => ({
    marginLeft: theme.spacing(3),
}));

const StyledButtonContainer = styled('div')(({ theme }) => ({
    marginTop: 'auto',
    display: 'flex',
    justifyContent: 'flex-end',
    gap: theme.spacing(1),
    paddingTop: theme.spacing(3),
    paddingRight: theme.spacing(6),
    paddingLeft: theme.spacing(6),
    paddingBottom: theme.spacing(6),
    backgroundColor: theme.palette.background.paper,
    borderTop: `1px solid ${theme.palette.divider}`,
}));

const StyledContentDiv = styled('div')(({ theme }) => ({
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
    padding: theme.spacing(6),
    paddingBottom: theme.spacing(16),
    paddingTop: theme.spacing(4),
    overflow: 'auto',
    height: '100%',
}));

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

    const updateParameter = (name: string, value: string) => {
        setCurrentStrategy(
            produce((draft) => {
                if (!draft) {
                    return;
                }
                draft.parameters = draft.parameters ?? {};
                draft.parameters[name] = value;
            }),
        );
    };

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
                updateParameter={updateParameter}
                onTitleChange={(title) => {
                    setCurrentStrategy((prev) => ({
                        ...prev,
                        title,
                    }));
                }}
                canRenamePreexistingVariants
                renderContentWrapper={(tabContent) => (
                    <StyledContentDiv>{tabContent}</StyledContentDiv>
                )}
            />
            <StyledButtonContainer>
                <Button
                    variant='contained'
                    color='primary'
                    type='submit'
                    disabled={!hasValidConstraints || errors.hasFormErrors()}
                    onClick={() => onAddUpdateStrategy(currentStrategy)}
                >
                    {editMode ? 'Add changes' : 'Add strategy'}
                </Button>
                <StyledCancelButton onClick={onCancel}>
                    Cancel
                </StyledCancelButton>
            </StyledButtonContainer>
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
