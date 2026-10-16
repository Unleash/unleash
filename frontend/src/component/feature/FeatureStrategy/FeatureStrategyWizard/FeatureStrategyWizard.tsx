import { useEffect, useState } from 'react';
import { Box, Dialog, IconButton, styled, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import type { IReleasePlanTemplate } from 'interfaces/releasePlans';
import { useTracking } from 'hooks/useTracking';
import {
    type DialogDismissMethod,
    dismissMethodFromCloseReason,
} from 'utils/trackingEvents';
import {
    selectStrategySetupTracking,
    type StrategySetupScreen,
} from '../strategyActionsTracking.ts';
import { ReleasePlanPreview } from '../FeatureStrategyMenu/ReleasePlanPreview.tsx';
import { useAddReleasePlan } from '../FeatureStrategyMenu/useAddReleasePlan.tsx';
import { StrategySetupCards } from './StrategySetupCards.tsx';
import { TemplateScreen } from './TemplateScreen.tsx';

const StyledHeader = styled(Box)(({ theme }) => ({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing(3, 3, 2, 3),
}));

// match the 'cards' height.
const DIALOG_MIN_HEIGHT = 340;

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
    initialScreen?: StrategySetupScreen;
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
    const trackStrategySetup = useTracking(
        selectStrategySetupTracking({ initialScreen }),
    );
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
        trackStrategySetup('opened');
    }, [open, initialScreen, trackStrategySetup]);

    const dismiss = (method: DialogDismissMethod) => {
        trackStrategySetup('dismissed', { method });
        onClose();
    };

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
                onClose={(_, reason) =>
                    dismiss(dismissMethodFromCloseReason(reason))
                }
                maxWidth='md'
                slotProps={{
                    paper: {
                        sx: {
                            borderRadius: '12px',
                            height: 'auto',
                            width: '100%',
                            minHeight: DIALOG_MIN_HEIGHT,
                        },
                    },
                }}
            >
                <StyledHeader>
                    <Typography variant='h2'>
                        {screen.kind === 'cards'
                            ? 'Add strategy'
                            : 'Select template'}
                    </Typography>
                    <IconButton
                        size='medium'
                        onClick={() => dismiss('close-icon')}
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
