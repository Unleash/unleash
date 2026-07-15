import { Box, styled } from '@mui/material';
import type { Story, StoryMeta } from 'component/stories/types';
import { QuickTourDemo } from './QuickTourDemo.tsx';

export const meta: StoryMeta = {
    title: 'Onboarding/QuickTourDemo',
    background: 'application',
};

// The tour is designed to fill its host container (dialog or signup panel).
// The frame here just gives it the same bounded viewport it would have in
// production so the layout and internal scroll match what users see.
const StoryFrame = styled(Box)(({ theme }) => ({
    width: '100%',
    maxWidth: theme.spacing(180),
    height: theme.spacing(90),
    margin: '0 auto',
    borderRadius: theme.shape.borderRadiusLarge,
    background: theme.palette.background.paper,
    overflow: 'hidden',
    boxShadow: theme.boxShadows.elevated,
}));

export const Default: Story = () => (
    <StoryFrame>
        <QuickTourDemo onComplete={() => {}} />
    </StoryFrame>
);
