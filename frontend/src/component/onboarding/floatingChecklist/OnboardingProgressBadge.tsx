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
