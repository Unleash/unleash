import { Button, LinearProgress, styled } from '@mui/material';

const ProgressContainer = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing(1.5),
}));

const StyledLinearProgress = styled(LinearProgress)(({ theme }) => ({
    width: '100px',
    height: theme.spacing(0.5),
    borderRadius: theme.shape.borderRadiusLarge,
}));

interface IOnboardingProgressProps {
    step: number;
    maxSteps: number;
    onDismiss: () => void;
}

export const OnboardingProgress = ({
    step,
    maxSteps,
    onDismiss,
}: IOnboardingProgressProps) => {
    const isOnboarded = step >= maxSteps;
    const fakeSomeProgressToMakeItLookBetter = 10;
    const progress =
        (step / maxSteps) * 100 + fakeSomeProgressToMakeItLookBetter;
    return (
        <ProgressContainer>
            {step}/{maxSteps} Completed
            {isOnboarded ? (
                <Button
                    onClick={(e) => {
                        e.stopPropagation();
                        onDismiss();
                    }}
                    variant='outlined'
                    component='span'
                    size='small'
                >
                    Dismiss
                </Button>
            ) : (
                <StyledLinearProgress variant='determinate' value={progress} />
            )}
        </ProgressContainer>
    );
};
