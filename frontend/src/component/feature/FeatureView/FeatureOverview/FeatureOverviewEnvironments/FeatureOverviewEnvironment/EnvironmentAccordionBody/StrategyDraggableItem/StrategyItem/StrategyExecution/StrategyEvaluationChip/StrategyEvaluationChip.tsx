import { forwardRef } from 'react';
import type { ChipProps } from '@mui/material';
import { Chip, styled } from '@mui/material';

const StyledChip = styled(Chip)(({ theme }) => ({
    borderRadius: `${theme.shape.borderRadius}px`,
    padding: theme.spacing(0.25, 0),
    fontSize: theme.fontSizes.smallerBody,
    height: 'auto',
    background: theme.palette.secondary.light,
    border: `1px solid ${theme.palette.secondary.border}`,
    color: theme.palette.secondary.dark,
    fontWeight: theme.typography.fontWeightBold,
}));

export const StrategyEvaluation = forwardRef<HTMLDivElement, ChipProps>(
    (props, ref) => <StyledChip size='small' ref={ref} {...props} />,
);
