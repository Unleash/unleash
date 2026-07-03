import { Box, styled } from '@mui/material';
import { GridDemo } from '../ClosedDemo.tsx';
import { MockProjectContent, UnleashChromeMock } from './UnleashChromeMock.tsx';

const StyledCard = styled(Box)(({ theme }) => ({
    height: 560,
    borderRadius: theme.shape.borderRadiusLarge,
    border: `1px solid ${theme.palette.divider}`,
    overflow: 'hidden',
    background: theme.palette.background.paper,
    boxShadow: theme.boxShadows.card,
}));

/**
 * Framing 4 - the demo embedded inline on the project's feature-flags page,
 * exactly where the real ProjectOnboarding widget lives. Feels the most native.
 */
export const InlineFrame = () => (
    <UnleashChromeMock>
        <MockProjectContent
            topSlot={
                <StyledCard>
                    <GridDemo />
                </StyledCard>
            }
        />
    </UnleashChromeMock>
);
