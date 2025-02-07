import { useAuthUser } from 'hooks/api/getters/useAuth/useAuthUser';
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Button,
    styled,
    Typography,
} from '@mui/material';
import { WelcomeDialog } from './WelcomeDialog';
import { useLocalStorageState } from 'hooks/useLocalStorageState';
import { usePersonalDashboard } from 'hooks/api/getters/usePersonalDashboard/usePersonalDashboard';
import { usePersonalDashboardProjectDetails } from 'hooks/api/getters/usePersonalDashboard/usePersonalDashboardProjectDetails';
import { MyProjects } from './MyProjects';
import ExpandMore from '@mui/icons-material/ExpandMore';
import { usePlausibleTracker } from 'hooks/usePlausibleTracker';
import useSplashApi from 'hooks/api/actions/useSplashApi/useSplashApi';
import { useAuthSplash } from 'hooks/api/getters/useAuth/useAuthSplash';
import { useDashboardState } from './useDashboardState';
import { MyFlags } from './MyFlags';
import { usePageTitle } from 'hooks/usePageTitle';
import { fromPersonalDashboardProjectDetailsOutput } from './RemoteData';
import { useEffect } from 'react';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { InfoSection } from './InfoSection';
import { EventTimeline } from 'component/events/EventTimeline/EventTimeline';
import { AccordionContent } from './SharedComponents';
import { Link } from 'react-router-dom';
import { useUiFlag } from 'hooks/useUiFlag';

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

const SectionAccordion = styled(Accordion)(({ theme }) => ({
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadiusMedium,
    backgroundColor: theme.palette.background.paper,
    boxShadow: 'none',
    '& .expanded': {
        '&:before': {
            opacity: '0 !important',
        },
    },

    // add a top border to the region when the accordion is collapsed.
    // This retains the border between the summary and the region
    // during the collapsing animation
    "[aria-expanded='false']+.MuiCollapse-root .MuiAccordion-region": {
        borderTop: `1px solid ${theme.palette.divider}`,
    },

    overflow: 'hidden',
}));

const StyledAccordionSummary = styled(AccordionSummary)(({ theme }) => ({
    border: 'none',
    padding: theme.spacing(2, 4),
    margin: 0,
    // increase specificity to override the default margin
    '&>.MuiAccordionSummary-content.MuiAccordionSummary-content': {
        margin: '0',
    },
}));

const StyledAccordionSummaryWithBorder = styled(StyledAccordionSummary)(
    ({ theme }) => ({
        "&[aria-expanded='true']": {
            // only add the border when it's open
            borderBottom: `1px solid ${theme.palette.divider}`,
        },
    }),
);

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

export const PersonalDashboard = () => {
    const { user } = useAuthUser();
    const { trackEvent } = usePlausibleTracker();
    const { setSplashSeen } = useSplashApi();
    const { splash } = useAuthSplash();
    const { isOss } = useUiConfig();
    const name = user?.name || '';
    const showTimelinePanel = useUiFlag('frontendHeaderRedesign');

    usePageTitle(name ? `Dashboard: ${name}` : 'Dashboard');

    const { personalDashboard, refetch: refetchDashboard } =
        usePersonalDashboard();

    const projects = personalDashboard?.projects || [];

    const {
        activeProject,
        setActiveProject,
        activeFlag,
        setActiveFlag,
        toggleSectionState,
        expandFlags,
        expandProjects,
        expandTimeline,
    } = useDashboardState(projects, personalDashboard?.flags ?? []);

    const signalsLink = '/integrations/signals';

    const [welcomeDialog, setWelcomeDialog] = useLocalStorageState<
        'open' | 'closed'
    >(
        'welcome-dialog:v1',
        splash?.personalDashboardKeyConcepts ? 'closed' : 'open',
    );

    const personalDashboardProjectDetails =
        fromPersonalDashboardProjectDetailsOutput(
            usePersonalDashboardProjectDetails(activeProject),
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

            {showTimelinePanel && (
                <SectionAccordion
                    disableGutters
                    expanded={expandTimeline ?? false}
                    onChange={() => toggleSectionState('timeline')}
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
                                Overview of recent activities across all
                                projects in Unleash. Make debugging easier and{' '}
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
            )}
            <SectionAccordion
                disableGutters
                expanded={expandProjects ?? true}
                onChange={() => toggleSectionState('projects')}
            >
                <StyledAccordionSummaryWithBorder
                    expandIcon={
                        <ExpandMore titleAccess='Toggle projects section' />
                    }
                    id='projects-panel-header'
                    aria-controls='projects-panel-content'
                >
                    <AccordionSummaryText>
                        <AccordionSummaryHeader>
                            My projects
                        </AccordionSummaryHeader>
                        <AccordionSummarySubtitle>
                            Favorite projects, projects you own, and projects
                            you are a member of
                        </AccordionSummarySubtitle>
                    </AccordionSummaryText>
                </StyledAccordionSummaryWithBorder>
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

            <SectionAccordion
                expanded={expandFlags ?? true}
                onChange={() => toggleSectionState('flags')}
            >
                <StyledAccordionSummaryWithBorder
                    expandIcon={
                        <ExpandMore titleAccess='Toggle flags section' />
                    }
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
                </StyledAccordionSummaryWithBorder>
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
