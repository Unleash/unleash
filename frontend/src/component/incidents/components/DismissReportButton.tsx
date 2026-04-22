import { Button, styled } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const DismissBtn = styled(Button)(({ theme }) => ({
    fontSize: 11,
    color: theme.palette.text.secondary,
    border: `1px solid ${theme.palette.divider}`,
    background: 'transparent',
    padding: theme.spacing(0.5, 1.25),
    '&:hover': {
        borderColor: theme.palette.text.secondary,
        color: theme.palette.text.primary,
        background: '#fff',
    },
}));

export const DismissReportButton = ({ onClick }: { onClick: () => void }) => (
    <DismissBtn variant='outlined' size='small' onClick={onClick} startIcon={<CloseIcon fontSize='small' />}>
        Dismiss report
    </DismissBtn>
);
