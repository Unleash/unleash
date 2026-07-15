import { Box, Dialog, styled } from '@mui/material';
import { ClosedDemo } from 'component/onboarding/closedDemo/ClosedDemo.tsx';

const StyledDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialog-paper': {
        overflow: 'hidden',
        // On smaller screens the tour panel stacks and grows past the
        // viewport - let the paper scroll instead of clipping.
        [theme.breakpoints.down('md')]: {
            overflow: 'auto',
        },
    },
    padding: theme.spacing(8),
    [theme.breakpoints.down('md')]: {
        padding: 0,
    },
}));

const StyledTourContainer = styled(Box)(({ theme }) => ({
    height: '100%',
    minHeight: 0,
    overflow: 'hidden',
    [theme.breakpoints.down('md')]: {
        height: 'auto',
        minHeight: 'auto',
        overflow: 'visible',
    },
}));

interface ISignupTourDialogProps {
    onComplete: () => void;
}

/**
 * Full-screen dialog that hosts the onboarding {@link ClosedDemo}. Split out
 * from `SignupDialog` so the base signup flow doesn't carry a demo-mode
 * `tour` styled-prop or a second render branch.
 */
export const SignupTourDialog = ({ onComplete }: ISignupTourDialogProps) => (
    <StyledDialog open fullScreen>
        <StyledTourContainer>
            <ClosedDemo onComplete={onComplete} />
        </StyledTourContainer>
    </StyledDialog>
);
