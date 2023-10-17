import {
    Dialog,
    DialogProps,
    IconButton,
    Typography,
    styled,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import confetti from 'assets/img/ossSegmentsConfetti.svg';
import { formatAssetPath } from 'utils/formatPath';

const StyledDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialog-paper': {
        borderRadius: theme.shape.borderRadiusExtraLarge,
        maxWidth: theme.spacing(90),
        padding: theme.spacing(7.5),
        textAlign: 'center',
        backgroundImage: `url('${formatAssetPath(confetti)}')`,
    },
    zIndex: theme.zIndex.snackbar,
    '& .MuiModal-backdrop': {
        background:
            'linear-gradient(-54deg, rgba(61, 57, 128, 0.80) 0%, rgba(97, 91, 194, 0.80) 26.77%, rgba(106, 99, 224, 0.80) 48.44%, rgba(106, 99, 224, 0.80) 72.48%, rgba(129, 84, 191, 0.80) 99.99%)',
        backdropFilter: 'blur(2px)',
    },
}));

const StyledCloseButton = styled(IconButton)(({ theme }) => ({
    position: 'absolute',
    right: theme.spacing(2),
    top: theme.spacing(2),
    color: theme.palette.neutral.main,
}));

const StyledHeader = styled(Typography)(({ theme }) => ({
    fontSize: theme.fontSizes.largeHeader,
    fontWeight: theme.fontWeight.bold,
}));

interface ISegmentsDialogProps extends DialogProps {
    open: boolean;
    onClose: () => void;
    preventCloseOnBackdropClick?: boolean;
    children: React.ReactNode;
}

export const SegmentsDialog = ({
    open,
    onClose,
    preventCloseOnBackdropClick,
    children,
    ...props
}: ISegmentsDialogProps) => (
    <StyledDialog
        open={open}
        onClose={(_, r) => {
            if (preventCloseOnBackdropClick && r === 'backdropClick') return;
            onClose();
        }}
        {...props}
    >
        <StyledCloseButton aria-label='close' onClick={onClose}>
            <CloseIcon />
        </StyledCloseButton>
        {children}
    </StyledDialog>
);

SegmentsDialog.Header = StyledHeader;
