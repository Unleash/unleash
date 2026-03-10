import { Box, Button, styled, Typography } from '@mui/material';
import type { SignupStepContent } from './SignupDialog';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

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
    isSubmitting,
}) => {
    const description =
        data.inviteEmails.length === 0
            ? `Lead the way now, bring the team later.\nExplore the features first, then invite your colleagues to experience the full power of working together.`
            : `Bring the team now, explore together.\nWe'll invite your teammates by email so you can experience the full power of working together.`;

    return (
        <StyledContent>
            <StyledCheck />
            <StyledHeader>
                <StyledTitle>You're all set</StyledTitle>
                <Typography
                    variant='body2'
                    color='text.secondary'
                    sx={{ whiteSpace: 'pre-line', textAlign: 'center' }}
                >
                    {description}
                </Typography>
            </StyledHeader>
            <Button
                variant='contained'
                onClick={onNext}
                disabled={isSubmitting}
            >
                Start using Unleash
            </Button>
        </StyledContent>
    );
};
