import { Dialog, IconButton, Typography, styled } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const StyledDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialog-paper': {
        borderRadius: theme.shape.borderRadiusExtraLarge,
        maxWidth: theme.spacing(90),
        padding: theme.spacing(7.5),
        textAlign: 'center',
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

interface IDemoDialogProps {
    open: boolean;
    onClose: () => void;
    children: React.ReactNode;
}

export const DemoDialog = ({ open, onClose, children }: IDemoDialogProps) => (
    <StyledDialog open={open} onClose={onClose}>
        <StyledCloseButton aria-label="close" onClick={onClose}>
            <CloseIcon />
        </StyledCloseButton>
        {children}
    </StyledDialog>
);

DemoDialog.Header = StyledHeader;
