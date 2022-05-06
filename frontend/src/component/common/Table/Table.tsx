import { FC } from 'react';
import { Box, Table as MUITable } from '@mui/material';

export const Table: FC = ({ children }) => (
    <Box sx={{ p: 4, pb: 0 }}>
        <MUITable>{children}</MUITable>
    </Box>
);
