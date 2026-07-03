import { Dialog, IconButton, styled } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { GridDemo } from 'component/onboarding/closedDemo/ClosedDemo.tsx';

const StyledDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialog-paper': {
        width: 'min(960px, 94vw)',
        height: 'min(680px, 92vh)',
        maxWidth: 'unset',
        margin: 0,
        overflow: 'hidden',
        borderRadius: theme.shape.borderRadiusLarge,
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
 * The quick tour as a centered dialog floating over the (dimmed) app - as
 * opposed to the full-screen dialog used in the signup flow. Backdrop click,
 * Escape, the ✕, and the tour's own Skip/Finish all close it.
 */
export const QuickTourDialog = ({ onClose }: { onClose: () => void }) => (
    <StyledDialog open onClose={onClose}>
        <StyledClose onClick={onClose} aria-label='Close' size='small'>
            <CloseIcon fontSize='small' />
        </StyledClose>
        <GridDemo onComplete={onClose} />
    </StyledDialog>
);
