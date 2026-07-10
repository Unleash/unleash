import { Dialog, IconButton, styled } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { ClosedDemo } from 'component/onboarding/closedDemo/ClosedDemo.tsx';

const StyledDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialog-paper': {
        borderRadius: theme.shape.borderRadiusLarge,
        maxWidth: theme.spacing(180),
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        // On smaller screens the tour panel drops its two-column layout and
        // stacks past the viewport - let the paper scroll instead of clipping.
        [theme.breakpoints.down('md')]: {
            overflow: 'auto',
        },
    },
}));

const StyledClose = styled(IconButton)(({ theme }) => ({
    position: 'absolute',
    top: theme.spacing(1),
    right: theme.spacing(1),
    zIndex: 1,
    color: theme.palette.text.secondary,
}));

/**
 * The quick tour as a large centered dialog floating over the (dimmed) app.
 * Backdrop click, Escape, the ✕, and the tour's own Skip/Finish all close it.
 */
export const QuickTourDialog = ({ onClose }: { onClose: () => void }) => (
    <StyledDialog open onClose={onClose}>
        <StyledClose onClick={onClose} aria-label='Close' size='small'>
            <CloseIcon fontSize='small' />
        </StyledClose>
        <ClosedDemo onComplete={onClose} />
    </StyledDialog>
);
