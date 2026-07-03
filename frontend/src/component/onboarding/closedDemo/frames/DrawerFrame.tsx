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
    background: 'rgba(23, 20, 48, 0.4)',
});

const StyledDrawer = styled(Box)(({ theme }) => ({
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    width: 'min(760px, 96%)',
    background: theme.palette.background.paper,
    boxShadow: '-8px 0 40px rgba(0, 0, 0, 0.25)',
    overflow: 'hidden',
}));

/**
 * Framing 3 - the demo as a right-hand drawer/side panel sliding over the app,
 * matching Unleash's drawer pattern. In-container overlay, not a body portal.
 */
export const DrawerFrame = () => (
    <StyledFrame>
        <UnleashChromeMock>
            <MockProjectContent />
        </UnleashChromeMock>
        <StyledBackdrop />
        <StyledDrawer>
            <GridDemo />
        </StyledDrawer>
    </StyledFrame>
);
