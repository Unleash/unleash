import { useAuthUser } from 'hooks/api/getters/useAuth/useAuthUser';
import {
    IconButton,
    Link,
    List,
    ListItem,
    ListItemButton,
    styled,
    Typography,
} from '@mui/material';
import React, { type FC, useEffect, useState } from 'react';
import LinkIcon from '@mui/icons-material/ArrowForward';
import { WelcomeDialog } from './WelcomeDialog';
import { useLocalStorageState } from 'hooks/useLocalStorageState';
import { usePersonalDashboard } from 'hooks/api/getters/usePersonalDashboard/usePersonalDashboard';
import { getFeatureTypeIcons } from 'utils/getFeatureTypeIcons';
import type {
    PersonalDashboardSchemaFlagsItem,
    PersonalDashboardSchemaProjectsItem,
} from '../../openapi';
import { FlagExposure } from 'component/feature/FeatureView/FeatureOverview/FeatureLifecycle/FlagExposure';
import { usePersonalDashboardProjectDetails } from 'hooks/api/getters/usePersonalDashboard/usePersonalDashboardProjectDetails';
import HelpOutline from '@mui/icons-material/HelpOutline';
import useLoading from '../../hooks/useLoading';
import { MyProjects } from './MyProjects';
import {
    ContentGridContainer,
    FlagGrid,
    ListItemBox,
    listItemStyle,
    GridItem,
    SpacedGridItem,
} from './Grid';
import { ContentGridNoProjects } from './ContentGridNoProjects';

const ScreenExplanation = styled('div')(({ theme }) => ({
    marginBottom: theme.spacing(4),
    display: 'flex',
    alignItems: 'center',
}));

export const StyledCardTitle = styled('div')<{ lines?: number }>(
    ({ theme, lines = 2 }) => ({
        fontWeight: theme.typography.fontWeightRegular,
        fontSize: theme.typography.body1.fontSize,
        lineClamp: `${lines}`,
        WebkitLineClamp: lines,
        lineHeight: '1.2',
        display: '-webkit-box',
        boxOrient: 'vertical',
        textOverflow: 'ellipsis',
        overflow: 'hidden',
        alignItems: 'flex-start',
        WebkitBoxOrient: 'vertical',
        wordBreak: 'break-word',
    }),
);

const FlagListItem: FC<{
    flag: { name: string; project: string; type: string };
    selected: boolean;
    onClick: () => void;
}> = ({ flag, selected, onClick }) => {
    const IconComponent = getFeatureTypeIcons(flag.type);
    return (
        <ListItem key={flag.name} disablePadding={true} sx={{ mb: 1 }}>
            <ListItemButton
                sx={listItemStyle}
                selected={selected}
                onClick={onClick}
            >
                <ListItemBox>
                    <IconComponent color='primary' />
                    <StyledCardTitle>{flag.name}</StyledCardTitle>
                    <IconButton
                        component={Link}
                        href={`projects/${flag.project}/features/${flag.name}`}
                        size='small'
                        sx={{ ml: 'auto' }}
                    >
                        <LinkIcon
                            titleAccess={`projects/${flag.project}/features/${flag.name}`}
                        />
                    </IconButton>
                </ListItemBox>
            </ListItemButton>
        </ListItem>
    );
};

const useActiveProject = (projects: PersonalDashboardSchemaProjectsItem[]) => {
    const [activeProject, setActiveProject] = useState(projects[0]?.id);

    useEffect(() => {
        if (!activeProject && projects.length > 0) {
            setActiveProject(projects[0].id);
        }
    }, [JSON.stringify(projects)]);

    return [activeProject, setActiveProject] as const;
};

const useDashboardState = (
    projects: PersonalDashboardSchemaProjectsItem[],
    flags: PersonalDashboardSchemaFlagsItem[],
) => {
    type State = {
        activeProject: string | undefined;
        activeFlag: PersonalDashboardSchemaFlagsItem | undefined;
    };

    const defaultState = {
        activeProject: undefined,
        activeFlag: undefined,
    };

    const [state, setState] = useLocalStorageState<State>(
        'personal-dashboard:v1',
        defaultState,
    );

    useEffect(() => {
        const setDefaultFlag = !state.activeFlag && flags.length;
        const setDefaultProject = !state.activeProject && projects.length;

        if (setDefaultFlag || setDefaultProject) {
            setState({
                activeFlag: setDefaultFlag ? flags[0] : state.activeFlag,
                activeProject: setDefaultProject
                    ? projects[0].id
                    : state.activeProject,
            });
        }
    });

    const { activeFlag, activeProject } = state;

    const setActiveFlag = (flag: PersonalDashboardSchemaFlagsItem) => {
        setState({
            ...state,
            activeFlag: flag,
        });
    };

    const setActiveProject = (projectId: string) => {
        setState({
            ...state,
            activeProject: projectId,
        });
    };

    return {
        activeFlag,
        setActiveFlag,
        activeProject,
        setActiveProject,
    };
};

