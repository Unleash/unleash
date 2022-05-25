import { Box } from '@mui/material';
import { ReactNode } from 'react';

interface IContextActionsCellProps {
    children: ReactNode;
}

export const ActionCell = ({ children }: IContextActionsCellProps) => {
    return (
        <Box
            data-loading
            sx={{ display: 'flex', justifyContent: 'flex-end', px: 2 }}
        >
            {children}
        </Box>
    );
};
