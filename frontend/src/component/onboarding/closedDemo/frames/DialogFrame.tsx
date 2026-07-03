import { Box, styled } from '@mui/material';
import { GridDemo } from '../ClosedDemo.tsx';
import { MockProjectContent, UnleashChromeMock } from './UnleashChromeMock.tsx';

const StyledFrame = styled(Box)({
    position: 'relative',
    height: '100%',
    overflow: 'hidden',
});

const StyledBackdrop = styled(Box)({
    position: 'absolute',
    inset: 0,
    background: 'rgba(23, 20, 48, 0.55)',
    backdropFilter: 'blur(2px)',
});

const StyledDialog = styled(Box)(({ theme }) => ({
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 'min(960px, 94%)',
    height: 'min(640px, 90%)',
    borderRadius: theme.shape.borderRadiusLarge,
    overflow: 'hidden',
    background: theme.palette.background.paper,
    boxShadow: '0 12px 48px rgba(0, 0, 0, 0.3)',
}));

/**
 * Framing 2 - the demo as a dialog floating over the (dimmed) Unleash app, like
 * a first-run onboarding modal. Rendered as an in-container overlay (not a body
 * portal) so it stays inside the frame.
 */
export const DialogFrame = () => (
    <StyledFrame>
        <UnleashChromeMock>
            <MockProjectContent />
        </UnleashChromeMock>
        <StyledBackdrop />
        <StyledDialog>
            <GridDemo />
        </StyledDialog>
    </StyledFrame>
);
