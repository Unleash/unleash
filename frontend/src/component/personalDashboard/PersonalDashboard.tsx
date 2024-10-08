import { useAuthUser } from 'hooks/api/getters/useAuth/useAuthUser';
import {
    Accordion,
    Button,
    IconButton,
    Link,
    List,
    ListItem,
    ListItemButton,
    styled,
    Typography,
} from '@mui/material';
import React, { type FC, useEffect, useRef } from 'react';
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
    const activeFlagRef = useRef<HTMLLIElement>(null);

    useEffect(() => {
        if (activeFlagRef.current) {
            activeFlagRef.current.scrollIntoView({
                block: 'nearest',
                inline: 'start',
            });
        }
    }, []);
    const IconComponent = getFeatureTypeIcons(flag.type);
    return (
        <ListItem
            key={flag.name}
            disablePadding={true}
            sx={{ mb: 1 }}
            ref={selected ? activeFlagRef : null}
        >
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

const useDashboardState = (
    projects: PersonalDashboardSchemaProjectsItem[],
    flags: PersonalDashboardSchemaFlagsItem[],
) => {
    type SectionState = 'expanded' | 'collapsed';
    type State = {
        activeProject: string | undefined;
        activeFlag: PersonalDashboardSchemaFlagsItem | undefined;
        sections: {
            projects: { state: SectionState };
            flags: { state: SectionState };
        };
    };

    const defaultState: State = {
        activeProject: undefined,
        activeFlag: undefined,
        sections: {
            projects: { state: 'expanded' as const },
            flags: { state: 'expanded' as const },
        },
    };

    const [state, setState] = useLocalStorageState<State>(
        'personal-dashboard:v1',
        defaultState,
    );

    useEffect(() => {
        const setDefaultFlag =
            flags.length &&
            (!state.activeFlag ||
                !flags.some((flag) => flag.name === state.activeFlag?.name));
        const setDefaultProject =
            projects.length &&
            (!state.activeProject ||
                !projects.some(
                    (project) => project.id === state.activeProject,
                ));

        if (setDefaultFlag || setDefaultProject) {
            setState({
                ...state,
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

    const toggleSectionState = (section: keyof State['sections']) => {
        setState({
            ...state,
            sections: {
                ...state.sections,
                [section]: {
                    state:
                        state.sections[section].state === 'expanded'
                            ? 'collapsed'
                            : 'expanded',
                },
            },
        });
    };

    return {
        activeFlag,
        setActiveFlag,
        activeProject,
        setActiveProject,
        toggleSectionState,
    };
};

const WelcomeSection = styled('div')(({ theme }) => ({
    display: 'flex',
    justifyContent: 'space-between',
    gap: theme.spacing(1),
    flexFlow: 'row wrap',
    alignItems: 'baseline',
    marginBottom: theme.spacing(2),
}));

const ViewKeyConceptsButton = styled(Button)(({ theme }) => ({
    fontWeight: 'normal',
    padding: 0,
    margin: 0,
}));

const SectionAccordion = styled(Accordion)(({ theme }) => ({
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadiusMedium,
    backgroundColor: theme.palette.background.elevation1,
    boxShadow: 'none',
    margin: 0,
    '& .expanded': {
        '&:before': {
            opacity: '0 !important',
        },
    },
}));

const StyledAccordionSummary = styled(AccordionSummary)(({ theme }) => ({
    border: 'none',
    padding: theme.spacing(0.5, 3),
    '&:hover .valuesExpandLabel': {
        textDecoration: 'underline',
    },
}));

const StyledAccordionDetails = styled(AccordionDetails)(({ theme }) => ({
    borderTop: `1px dashed ${theme.palette.divider}`,
    display: 'flex',
    flexDirection: 'column',
    padding: 0,
}));

export const PersonalDashboard = () => {
    const { user } = useAuthUser();

    const name = user?.name;

    const {
        personalDashboard,
        refetch: refetchDashboard,
        loading: personalDashboardLoading,
    } = usePersonalDashboard();

    const projects = personalDashboard?.projects || [];

    const {
        activeProject,
        setActiveProject,
        activeFlag,
        setActiveFlag,
        toggleSectionState,
    } = useDashboardState(projects, personalDashboard?.flags ?? []);

    const [welcomeDialog, setWelcomeDialog] = useLocalStorageState<
        'open' | 'closed'
    >('welcome-dialog:v1', 'open');

    const {
        personalDashboardProjectDetails,
        loading: loadingDetails,
        error: detailsError,
    } = usePersonalDashboardProjectDetails(activeProject);

    const activeProjectStage =
        personalDashboardProjectDetails?.onboardingStatus.status ?? 'loading';
    const setupIncomplete =
        activeProjectStage === 'onboarding-started' ||
        activeProjectStage === 'first-flag-created';

    const noProjects = projects.length === 0;

    const projectStageRef = useLoading(
        !detailsError && activeProjectStage === 'loading',
    );

    return (
        <div>
            <WelcomeSection>
                <Typography component='h2' variant='h2'>
                    Welcome {name}
                </Typography>

                <ViewKeyConceptsButton
                    sx={{
                        fontWeight: 'normal',
                    }}
                    size={'small'}
                    variant='text'
                    onClick={() => setWelcomeDialog('open')}
                >
                    View key concepts
                </ViewKeyConceptsButton>
            </WelcomeSection>

            {noProjects && personalDashboard ? (
                <ContentGridNoProjects
                    owners={personalDashboard.projectOwners}
                    admins={personalDashboard.admins}
                />
            ) : (
                <MyProjects
                    admins={personalDashboard?.admins ?? []}
                    ref={projectStageRef}
                    projects={projects}
                    activeProject={activeProject || ''}
                    setActiveProject={setActiveProject}
                    personalDashboardProjectDetails={
                        personalDashboardProjectDetails
                    }
                />
            )}

            <SectionAccordion>
                <StyledAccordionSummary>
                    <Typography variant='h3'>My feature flags</Typography>
                </StyledAccordionSummary>
                <StyledAccordionDetails>
                    <ContentGridContainer>
                        <FlagGrid sx={{ mt: 2 }}>
                            <GridItem
                                gridArea='title'
                                sx={{ display: 'flex', alignItems: 'center' }}
                            >
                                <Typography variant='h3'>
                                    My feature flags
                                </Typography>
                            </GridItem>
                            <GridItem
                                gridArea='lifecycle'
                                sx={{
                                    display: 'flex',
                                    justifyContent: 'flex-end',
                                }}
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
                                        sx={{
                                            maxHeight: '400px',
                                            overflow: 'auto',
                                        }}
                                    >
                                        {personalDashboard.flags.map((flag) => (
                                            <FlagListItem
                                                key={flag.name}
                                                flag={flag}
                                                selected={
                                                    flag.name ===
                                                    activeFlag?.name
                                                }
                                                onClick={() =>
                                                    setActiveFlag(flag)
                                                }
                                            />
                                        ))}
                                    </List>
                                ) : (
                                    <Typography>
                                        You have not created or favorited any
                                        feature flags. Once you do, they will
                                        show up here.
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
                </StyledAccordionDetails>
            </SectionAccordion>
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
