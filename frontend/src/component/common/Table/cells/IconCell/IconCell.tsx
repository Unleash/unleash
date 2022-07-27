import { Box } from '@mui/material';
import React, { ReactNode } from 'react';

interface IIconCellProps {
    icon: ReactNode;
    onClick?: () => void;
}

export const IconCell = ({ icon, onClick }: IIconCellProps) => {
    const handleClick =
        onClick &&
        ((event: React.SyntheticEvent) => {
            event.stopPropagation();
            onClick();
        });
    return (
        <Box
            onClick={handleClick}
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
