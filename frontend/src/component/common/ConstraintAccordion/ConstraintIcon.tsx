import { VFC } from 'react';
import { Box } from '@mui/material';
import { TrackChanges } from '@mui/icons-material';

interface IConstraintIconProps {
    compact?: boolean;
}

export const ConstraintIcon: VFC<IConstraintIconProps> = ({ compact }) => (
    <Box
        sx={{
            backgroundColor: 'primary.light',
            p: compact ? '1px' : '2px',
            borderRadius: '50%',
            width: compact ? '18px' : '24px',
            height: compact ? '18px' : '24px',
            marginRight: '13px',
        }}
    >
        <TrackChanges
            sx={theme => ({
                fill: theme.palette.common.white,
                display: 'block',
                width: compact ? theme.spacing(2) : theme.spacing(2.5),
                height: compact ? theme.spacing(2) : theme.spacing(2.5),
            })}
        />
    </Box>
);