export const PersonalDashboard = () => {
    const { user } = useAuthUser();

    const name = user?.name;

    const {
        personalDashboard,
        refetch: refetchDashboard,
        loading: personalDashboardLoading,
    } = usePersonalDashboard();

    const projects = personalDashboard?.projects || [];

    const { activeProject, setActiveProject, activeFlag, setActiveFlag } =
        useDashboardState(projects, personalDashboard?.flags ?? []);

    const [welcomeDialog, setWelcomeDialog] = useLocalStorageState<
        'open' | 'closed'
    >('welcome-dialog:v1', 'open');

    const { personalDashboardProjectDetails, loading: loadingDetails } =
        usePersonalDashboardProjectDetails(activeProject);

    const activeProjectStage =
        personalDashboardProjectDetails?.onboardingStatus.status ?? 'loading';
    const setupIncomplete =
        activeProjectStage === 'onboarding-started' ||
        activeProjectStage === 'first-flag-created';

    const noProjects = projects.length === 0;

    const projectStageRef = useLoading(activeProjectStage === 'loading');

    return (
        <div ref={projectStageRef}>
            <Typography component='h2' variant='h2'>
                Welcome {name}
            </Typography>
            <ScreenExplanation>
                <p data-loading>
                    {activeProjectStage === 'onboarded'
                        ? 'We have gathered projects and flags you have favorited or owned'
                        : null}
                    {setupIncomplete
                        ? 'Here are some tasks we think would be useful in order to get the most out of Unleash'
                        : null}
                    {activeProjectStage === 'loading'
                        ? 'We have gathered projects and flags you have favorited or owned'
                        : null}
                </p>
                <IconButton
                    data-loading
                    size={'small'}
                    title='Key concepts'
                    onClick={() => setWelcomeDialog('open')}
                >
                    <HelpOutline />
                </IconButton>
            </ScreenExplanation>

            {noProjects && personalDashboard ? (
                <ContentGridNoProjects
                    owners={personalDashboard.projectOwners}
                    admins={personalDashboard.admins}
                />
            ) : (
                <MyProjects
                    projects={projects}
                    activeProject={activeProject || ''}
                    setActiveProject={setActiveProject}
                    personalDashboardProjectDetails={
                        personalDashboardProjectDetails
                    }
                />
            )}

            <ContentGridContainer>
                <FlagGrid sx={{ mt: 2 }}>
                    <GridItem
                        gridArea='title'
                        sx={{ display: 'flex', alignItems: 'center' }}
                    >
                        <Typography variant='h3'>My feature flags</Typography>
                    </GridItem>
                    <GridItem
                        gridArea='lifecycle'
                        sx={{ display: 'flex', justifyContent: 'flex-end' }}
                    >
                        {activeFlag ? (
                            <FlagExposure
                                project={activeFlag.project}
                                flagName={activeFlag.name}
                                onArchive={refetchDashboard}
                            />
                        ) : null}
                    </GridItem>
                    <SpacedGridItem gridArea='flags'>
                        {personalDashboard &&
                        personalDashboard.flags.length > 0 ? (
                            <List
                                disablePadding={true}
                                sx={{ maxHeight: '400px', overflow: 'auto' }}
                            >
                                {personalDashboard.flags.map((flag) => (
                                    <FlagListItem
                                        key={flag.name}
                                        flag={flag}
                                        selected={
                                            flag.name === activeFlag?.name
                                        }
                                        onClick={() => setActiveFlag(flag)}
                                    />
                                ))}
                            </List>
                        ) : (
                            <Typography>
                                You have not created or favorited any feature
                                flags. Once you do, they will show up here.
                            </Typography>
                        )}
                    </SpacedGridItem>

                    <SpacedGridItem gridArea='chart'>
                        {activeFlag ? (
                            <FlagMetricsChart flag={activeFlag} />
                        ) : (
                            <PlaceholderFlagMetricsChart />
                        )}
                    </SpacedGridItem>
                </FlagGrid>
            </ContentGridContainer>
            <WelcomeDialog
                open={welcomeDialog === 'open'}
                onClose={() => setWelcomeDialog('closed')}
            />
        </div>
    );
};

const FlagMetricsChart = React.lazy(() =>
    import('./FlagMetricsChart').then((module) => ({
        default: module.FlagMetricsChart,
    })),
);
const PlaceholderFlagMetricsChart = React.lazy(() =>
    import('./FlagMetricsChart').then((module) => ({
        default: module.PlaceholderFlagMetricsChart,
    })),
);
