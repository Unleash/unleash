import { forwardRef } from 'react';
import type { ChipProps } from '@mui/material';
import { Chip, styled } from '@mui/material';

const StyledChip = styled(Chip, {
    shouldForwardProp: (prop) => prop !== 'multiline',
})<{ multiline?: boolean }>(({ theme, multiline }) => ({
    borderRadius: `${theme.shape.borderRadius}px`,
    padding: theme.spacing(0.25, 0),
    fontSize: theme.fontSizes.smallerBody,
    height: 'auto',
    background: theme.palette.primary.container,
    border: `1px solid ${theme.palette.primary.containerBorder}`,
    color: theme.palette.primary.onContainer,
    fontWeight: theme.typography.fontWeightBold,
    ...(multiline
        ? {
              '.MuiChip-label': {
                  whiteSpace: 'collapse',
              },
          }
        : {}),
}));

export const StrategyEvaluationChip = forwardRef<
    HTMLDivElement,
    ChipProps & { multiline?: boolean }
>((props, ref) => <StyledChip size='small' ref={ref} {...props} />);
