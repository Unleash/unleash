import { FC } from 'react';
import { Box } from '@mui/material';

interface ITextCellProps {
    value?: string | null;
}

export const TextCell: FC<ITextCellProps> = ({ value, children }) => {
    const text = children ?? value;
    if (!text) {
        return <Box sx={{ py: 1.5, px: 2 }} />;
    }

    return (
        <Box sx={{ py: 1.5, px: 2 }}>
            <span data-loading role="tooltip">
                {text}
            </span>
        </Box>
    );
};
