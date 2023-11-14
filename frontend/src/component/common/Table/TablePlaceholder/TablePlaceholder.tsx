import React, { FC } from 'react';
import { Box } from '@mui/material';

interface ITablePlaceholderProps {
    styles?: React.CSSProperties;
}

export const TablePlaceholder: FC<ITablePlaceholderProps> = ({
    children,
    styles = {},
}) => (
    <Box
        sx={{
            border: (theme) => `2px dashed ${theme.palette.divider}`,
            p: 8,
            textAlign: 'center',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            mt: 2,
            width: '100%',
            ...styles,
        }}
    >
        {children}
    </Box>
);
