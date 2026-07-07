import { useEffect, useRef, useState } from 'react';
import { IconButton, styled, Tooltip, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import RemoveIcon from '@mui/icons-material/Remove';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import useProjects from 'hooks/api/getters/useProjects/useProjects';
import { CreateProjectDialog } from 'component/project/Project/CreateProject/CreateProjectForm/CreateProjectDialog.tsx';
import { CreateFeatureDialog } from 'component/project/Project/PaginatedProjectFeatureToggles/ProjectFeatureTogglesHeader/CreateFeatureDialog.tsx';
import { ConnectSdkDialog } from 'component/onboarding/dialog/ConnectSdkDialog/ConnectSdkDialog.tsx';
import {
    OnboardingProgressBadge,
    useFloatingOnboarding,
} from './FloatingOnboardingContext.tsx';
import { GetStartedList } from './GetStartedList.tsx';
import { SetupGuide } from './SetupGuide.tsx';

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

const BackButton = styled(IconButton)(({ theme }) => ({
    color: theme.palette.primary.main,
    padding: theme.spacing(0.5),
}));

const Body = styled('div')({
    overflowY: 'auto',
});

export const FloatingOnboarding = () => {
    const {
        state,
        update,
        markCompleted,
        reset,
        projectId,
        done,
        completedCount,
        totalSteps,
        environments,
        goToFlagHref,
        feature,
        refetchOverview,
    } = useFloatingOnboarding();

    const { projects, refetch: refetchProjects } = useProjects();

    const [createProjectOpen, setCreateProjectOpen] = useState(false);
    const [createFlagOpen, setCreateFlagOpen] = useState(false);
    const [connectSdkOpen, setConnectSdkOpen] = useState(false);

    // Project ids present when the create-project dialog was opened, so we can
    // detect which project the user just created (the dialog gives us no id).
    const projectIdsSnapshot = useRef<Set<string>>(new Set());
    // Only adopt a "new" project while we're actually expecting one from the
    // create-project dialog — otherwise we'd grab a pre-existing project on mount.
    const awaitingCreatedProject = useRef(false);

    // Adopt the newly created project once it shows up in the project list.
    useEffect(() => {
        if (!awaitingCreatedProject.current || createProjectOpen || projectId)
            return;
        const created = projects.find(
            (candidate) => !projectIdsSnapshot.current.has(candidate.id),
        );
        if (created) {
            awaitingCreatedProject.current = false;
            update({ projectId: created.id });
            markCompleted('project');
        }
    }, [projects, createProjectOpen, projectId, update, markCompleted]);

    if (state.dismissed) return null;

    const openCreateProject = () => {
        projectIdsSnapshot.current = new Set(projects.map((p) => p.id));
        awaitingCreatedProject.current = true;
        setCreateProjectOpen(true);
    };

    const toggleMinimized = () => update({ minimized: !state.minimized });

    return (
        <>
            <Window aria-label='Get started'>
                <Header>
                    {state.view === 'guide' && !state.minimized ? (
                        <BackButton
                            size='small'
                            aria-label='Back'
                            onClick={() => update({ view: 'list' })}
                        >
                            <ArrowBackIcon fontSize='small' />
                        </BackButton>
                    ) : null}
                    <TitleRow onClick={toggleMinimized}>
                        <HeaderTitle>Get started</HeaderTitle>
                        {state.minimized ? <OnboardingProgressBadge /> : null}
                    </TitleRow>
                    {state.minimized ? null : (
                        <Tooltip title='Reset demo' arrow>
                            <IconButton
                                size='small'
                                aria-label='Reset demo'
                                onClick={() => {
                                    setCreateProjectOpen(false);
                                    setCreateFlagOpen(false);
                                    setConnectSdkOpen(false);
                                    awaitingCreatedProject.current = false;
                                    reset();
                                }}
                            >
                                <RestartAltIcon fontSize='small' />
                            </IconButton>
                        </Tooltip>
                    )}
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
                        {state.view === 'guide' ? (
                            <SetupGuide
                                projectId={projectId}
                                done={done}
                                goToFlagHref={goToFlagHref}
                                onCreateProject={openCreateProject}
                                onCreateFlag={() => setCreateFlagOpen(true)}
                                onConnectSdk={() => setConnectSdkOpen(true)}
                                onGoToFlag={() => markCompleted('on')}
                            />
                        ) : (
                            <GetStartedList
                                completedCount={completedCount}
                                totalSteps={totalSteps}
                                onStartSetup={() => update({ view: 'guide' })}
                                onOpenDemo={() => {
                                    // Demo project link is out of scope.
                                }}
                            />
                        )}
                    </Body>
                )}
            </Window>

            <CreateProjectDialog
                open={createProjectOpen}
                onClose={() => {
                    setCreateProjectOpen(false);
                    refetchProjects();
                }}
            />
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
