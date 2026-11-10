import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    styled,
    Typography,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { ConnectSdkStep } from './steps/ConnectSdkStep.tsx';
import type { StepState } from './steps/StepLayout.tsx';
import useProjectOverview from 'hooks/api/getters/useProjectOverview/useProjectOverview';
import { OnboardingProgress } from './OnboardingProgress.tsx';
import { CreateFlagStep } from './steps/CreateFlagStep.tsx';
import { TurnFlagStep } from './steps/TurnFlagStep.tsx';
import { getProjectOnboardingStep } from '../../../utils/getProjectOnboardingStep.ts';

interface IProjectOnboardingProps {
    projectId: string;
    setConnectSdkOpen: (open: boolean) => void;
    setOnboardingFlow: (status: 'visible' | 'closed') => void;
    refetchFeatures: () => void;
}

const StyledAccordion = styled(Accordion)(({ theme }) => ({
    background: theme.palette.background.paper,
    borderRadius: theme.shape.borderRadiusLarge,
    boxShadow: 'none',
    overflow: 'hidden',
}));

const StyledAccordionSummary = styled(AccordionSummary)(({ theme }) => ({
    padding: theme.spacing(0.5, 3),
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

const StyledAccordionDetails = styled(AccordionDetails)(({ theme }) => ({
    borderTop: `1px solid ${theme.palette.divider}`,
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

export const ProjectOnboarding = ({
    projectId,
    setConnectSdkOpen,
    setOnboardingFlow,
    refetchFeatures,
}: IProjectOnboardingProps) => {
    const { project, refetch, loading } = useProjectOverview(projectId);

    if (loading) return null;

    const { current: step, total: numberOfSteps } = getProjectOnboardingStep(
        project.onboardingStatus,
    );

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
                    <Typography
                        sx={{
                            fontWeight: 'bold',
                        }}
                    >
                        Project setup
                    </Typography>
                    <OnboardingProgress
                        step={step}
                        maxSteps={numberOfSteps}
                        onDismiss={closeOnboardingFlow}
                    />
                </TitleRow>
            </StyledAccordionSummary>
            <StyledAccordionDetails>
                <Actions data-public>
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
                    <TurnFlagStep
                        projectId={projectId}
                        state={stepState(step, 3)}
                    />
                </Actions>
            </StyledAccordionDetails>
        </StyledAccordion>
    );
};
