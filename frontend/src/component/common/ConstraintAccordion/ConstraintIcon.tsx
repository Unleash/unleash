import type { VFC } from 'react';
import { Box } from '@mui/material';
import TrackChanges from '@mui/icons-material/TrackChanges';

interface IConstraintIconProps {
    compact?: boolean;
    disabled?: boolean;
}

export const ConstraintIcon: VFC<IConstraintIconProps> = ({
    compact,
    disabled,
}) => (
    <Box
        className='constraint-icon-container'
        sx={(theme) => ({
            backgroundColor: disabled
                ? theme.palette.neutral.border
                : 'primary.light',
            p: compact ? '1px' : '2px',
            borderRadius: '50%',
            width: compact ? '18px' : '24px',
            height: compact ? '18px' : '24px',
            marginRight: '13px',
        })}
    >
        <TrackChanges
            className='constraint-icon'
            sx={(theme) => ({
                fill: theme.palette.common.white,
                display: 'block',
                width: compact ? theme.spacing(2) : theme.spacing(2.5),
                height: compact ? theme.spacing(2) : theme.spacing(2.5),
            })}
        />
    </Box>
);
