import { Button, Typography, styled } from '@mui/material';
import { DemoDialog } from '../DemoDialog';
import Confetti from 'react-confetti';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';

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
    <>
        <ConditionallyRender
            condition={open}
            show={
                <Confetti
                    recycle={false}
                    numberOfPieces={1000}
                    initialVelocityY={50}
                    gravity={0.3}
                    style={{ zIndex: 3000 }}
                />
            }
        />
        <DemoDialog open={open} onClose={onClose}>
            <DemoDialog.Header>You finished the demo</DemoDialog.Header>
            <Typography color="textSecondary" sx={{ mt: 4 }}>
                Great job! Keep exploring Unleash, as this was just a small
                example of its full potential. You can do the demo again at any
                moment.
            </Typography>
            <StyledActions>
                <StyledButton
                    variant="outlined"
                    color="primary"
                    onClick={onRestart}
                >
                    Restart demo
                </StyledButton>
                <StyledButton
                    variant="contained"
                    color="primary"
                    onClick={onClose}
                    data-testid="DEMO_FINISH_BUTTON"
                >
                    Continue
                </StyledButton>
            </StyledActions>
        </DemoDialog>
    </>
);
