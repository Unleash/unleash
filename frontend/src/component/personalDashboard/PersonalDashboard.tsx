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
import useLoading from '../../hooks/useLoading';
import { MyProjects } from './MyProjects';
import { ContentGridNoProjects } from './ContentGridNoProjects';
import ExpandMore from '@mui/icons-material/ExpandMore';
import { usePlausibleTracker } from 'hooks/usePlausibleTracker';
import useSplashApi from 'hooks/api/actions/useSplashApi/useSplashApi';
import { useAuthSplash } from 'hooks/api/getters/useAuth/useAuthSplash';
import { useDashboardState } from './useDashboardState';
import { MyFlags } from './MyFlags';

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
    "&[aria-expanded='true']": {
        // only add the border when it's open
        borderBottom: `1px solid ${theme.palette.divider}`,
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

export const PersonalDashboard = () => {
    const { user } = useAuthUser();
    const { trackEvent } = usePlausibleTracker();
    const { setSplashSeen } = useSplashApi();
    const { splash } = useAuthSplash();

    const name = user?.name;

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
    } = useDashboardState(projects, personalDashboard?.flags ?? []);

    const [welcomeDialog, setWelcomeDialog] = useLocalStorageState<
        'open' | 'closed'
    >(
        'welcome-dialog:v1',
        splash?.personalDashboardKeyConcepts ? 'closed' : 'open',
    );

    const { personalDashboardProjectDetails, error: detailsError } =
        usePersonalDashboardProjectDetails(activeProject);

    const activeProjectStage =
        personalDashboardProjectDetails?.onboardingStatus.status ?? 'loading';

    const noProjects = projects.length === 0;

    const projectStageRef = useLoading(
        !detailsError && activeProjectStage === 'loading',
    );

    return (
        <MainContent>
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
                    <Typography variant='body1' component='h3'>
                        My projects
                    </Typography>
                </StyledAccordionSummary>
                <StyledAccordionDetails>
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
                </StyledAccordionDetails>
            </SectionAccordion>

            <SectionAccordion
                expanded={expandFlags ?? true}
                onChange={() => toggleSectionState('flags')}
            >
                <StyledAccordionSummary
                    expandIcon={
                        <ExpandMore titleAccess='Toggle flags section' />
                    }
                    id='flags-panel-header'
                    aria-controls='flags-panel-content'
                >
                    <Typography variant='body1' component='h3'>
                        My feature flags
                    </Typography>
                </StyledAccordionSummary>
                <StyledAccordionDetails>
                    <MyFlags
                        hasProjects={projects?.length > 0}
                        flagData={
                            personalDashboard &&
                            personalDashboard.flags.length &&
                            activeFlag
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
