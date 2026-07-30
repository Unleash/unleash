import { useEffect, useState } from 'react';
import { IconButton, styled, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import RemoveIcon from '@mui/icons-material/Remove';
import useProjects from 'hooks/api/getters/useProjects/useProjects';
import { CreateFeatureDialog } from 'component/project/Project/PaginatedProjectFeatureToggles/ProjectFeatureTogglesHeader/CreateFeatureDialog.tsx';
import { ConnectSdkDialog } from 'component/onboarding/dialog/ConnectSdkDialog/ConnectSdkDialog.tsx';
import { useQuickTour } from 'component/onboarding/quickTourDemo/QuickTourProvider.tsx';
import {
    OnboardingProgressBadge,
    useFloatingOnboardingChecklist,
} from './FloatingOnboardingChecklistContext.tsx';
import { ChecklistSteps } from './ChecklistSteps.tsx';

const Window = styled('aside')(({ theme }) => ({
    position: 'fixed',
    bottom: theme.spacing(3),
    right: theme.spacing(3),
    width: 380,
    maxWidth: `calc(100vw - ${theme.spacing(4)})`,
    maxHeight: `calc(100vh - ${theme.spacing(6)})`,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    backgroundColor: theme.palette.background.paper,
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadiusLarge,
    boxShadow: theme.boxShadows.popup,
    zIndex: 1100,
    [theme.breakpoints.down('sm')]: {
        left: theme.spacing(2),
        right: theme.spacing(2),
        width: 'auto',
    },
}));

const Header = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    padding: theme.spacing(1, 1, 1, 2),
    borderBottom: `1px solid ${theme.palette.divider}`,
    flexShrink: 0,
}));

const TitleRow = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    flexGrow: 1,
    minWidth: 0,
    cursor: 'pointer',
}));

const HeaderTitle = styled(Typography)(({ theme }) => ({
    fontSize: theme.typography.body2.fontSize,
    fontWeight: theme.typography.fontWeightBold,
}));

const Body = styled('div')({
    overflowY: 'auto',
});

export const FloatingOnboardingChecklist = () => {
    const {
        state,
        update,
        markCompleted,
        projectId,
        quickTourEnabled,
        done,
        environments,
        goToFlagHref,
        feature,
        refetchOverview,
    } = useFloatingOnboardingChecklist();

    const { projects } = useProjects();
    const { open: openQuickTour } = useQuickTour();

    const [createFlagOpen, setCreateFlagOpen] = useState(false);
    const [connectSdkOpen, setConnectSdkOpen] = useState(false);

    // Auto-adopt the first available project so the flag/sdk/on actions have
    // something to work against. Project creation is no longer a step, but the
    // rest of the flow still needs a project id.
    useEffect(() => {
        if (projectId) return;
        const firstProject = projects[0];
        if (firstProject) update({ projectId: firstProject.id });
    }, [projectId, projects, update]);

    if (state.dismissed) return null;

    const toggleMinimized = () => update({ minimized: !state.minimized });

    const handleTakeTour = () =>
        openQuickTour({ onClose: () => markCompleted('tour') });

    return (
        <>
            <Window aria-label='Get started'>
                <Header>
                    <TitleRow onClick={toggleMinimized}>
                        <HeaderTitle>Get started</HeaderTitle>
                        <OnboardingProgressBadge showLabel />
                    </TitleRow>
                    <IconButton
                        size='small'
                        aria-label={state.minimized ? 'Expand' : 'Minimize'}
                        onClick={toggleMinimized}
                    >
                        <RemoveIcon fontSize='small' />
                    </IconButton>
                    <IconButton
                        size='small'
                        aria-label='Close'
                        onClick={() => update({ dismissed: true })}
                    >
                        <CloseIcon fontSize='small' />
                    </IconButton>
                </Header>

                {state.minimized ? null : (
                    <Body>
                        <ChecklistSteps
                            quickTourEnabled={quickTourEnabled}
                            done={done}
                            goToFlagHref={goToFlagHref}
                            onTakeTour={handleTakeTour}
                            onCreateFlag={() => setCreateFlagOpen(true)}
                            onConnectSdk={() => setConnectSdkOpen(true)}
                            onGoToFlag={() => markCompleted('on')}
                        />
                    </Body>
                )}
            </Window>

            <CreateFeatureDialog
                open={createFlagOpen}
                onClose={() => setCreateFlagOpen(false)}
                onSuccess={() => {
                    markCompleted('flag');
                    refetchOverview();
                }}
            />
            {projectId ? (
                <ConnectSdkDialog
                    open={connectSdkOpen}
                    onClose={() => {
                        setConnectSdkOpen(false);
                        markCompleted('sdk');
                        refetchOverview();
                    }}
                    projectId={projectId}
                    environments={environments}
                    feature={feature}
                />
            ) : null}
        </>
    );
};
