import { useContext } from 'react';
import { styled } from '@mui/material';
import { FloatingOnboardingChecklistContext } from './FloatingOnboardingChecklistContext.tsx';

const StyledBadge = styled('span')(({ theme }) => ({
    fontSize: theme.typography.caption.fontSize,
    fontWeight: theme.typography.fontWeightBold,
    lineHeight: 1,
    color: theme.palette.secondary.contrastText,
    backgroundColor: theme.palette.secondary.light,
    border: `1px solid ${theme.palette.secondary.border}`,
    borderRadius: theme.shape.borderRadius,
    padding: theme.spacing(0.25, 0.75),
    whiteSpace: 'nowrap',
}));

/**
 * Small progress badge shared by the header menu and the checklist window.
 * Defaults to a compact "X/Y" for tight spots; pass `showLabel` for the
 * "X/Y Completed" form used inside the checklist header. Renders nothing
 * when the checklist context isn't available so callers don't need to
 * guard the render.
 */
export const OnboardingProgressBadge = ({
    showLabel = false,
}: {
    showLabel?: boolean;
}) => {
    const context = useContext(FloatingOnboardingChecklistContext);
    if (!context) return null;
    const { completedCount, totalSteps } = context;
    return (
        <StyledBadge>
            {completedCount}/{totalSteps}
            {showLabel ? ' Completed' : null}
        </StyledBadge>
    );
};
