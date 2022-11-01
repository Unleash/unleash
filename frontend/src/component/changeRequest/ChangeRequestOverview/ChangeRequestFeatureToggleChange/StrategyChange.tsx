import { Box, Typography } from '@mui/material';
import { FC } from 'react';

export const StrategyAddedChange: FC = ({ children }) => {
    return (
        <Box sx={{ p: 1, display: 'flex', gap: 1 }}>
            <Typography sx={theme => ({ color: theme.palette.success.main })}>
                + Strategy Added:
            </Typography>
            {children}
        </Box>
    );
};

export const StrategyEditedChange: FC = () => {
    return <Box sx={{ p: 1 }}>Strategy Edited</Box>;
};

export const StrategyDeletedChange: FC = () => {
    return (
        <Box sx={{ p: 1 }}>
            <Typography sx={theme => ({ color: theme.palette.error.main })}>
                - Strategy Deleted
            </Typography>
        </Box>
    );
};
