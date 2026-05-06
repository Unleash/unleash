import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    styled,
    Typography,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { ConnectSdkStep } from './steps/ConnectSdkStep.tsx';
import { ActionBox, type StepState } from './steps/StepLayout.tsx';
import useProjectOverview from 'hooks/api/getters/useProjectOverview/useProjectOverview';
import { SdkExample } from './SdkExample.tsx';
import { OnboardingProgress } from './OnboardingProgress.tsx';
import { CreateFlagStep } from './steps/CreateFlagStep.tsx';

interface IProjectOnboardingProps {
    projectId: string;
    setConnectSdkOpen: (open: boolean) => void;
    setOnboardingFlow: (status: 'visible' | 'closed') => void;
    refetchFeatures: () => void;
}

const StyledAccordion = styled(Accordion)(({ theme }) => ({
    background: theme.palette.background.paper,
    borderRadius: theme.shape.borderRadiusLarge,
}));

const StyledAccordionSummary = styled(AccordionSummary)(({ theme }) => ({
    padding: theme.spacing(0.5, 3),
    borderBottom: `1px solid ${theme.palette.divider}`,
}));

const TitleRow = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    padding: 0,
    margin: 0,
    marginRight: theme.spacing(1),
}));

const StyledAccordionDetails = styled(AccordionDetails)(() => ({
    padding: 0,
}));

const Actions = styled('div')(({ theme }) => ({
    display: 'flex',
    flexGrow: 1,
    [theme.breakpoints.down('md')]: {
        flexDirection: 'column',
        padding: theme.spacing(0),
    },
}));

const stepState = (currentStep: number, stepNumber: number): StepState => {
    if (currentStep >= stepNumber) return 'done';
    if (currentStep === stepNumber - 1) return 'active';
    return 'disabled';
};

const NUMBER_OF_STEPS = 3;

export const ProjectOnboarding = ({
    projectId,
    setConnectSdkOpen,
    setOnboardingFlow,
    refetchFeatures,
}: IProjectOnboardingProps) => {
    const { project, refetch } = useProjectOverview(projectId);
    const isFirstFlagCreated =
        project.onboardingStatus?.status === 'first-flag-created';
    const isSDKConnected = project.onboardingStatus?.status === 'sdk-connected';
    const isOnboarded = project.onboardingStatus?.status === 'onboarded';

    let step = 0;
    if (isOnboarded) {
        step = NUMBER_OF_STEPS;
    } else if (isSDKConnected) {
        step = 2;
    } else if (isFirstFlagCreated) {
        step = 1;
    }

    const closeOnboardingFlow = () => {
        setOnboardingFlow('closed');
    };

    return (
        <StyledAccordion defaultExpanded>
            <StyledAccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls='panel1-content'
                id='panel1-header'
            >
                <TitleRow>
                    <Typography fontWeight='bold'>Project setup</Typography>
                    <OnboardingProgress
                        step={step}
                        maxSteps={NUMBER_OF_STEPS}
                        onDismiss={closeOnboardingFlow}
                    />
                </TitleRow>
            </StyledAccordionSummary>
            <StyledAccordionDetails>
                <Actions>
                    <CreateFlagStep
                        state={stepState(step, 1)}
                        refetchFeatures={refetchFeatures}
                        refetchProject={refetch}
                    />
                    <ConnectSdkStep
                        projectId={projectId}
                        setConnectSdkOpen={setConnectSdkOpen}
                        state={stepState(step, 2)}
                    />
                    <ActionBox>
                        <SdkExample />
                    </ActionBox>
                </Actions>
            </StyledAccordionDetails>
        </StyledAccordion>
    );
};
