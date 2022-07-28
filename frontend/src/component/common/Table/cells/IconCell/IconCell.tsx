import { Box } from '@mui/material';
import React, { ReactNode } from 'react';

interface IIconCellProps {
    icon: ReactNode;
}

export const IconCell = ({ icon }: IIconCellProps) => {
    return (
        <Box
            sx={{
                pl: 2,
                pr: 1,
                display: 'flex',
                alignItems: 'center',
            }}
        >
            {icon}
        </Box>
    );
};
