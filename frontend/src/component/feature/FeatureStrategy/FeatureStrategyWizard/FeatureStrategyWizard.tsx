import { useEffect, useState } from 'react';
import { Box, Dialog, IconButton, styled, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import type { IReleasePlanTemplate } from 'interfaces/releasePlans';
import { ReleasePlanPreview } from '../FeatureStrategyMenu/ReleasePlanPreview.tsx';
import { useAddReleasePlan } from '../FeatureStrategyMenu/useAddReleasePlan.tsx';
import { StrategySetupCards } from './StrategySetupCards.tsx';
import { TemplateScreen } from './TemplateScreen.tsx';

const StyledHeader = styled(Box)(({ theme }) => ({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing(4, 4, 2, 4),
}));

type Screen =
    | { kind: 'cards' }
    | { kind: 'templates' }
    | { kind: 'preview'; template: IReleasePlanTemplate };

interface IFeatureStrategyWizardProps {
    projectId: string;
    featureId: string;
    environmentId: string;
    open: boolean;
    onClose: () => void;
    initialScreen?: 'cards' | 'templates';
}

export const FeatureStrategyWizard = ({
    projectId,
    featureId,
    environmentId,
    open,
    onClose,
    initialScreen = 'cards',
}: IFeatureStrategyWizardProps) => {
    const [screen, setScreen] = useState<Screen>({ kind: initialScreen });
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
        if (!open) return;
        setScreen({ kind: initialScreen });
    }, [open, initialScreen]);

    const screenContent = () => {
        switch (screen.kind) {
            case 'cards':
                return (
                    <StrategySetupCards
                        projectId={projectId}
                        featureId={featureId}
                        environmentId={environmentId}
                        onClose={onClose}
                        onShowTemplates={() => setScreen({ kind: 'templates' })}
                    />
                );
            case 'templates':
                return (
                    <TemplateScreen
                        projectId={projectId}
                        onAddReleasePlan={addReleasePlan}
                        onReviewReleasePlan={(template) =>
                            setScreen({ kind: 'preview', template })
                        }
                        onBack={
                            initialScreen === 'cards'
                                ? () => setScreen({ kind: 'cards' })
                                : undefined
                        }
                    />
                );
            case 'preview':
                return (
                    <ReleasePlanPreview
                        template={screen.template}
                        projectId={projectId}
                        featureName={featureId}
                        environment={environmentId}
                        activeReleasePlan={activeReleasePlan}
                        crProtected={crProtected}
                        onBack={() => setScreen({ kind: 'templates' })}
                        onConfirm={() => addReleasePlan(screen.template)}
                    />
                );
        }
    };

    return (
        <>
            <Dialog
                open={open}
                onClose={onClose}
                maxWidth='md'
                slotProps={{
                    paper: {
                        sx: {
                            borderRadius: '12px',
                            height: 'auto',
                            width: '100%',
                        },
                    },
                }}
            >
                <StyledHeader>
                    <Typography variant='h2'>
                        {screen.kind === 'templates'
                            ? 'Select template'
                            : 'Add strategy'}
                    </Typography>
                    <IconButton
                        size='medium'
                        onClick={onClose}
                        edge='end'
                        aria-label='close'
                    >
                        <CloseIcon />
                    </IconButton>
                </StyledHeader>
                {screenContent()}
            </Dialog>
            {confirmationDialog}
        </>
    );
};
