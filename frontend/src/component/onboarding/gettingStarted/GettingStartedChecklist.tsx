import type { FC } from 'react';
import {
    Box,
    Collapse,
    IconButton,
    LinearProgress,
    styled,
    Typography,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import CloseIcon from '@mui/icons-material/Close';
import { Link } from 'react-router';
import { useUiFlag } from 'hooks/useUiFlag';
import { useLocalStorageState } from 'hooks/useLocalStorageState';
import useProjects, {
    type ProjectListItem,
} from 'hooks/api/getters/useProjects/useProjects';
import { useInviteTokens } from 'hooks/api/getters/useInviteTokens/useInviteTokens';
import {
    deriveGettingStartedSteps,
    type GettingStartedStep,
    type GettingStartedStepId,
} from './deriveGettingStartedSteps.ts';

type ChecklistState = {
    dismissed: boolean;
    collapsed: boolean;
    manualSteps: GettingStartedStepId[];
};

const initialState: ChecklistState = {
    dismissed: false,
    collapsed: false,
    manualSteps: [],
};

const StyledContainer = styled(Box)(({ theme }) => ({
    backgroundColor: theme.palette.background.elevation1,
    borderRadius: theme.shape.borderRadiusMedium,
    padding: theme.spacing(1.5),
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
}));

const StyledHeader = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(0.5),
}));

const StyledTitle = styled(Typography)(({ theme }) => ({
    flex: 1,
    fontSize: theme.fontSizes.smallBody,
    fontWeight: theme.typography.fontWeightBold,
}));

const StyledProgress = styled(LinearProgress)(({ theme }) => ({
    marginTop: theme.spacing(1),
    borderRadius: theme.shape.borderRadius,
    height: theme.spacing(0.75),
}));

const StyledStepList = styled('ul')(({ theme }) => ({
    listStyle: 'none',
    margin: 0,
    marginTop: theme.spacing(1),
    padding: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(0.5),
}));

const StyledStepLink = styled(Link)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    textDecoration: 'none',
    color: theme.palette.text.primary,
    fontSize: theme.fontSizes.smallBody,
    borderRadius: theme.shape.borderRadius,
    padding: theme.spacing(0.5),
    '&:hover': {
        backgroundColor: theme.palette.action.hover,
    },
}));

const StyledCompletedIcon = styled(CheckCircleIcon)(({ theme }) => ({
    fontSize: theme.fontSizes.bodySize,
    color: theme.palette.success.main,
}));

const StyledUncompletedIcon = styled(RadioButtonUncheckedIcon)(({ theme }) => ({
    fontSize: theme.fontSizes.bodySize,
    color: theme.palette.text.disabled,
}));

const StyledStepText = styled('span', {
    shouldForwardProp: (prop) => prop !== 'completed',
})<{ completed: boolean }>(({ theme, completed }) => ({
    textDecoration: completed ? 'line-through' : 'none',
    color: completed ? theme.palette.text.secondary : 'inherit',
}));

const ChecklistStep: FC<{
    step: GettingStartedStep;
    onNavigate: (step: GettingStartedStep) => void;
}> = ({ step, onNavigate }) => (
    <li>
        <StyledStepLink to={step.href} onClick={() => onNavigate(step)}>
            {step.completed ? (
                <StyledCompletedIcon aria-label='Completed' />
            ) : (
                <StyledUncompletedIcon aria-label='Not completed' />
            )}
            <StyledStepText completed={step.completed}>
                {step.title}
            </StyledStepText>
        </StyledStepLink>
    </li>
);

export const GettingStartedChecklist: FC<{ mode: 'mini' | 'full' }> = ({
    mode,
}) => {
    const checklistEnabled = useUiFlag('gettingStartedChecklist');
    const [state, setState] = useLocalStorageState<ChecklistState>(
        'getting-started-checklist:v1',
        initialState,
    );
    const { projects, loading } = useProjects();
    const { data: inviteTokens } = useInviteTokens();

    if (!checklistEnabled || mode !== 'full' || state.dismissed || loading) {
        return null;
    }

    const steps = deriveGettingStartedSteps({
        projects: projects as ProjectListItem[],
        hasActiveInviteToken: Boolean(inviteTokens?.tokens?.length),
        manualSteps: state.manualSteps,
    });
    const completedCount = steps.filter((step) => step.completed).length;
    const allCompleted = completedCount === steps.length;

    const dismiss = () => {
        setState((prevState) => ({ ...prevState, dismissed: true }));
    };

    const toggleCollapsed = () => {
        setState((prevState) => ({
            ...prevState,
            collapsed: !prevState.collapsed,
        }));
    };

    const onNavigate = (step: GettingStartedStep) => {
        if (step.manual && !state.manualSteps.includes(step.id)) {
            setState((prevState) => ({
                ...prevState,
                manualSteps: [...prevState.manualSteps, step.id],
            }));
        }
    };

    if (allCompleted) {
        return (
            <StyledContainer>
                <StyledHeader>
                    <StyledTitle>You're all set 🎉</StyledTitle>
                    <IconButton
                        size='small'
                        onClick={dismiss}
                        aria-label='Dismiss getting started checklist'
                    >
                        <CloseIcon fontSize='inherit' />
                    </IconButton>
                </StyledHeader>
            </StyledContainer>
        );
    }

    return (
        <StyledContainer>
            <StyledHeader>
                <StyledTitle>Getting started</StyledTitle>
                <IconButton
                    size='small'
                    onClick={toggleCollapsed}
                    aria-label={
                        state.collapsed
                            ? 'Expand getting started checklist'
                            : 'Collapse getting started checklist'
                    }
                >
                    {state.collapsed ? (
                        <ExpandLessIcon fontSize='inherit' />
                    ) : (
                        <ExpandMoreIcon fontSize='inherit' />
                    )}
                </IconButton>
                <IconButton
                    size='small'
                    onClick={dismiss}
                    aria-label='Dismiss getting started checklist'
                >
                    <CloseIcon fontSize='inherit' />
                </IconButton>
            </StyledHeader>
            <StyledProgress
                variant='determinate'
                value={(completedCount / steps.length) * 100}
                aria-label={`${completedCount} of ${steps.length} steps completed`}
            />
            <Collapse in={!state.collapsed}>
                <StyledStepList>
                    {steps.map((step) => (
                        <ChecklistStep
                            key={step.id}
                            step={step}
                            onNavigate={onNavigate}
                        />
                    ))}
                </StyledStepList>
            </Collapse>
        </StyledContainer>
    );
};
