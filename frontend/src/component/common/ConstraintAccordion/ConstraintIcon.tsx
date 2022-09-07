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
            sx={{
                fill: 'white',
                display: 'block',
                width: compact ? '16px' : '20px',
                height: compact ? '16px' : '20px',
            }}
        />
    </Box>
);
