import { Dialog, IconButton, styled } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { QuickTourDemo } from './QuickTourDemo.tsx';

const StyledDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialog-paper': {
        borderRadius: theme.shape.borderRadiusLarge,
        maxWidth: theme.spacing(180),
        width: '100%',
        height: '90vh',
        maxHeight: `calc(100vh - ${theme.spacing(6)})`,
        overflow: 'hidden',
        // On smaller screens the tour panel drops its two-column layout and
        // stacks past the viewport - let the paper scroll instead of clipping.
        [theme.breakpoints.down('md')]: {
            height: '100%',
            maxHeight: '100vh',
            borderRadius: 0,
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

interface IQuickTourDialogProps {
    open: boolean;
    onClose: () => void;
}

/**
 * The quick tour as a large centered dialog floating over the (dimmed) app.
 * Backdrop click, Escape, the ✕, and the tour's own Skip/Finish all close it.
 * Rendered once at App level by {@link QuickTourProvider}; opened via
 * {@link useQuickTour}.
 */
export const QuickTourDialog = ({ open, onClose }: IQuickTourDialogProps) => (
    <StyledDialog open={open} onClose={onClose} maxWidth={false}>
        <StyledClose onClick={onClose} aria-label='Close' size='small'>
            <CloseIcon fontSize='small' />
        </StyledClose>
        <QuickTourDemo onComplete={onClose} />
    </StyledDialog>
);
