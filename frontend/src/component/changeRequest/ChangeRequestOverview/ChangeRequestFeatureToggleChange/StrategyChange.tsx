import { Box, Link, Typography } from '@mui/material';
import { FC } from 'react';

interface IStrategyChangeProps {
    onDiscard: () => void;
}

export const StrategyAddedChange: FC<IStrategyChangeProps> = ({
    children,
    onDiscard,
}) => {
    return (
        <Box sx={{ p: 1, display: 'flex', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', gap: 1 }}>
                <Typography
                    sx={theme => ({ color: theme.palette.success.main })}
                >
                    + Adding strategy:
                </Typography>
                {children}
            </Box>
            <Box>
                <Link onClick={onDiscard}>Discard</Link>
            </Box>
        </Box>
    );
};

export const StrategyEditedChange: FC<IStrategyChangeProps> = ({
    children,
    onDiscard,
}) => {
    return (
        <Box sx={{ p: 1, display: 'flex', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', gap: 1 }}>
                <Typography>Editing strategy:</Typography>
                {children}
            </Box>
            <Box>
                <Link onClick={onDiscard}>Discard</Link>
            </Box>
        </Box>
    );
};

export const StrategyDeletedChange: FC<IStrategyChangeProps> = ({
    onDiscard,
}) => {
    return (
        <Box sx={{ p: 1, display: 'flex', justifyContent: 'space-between' }}>
            <Typography sx={theme => ({ color: theme.palette.error.main })}>
                - Deleting strategy
            </Typography>
            <Box>
                <Link onClick={onDiscard}>Discard</Link>
            </Box>
        </Box>
    );
};
