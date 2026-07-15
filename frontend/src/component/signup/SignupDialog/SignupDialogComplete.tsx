import { Box, Button, styled, Typography } from '@mui/material';
import type { SignupStepContent } from './SignupDialog';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import { useUiFlag } from 'hooks/useUiFlag';

const StyledContent = styled(Box)({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
});

const StyledCheck = styled(CheckCircleOutlineIcon)(({ theme }) => ({
    fontSize: theme.spacing(6),
    color: theme.palette.success.main,
    marginBottom: theme.spacing(2),
}));

const StyledHeader = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: theme.spacing(3),
    width: '100%',
}));

const StyledTitle = styled('h1')(({ theme }) => ({
    marginBottom: theme.spacing(1.5),
    fontSize: theme.typography.h1.fontSize,
}));

export const SignupDialogComplete: SignupStepContent = ({
    data,
    onNext,
    onBack,
    isSubmitting,
    error,
}) => {
    const offerTour = useUiFlag('quickTourDemo');
    const description =
        data.inviteEmails.length === 0
            ? `Lead the way now, bring the team later.\nExplore the features first, then invite your colleagues to experience the full power of working together.`
            : `Bring the team now, explore together.\nWe'll invite your teammates by email so you can experience the full power of working together.`;

    return (
        <StyledContent data-public>
            <StyledCheck />
            <StyledHeader>
                <StyledTitle>You're all set</StyledTitle>
                <Typography
                    variant='body2'
                    sx={{
                        color: 'text.secondary',
                        whiteSpace: 'pre-line',
                        textAlign: 'center',
                    }}
                >
                    {description}
                </Typography>
            </StyledHeader>
            {offerTour ? (
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 1.5,
                    }}
                >
                    <Button
                        variant='contained'
                        onClick={() => onNext('tour')}
                        disabled={isSubmitting}
                        data-testid='SIGNUP_TAKE_TOUR_BUTTON'
                    >
                        Take the 2-minute tour
                    </Button>
                    <Button
                        variant='text'
                        onClick={() => onNext('complete')}
                        disabled={isSubmitting}
                        data-testid='SIGNUP_SKIP_TOUR_BUTTON'
                    >
                        I know Unleash, take me to my project
                    </Button>
                </Box>
            ) : (
                <Button
                    variant='contained'
                    onClick={() => onNext('complete')}
                    disabled={isSubmitting}
                >
                    Start using Unleash
                </Button>
            )}
            {error && (
                <Button
                    variant='text'
                    onClick={onBack}
                    disabled={isSubmitting}
                    sx={{ mt: 2 }}
                >
                    Back
                </Button>
            )}
        </StyledContent>
    );
};
