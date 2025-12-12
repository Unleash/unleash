import { useAuthUser } from 'hooks/api/getters/useAuth/useAuthUser';
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Button,
    styled,
    Typography,
} from '@mui/material';
import { WelcomeDialog } from './WelcomeDialog.tsx';
import { useLocalStorageState } from 'hooks/useLocalStorageState';
import { usePersonalDashboard } from 'hooks/api/getters/usePersonalDashboard/usePersonalDashboard';
import { usePersonalDashboardProjectDetails } from 'hooks/api/getters/usePersonalDashboard/usePersonalDashboardProjectDetails';
import { MyProjects } from './MyProjects.tsx';
import ExpandMore from '@mui/icons-material/ExpandMore';
import { usePlausibleTracker } from 'hooks/usePlausibleTracker';
import useSplashApi from 'hooks/api/actions/useSplashApi/useSplashApi';
import { useAuthSplash } from 'hooks/api/getters/useAuth/useAuthSplash';
import { useDashboardState } from './useDashboardState.ts';
import { MyFlags } from './MyFlags.tsx';
import { usePageTitle } from 'hooks/usePageTitle';
import { fromPersonalDashboardProjectDetailsOutput } from './RemoteData.ts';
import { useEffect } from 'react';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { useUiFlag } from 'hooks/useUiFlag';
import { InfoSection } from './InfoSection.tsx';
import { EventTimeline } from 'component/events/EventTimeline/EventTimeline';
import { AccordionContent } from './SharedComponents.tsx';
import { Link } from 'react-router-dom';
import { ReleaseTemplatesBanner } from 'component/common/ReleaseTemplatesBanner/ReleaseTemplatesBanner';

const WelcomeSection = styled('div')(({ theme }) => ({
    display: 'flex',
    justifyContent: 'space-between',
    gap: theme.spacing(1),
    flexFlow: 'row wrap',
    alignItems: 'baseline',
}));

const ViewKeyConceptsButton = styled(Button)({
    fontWeight: 'normal',
    padding: 0,
    margin: 0,
});

const SectionAccordion = styled(Accordion, {
    shouldForwardProp: (prop) => prop !== 'withSummaryContentBorder',
})<{ withSummaryContentBorder?: boolean }>(
    ({ theme, withSummaryContentBorder = true }) => {
        const borderStyle = `1px solid ${theme.palette.divider}`;
        return {
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: theme.shape.borderRadiusMedium,
            backgroundColor: theme.palette.background.paper,
            boxShadow: 'none',
            '& .expanded': {
                '&:before': {
                    opacity: '0 !important',
                },
            },

            ...(withSummaryContentBorder && {
                // add a top border to the region when the accordion is collapsed.
                // This retains the border between the summary and the region
                // during the collapsing animation
                "[aria-expanded='false']+.MuiCollapse-root .MuiAccordion-region":
                    {
                        borderTop: borderStyle,
                    },

                // add the border to the region for the accordion is expanded
                "&>.MuiAccordionSummary-root[aria-expanded='true']": {
                    borderBottom: borderStyle,
                },
            }),

            overflow: 'hidden',
        };
    },
);

const StyledAccordionSummary = styled(AccordionSummary)(({ theme }) => ({
    border: 'none',
    padding: theme.spacing(2, 4),
    margin: 0,
    // increase specificity to override the default margin
    '&>.MuiAccordionSummary-content.MuiAccordionSummary-content': {
        margin: '0',
    },
}));

const StyledAccordionDetails = styled(AccordionDetails)({
    padding: 0,
});

const MainContent = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
}));

const AccordionSummaryText = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(0.5),
}));

const AccordionSummaryHeader = styled('h3')(({ theme }) => ({
    color: theme.palette.text.primary,
    fontSize: theme.typography.body1.fontSize,
    fontWeight: theme.typography.body2.fontWeight,
    margin: 0,
}));

const AccordionSummarySubtitle = styled(Typography)(({ theme }) => ({
    color: theme.palette.text.secondary,
    fontSize: theme.typography.body2.fontSize,
    fontWeight: theme.typography.body2.fontWeight,
}));

const EventTimelinePanel = () => {
    const { toggleSectionState, expandTimeline } = useDashboardState();
    const { trackEvent } = usePlausibleTracker();

    const signalsLink = '/integrations/signals';
    return (
        <SectionAccordion
            disableGutters
            expanded={expandTimeline ?? false}
            onChange={() => toggleSectionState('timeline')}
            withSummaryContentBorder={false}
        >
            <StyledAccordionSummary
                expandIcon={
                    <ExpandMore titleAccess='Toggle timeline section' />
                }
                id='timeline-panel-header'
                aria-controls='timeline-panel-content'
            >
                <AccordionSummaryText>
                    <AccordionSummaryHeader>
                        Event timeline
                    </AccordionSummaryHeader>
                    <AccordionSummarySubtitle>
                        Overview of recent activities across all projects in
                        Unleash. Make debugging easier and{' '}
                        <Link
                            to={signalsLink}
                            onClick={() => {
                                trackEvent('event-timeline', {
                                    props: {
                                        eventType: 'signals clicked',
                                    },
                                });
                            }}
                        >
                            include external signals
                        </Link>{' '}
                        to get a fuller overview.
                    </AccordionSummarySubtitle>
                </AccordionSummaryText>
            </StyledAccordionSummary>
            <StyledAccordionDetails>
                <AccordionContent>
                    <EventTimeline />
                </AccordionContent>
            </StyledAccordionDetails>
        </SectionAccordion>
    );
};

