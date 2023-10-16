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

interface SegmentsSplashScreenProps {
    open: boolean;
    onClose: () => void;
    showSegments: () => void;
}

export const SegmentsSplashScreen = ({
    open,
    onClose,
    showSegments,
}: SegmentsSplashScreenProps) => (
    <>
        <DemoDialog open={open} onClose={onClose}>
            <DemoDialog.Header>
                Segments are now available in Open Source!
            </DemoDialog.Header>
            <Typography color='textSecondary' sx={{ mt: 4 }}>
                We are excited to announce that we are releasing an enterprise
                feature for our open source community
            </Typography>
            <StyledActions>
                <StyledButton
                    variant='contained'
                    color='primary'
                    onClick={showSegments}
                >
                    Show me segments
                </StyledButton>
                <StyledButton
                    variant='outlined'
                    color='primary'
                    onClick={onClose}
                >
                    Close
                </StyledButton>
            </StyledActions>
        </DemoDialog>
    </>
);
