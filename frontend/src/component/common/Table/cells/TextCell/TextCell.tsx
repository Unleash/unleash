import { VFC, ReactNode } from 'react';
import { Box } from '@mui/material';

interface IDateCellProps {
    children?: ReactNode;
}

export const TextCell: VFC<IDateCellProps> = ({ children }) => {
    if (!children) {
        return <Box sx={{ py: 1.5, px: 2 }} />;
    }

    return (
        <Box sx={{ py: 1.5, px: 2 }}>
            <span data-loading role="tooltip">
                {children}
            </span>
        </Box>
    );
};
