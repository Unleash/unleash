import { FC } from 'react';
import { Box } from '@mui/material';

export const TablePlaceholder: FC = ({ children }) => (
    <Box
        sx={{
            border: theme => `2px dashed ${theme.palette.divider}`,
            p: 8,
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
