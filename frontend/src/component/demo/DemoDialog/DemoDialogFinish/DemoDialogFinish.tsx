import { Button, Typography, styled } from '@mui/material';
import { DemoDialog } from '../DemoDialog';

const StyledActions = styled('div')(({ theme }) => ({
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: theme.spacing(3),
    marginTop: theme.spacing(7.5),
}));

const StyledButton = styled(Button)(({ theme }) => ({
    height: theme.spacing(7),
}));

interface IDemoDialogFinishProps {
    open: boolean;
    onClose: () => void;
    onRestart: () => void;
}

export const DemoDialogFinish = ({
    open,
    onClose,
    onRestart,
}: IDemoDialogFinishProps) => (
    <DemoDialog open={open} onClose={onClose}>
        <DemoDialog.Header>You finished the tutorial</DemoDialog.Header>
        <Typography color="textSecondary" sx={{ mt: 4 }}>
            Great job! Keep exploring Unleash, as this was just a small example
            of its full potential. You can do the tutorial again at any moment.
        </Typography>
        <StyledActions>
            <StyledButton
                variant="outlined"
                color="primary"
                onClick={onRestart}
            >
                Restart tutorial
            </StyledButton>
            <StyledButton variant="contained" color="primary" onClick={onClose}>
                Close
            </StyledButton>
        </StyledActions>
    </DemoDialog>
);
