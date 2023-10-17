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
    backgroundImage: `url('${formatAssetPath(confetti)}')`
    },
    zIndex: theme.zIndex.snackbar,
    backgroundColor: theme.palette.primary
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
