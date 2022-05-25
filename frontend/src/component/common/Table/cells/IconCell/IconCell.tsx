import { Box } from '@mui/material';
import { ReactNode } from 'react';

interface IIconCellProps {
    icon: ReactNode;
}

export const IconCell = ({ icon }: IIconCellProps) => {
    return (
        <Box
            data-loading
            sx={{
                pl: 2,
                pr: 1,
                display: 'flex',
                alignItems: 'center',
                minHeight: 60,
            }}
        >
            {icon}
        </Box>
    );
};
