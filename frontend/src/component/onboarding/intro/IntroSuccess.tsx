import { Box, Button, styled, Typography } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';

interface IIntroSuccessProps {
    onReplay: () => void;
    onComplete: () => void;
}

const StyledRoot = styled(Box)(({ theme }) => ({
    height: '100%',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing(1),
    padding: theme.spacing(4),
    background: theme.palette.background.elevation1,
    textAlign: 'center',
}));

const StyledCheck = styled(Box)(({ theme }) => ({
    width: theme.spacing(9),
    height: theme.spacing(9),
    marginBottom: theme.spacing(2),
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: theme.palette.success.light,
    border: `1.5px solid ${theme.palette.success.border}`,
    color: theme.palette.success.main,
    '& svg': { fontSize: theme.spacing(5) },
}));

const StyledTitle = styled(Typography)(({ theme }) => ({
    fontSize: theme.typography.h1.fontSize,
    fontWeight: theme.typography.fontWeightBold,
    color: theme.palette.text.primary,
}));

const StyledSubtitle = styled(Typography)(({ theme }) => ({
    color: theme.palette.text.secondary,
}));

const StyledActions = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: theme.spacing(1.5),
    marginTop: theme.spacing(3),
}));

export const IntroSuccess = ({ onReplay, onComplete }: IIntroSuccessProps) => (
    <StyledRoot data-public data-testid='QUICK_TOUR_INTRO_SHOWCASE'>
        <StyledCheck>
            <CheckIcon />
        </StyledCheck>
        <StyledTitle variant='h2'>Tour complete!</StyledTitle>
        <StyledSubtitle>What do you want to do next?</StyledSubtitle>
        <StyledActions>
            <Button variant='outlined' onClick={onReplay}>
                Replay intro
            </Button>
            <Button
                variant='contained'
                onClick={onComplete}
                data-testid='QUICK_TOUR_INTRO_FINISH_BUTTON'
            >
                Create feature flag
            </Button>
        </StyledActions>
    </StyledRoot>
);
