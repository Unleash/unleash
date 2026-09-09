import { useEffect, useState } from 'react';
import { Box, Dialog, IconButton, styled, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import type { IReleasePlanTemplate } from 'interfaces/releasePlans';
import { ReleasePlanPreview } from './ReleasePlanPreview.tsx';
import {
    FeatureStrategyMenuCards,
    type StrategyFilterValue,
} from './FeatureStrategyMenuCards/FeatureStrategyMenuCards.tsx';
import { useAddReleasePlan } from './useAddReleasePlan.tsx';
import { useUiFlag } from 'hooks/useUiFlag';
import { FeatureStrategyWizard } from '../FeatureStrategyWizard/FeatureStrategyWizard.tsx';

interface IFeatureStrategyMenuProps {
    projectId: string;
    featureId: string;
    environmentId: string;
    isStrategyMenuDialogOpen: boolean;
    onClose: () => void;
    defaultFilter?: StrategyFilterValue;
}

const StyledHeader = styled(Box)(({ theme }) => ({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing(4, 4, 2, 4),
}));

export const FeatureStrategyMenu = (props: IFeatureStrategyMenuProps) => {
    const simplerStrategySetup = useUiFlag('simplerStrategySetup');

    if (simplerStrategySetup) {
        return (
            <FeatureStrategyWizard
                projectId={props.projectId}
                featureId={props.featureId}
                environmentId={props.environmentId}
                open={props.isStrategyMenuDialogOpen}
                onClose={props.onClose}
                initialScreen={
                    props.defaultFilter === 'releaseTemplates'
                        ? 'templates'
                        : 'cards'
                }
            />
        );
    }

    return <StrategyMenuDialog {...props} />;
};

const StrategyMenuDialog = ({
    projectId,
    featureId,
    environmentId,
    isStrategyMenuDialogOpen,
    onClose,
    defaultFilter = null,
}: IFeatureStrategyMenuProps) => {
    const [filter, setFilter] = useState<StrategyFilterValue>(defaultFilter);
    const [previewTemplate, setPreviewTemplate] =
        useState<IReleasePlanTemplate>();
    const [releasePlanPreview, setReleasePlanPreview] = useState(false);
    const {
        addReleasePlan,
        activeReleasePlan,
        crProtected,
        confirmationDialog,
    } = useAddReleasePlan({
        projectId,
        featureId,
        environmentId,
        onClose,
    });

    useEffect(() => {
        if (!isStrategyMenuDialogOpen) return;
        setReleasePlanPreview(false);
        setFilter(defaultFilter);
    }, [isStrategyMenuDialogOpen, defaultFilter]);

    return (
        <>
            <Dialog
                open={isStrategyMenuDialogOpen}
                onClose={onClose}
                maxWidth='md'
                slotProps={{
                    paper: {
                        sx: {
                            borderRadius: '12px',
                            height: '100%',
                            width: '100%',
                        },
                    },
                }}
            >
                <>
                    <StyledHeader>
                        <Typography variant='h2'>Add strategy</Typography>
                        <IconButton
                            size='medium'
                            onClick={onClose}
                            edge='end'
                            aria-label='close'
                        >
                            <CloseIcon />
                        </IconButton>
                    </StyledHeader>
                    {releasePlanPreview && previewTemplate ? (
                        <ReleasePlanPreview
                            template={previewTemplate}
                            projectId={projectId}
                            featureName={featureId}
                            environment={environmentId}
                            activeReleasePlan={activeReleasePlan}
                            crProtected={crProtected}
                            onBack={() => setReleasePlanPreview(false)}
                            onConfirm={() => {
                                addReleasePlan(previewTemplate);
                            }}
                        />
                    ) : (
                        <FeatureStrategyMenuCards
                            projectId={projectId}
                            featureId={featureId}
                            environmentId={environmentId}
                            filter={filter}
                            setFilter={setFilter}
                            onAddReleasePlan={addReleasePlan}
                            onReviewReleasePlan={(template) => {
                                setPreviewTemplate(template);
                                setReleasePlanPreview(true);
                            }}
                            onClose={onClose}
                        />
                    )}
                </>
            </Dialog>
            {confirmationDialog}
        </>
    );
};
