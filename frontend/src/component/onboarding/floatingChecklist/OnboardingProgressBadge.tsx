import { useContext } from 'react';
import { styled } from '@mui/material';
import { FloatingOnboardingChecklistContext } from './FloatingOnboardingChecklistContext.tsx';

const StyledBadge = styled('span', {
    shouldForwardProp: (prop) => prop !== 'completed',
})<{ completed?: boolean }>(({ theme, completed }) => ({
    ...theme.typography.caption,
    fontWeight: theme.typography.fontWeightRegular,
    lineHeight: 1,
    color: completed
        ? theme.palette.success.onContainer
        : theme.palette.primary.onContainer,
    backgroundColor: completed
        ? theme.palette.success.container
        : theme.palette.primary.container,
    border: `1px solid ${
        completed
            ? theme.palette.success.containerBorder
            : theme.palette.primary.containerBorder
    }`,
    borderRadius: theme.shape.borderRadius,
    padding: theme.spacing(0.25, 0.75),
    whiteSpace: 'nowrap',
}));

export const OnboardingProgressBadge = ({
    showLabel = false,
}: {
    showLabel?: boolean;
}) => {
    const context = useContext(FloatingOnboardingChecklistContext);
    if (!context) return null;
    const { completedCount, totalSteps } = context;
    const completed = completedCount === totalSteps;
    return (
        <StyledBadge completed={completed}>
            {completedCount}/{totalSteps}
            {showLabel ? ' Completed' : null}
        </StyledBadge>
    );
};
