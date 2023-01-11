import { FC } from 'react';
import { Box } from '@mui/material';

export const TablePlaceholder: FC = ({ children }) => (
    <Box
        sx={{
            border: theme => `2px dashed ${theme.palette.neutral.light}`,
            p: 1.6,
            textAlign: 'center',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            mt: 2,
            width: '100%',
        }}
    >
        {children}
    </Box>
);