const FlagPanel = () => {
    const { personalDashboard, refetch: refetchDashboard } =
        usePersonalDashboard();

    const projects = personalDashboard?.projects || [];

    const { activeFlag, setActiveFlag, toggleSectionState, expandFlags } =
        useDashboardState({ flags: personalDashboard?.flags ?? [] });

    return (
        <SectionAccordion
            expanded={expandFlags ?? true}
            onChange={() => toggleSectionState('flags')}
        >
            <StyledAccordionSummary
                expandIcon={<ExpandMore titleAccess='Toggle flags section' />}
                id='flags-panel-header'
                aria-controls='flags-panel-content'
            >
                <AccordionSummaryText>
                    <AccordionSummaryHeader>
                        My feature flags
                    </AccordionSummaryHeader>
                    <AccordionSummarySubtitle>
                        Feature flags you have created or favorited
                    </AccordionSummarySubtitle>
                </AccordionSummaryText>
            </StyledAccordionSummary>
            <StyledAccordionDetails>
                <MyFlags
                    hasProjects={projects?.length > 0}
                    flagData={
                        personalDashboard?.flags.length
                            ? {
                                  state: 'flags' as const,
                                  activeFlag,
                                  flags: personalDashboard.flags,
                              }
                            : { state: 'no flags' as const }
                    }
                    setActiveFlag={setActiveFlag}
                    refetchDashboard={refetchDashboard}
                />
            </StyledAccordionDetails>
        </SectionAccordion>
    );
};

const ProjectPanel = () => {
    const { personalDashboard } = usePersonalDashboard();

    const projects = personalDashboard?.projects || [];

    const {
        activeProject,
        setActiveProject,
        toggleSectionState,
        expandProjects,
    } = useDashboardState({ projects });

    const personalDashboardProjectDetails =
        fromPersonalDashboardProjectDetailsOutput(
            usePersonalDashboardProjectDetails(activeProject),
        );

    return (
        <SectionAccordion
            disableGutters
            expanded={expandProjects ?? true}
            onChange={() => toggleSectionState('projects')}
        >
            <StyledAccordionSummary
                expandIcon={
                    <ExpandMore titleAccess='Toggle projects section' />
                }
                id='projects-panel-header'
                aria-controls='projects-panel-content'
            >
                <AccordionSummaryText>
                    <AccordionSummaryHeader>My projects</AccordionSummaryHeader>
                    <AccordionSummarySubtitle>
                        Favorite projects, projects you own, and projects you
                        are a member of
                    </AccordionSummarySubtitle>
                </AccordionSummaryText>
            </StyledAccordionSummary>
            <StyledAccordionDetails>
                <MyProjects
                    owners={personalDashboard?.projectOwners ?? []}
                    admins={personalDashboard?.admins ?? []}
                    projects={projects}
                    activeProject={activeProject || ''}
                    setActiveProject={setActiveProject}
                    personalDashboardProjectDetails={
                        personalDashboardProjectDetails
                    }
                />
            </StyledAccordionDetails>
        </SectionAccordion>
    );
};

export const PersonalDashboard = () => {
    const { user } = useAuthUser();
    const { trackEvent } = usePlausibleTracker();
    const { setSplashSeen } = useSplashApi();
    const { splash } = useAuthSplash();
    const { isOss, isEnterprise } = useUiConfig();
    const gtmReleaseManagementEnabled = useUiFlag('gtmReleaseManagement');
    const name = user?.name || '';

    usePageTitle(name ? `Dashboard: ${name}` : 'Dashboard');

    const [welcomeDialog, setWelcomeDialog] = useLocalStorageState<
        'open' | 'closed'
    >(
        'welcome-dialog:v1',
        splash?.personalDashboardKeyConcepts ? 'closed' : 'open',
    );

    useEffect(() => {
        trackEvent('personal-dashboard', {
            props: {
                eventType: 'seen',
            },
        });
    }, []);

    return (
        <MainContent>
            {isEnterprise() && gtmReleaseManagementEnabled ? (
                <ReleaseTemplatesBanner />
            ) : null}
            {isOss() ? <InfoSection /> : null}

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
                    onClick={() => {
                        trackEvent('personal-dashboard', {
                            props: {
                                eventType: 'open key concepts',
                            },
                        });
                        setWelcomeDialog('open');
                    }}
                >
                    View key concepts
                </ViewKeyConceptsButton>
            </WelcomeSection>

            <EventTimelinePanel />

            <ProjectPanel />

            <FlagPanel />

            <WelcomeDialog
                open={welcomeDialog === 'open'}
                onClose={() => {
                    setSplashSeen('personalDashboardKeyConcepts');
                    setWelcomeDialog('closed');
                }}
            />
        </MainContent>
    );
};
