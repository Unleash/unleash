import React, { FC } from 'react';
import { Box, Link } from '@mui/material';
import { useStyles } from './SelectAllButton.styles';

type SelectAllButtonProps = {
    isAllSelected: boolean;
    onClick: () => void;
};

export const SelectAllButton: FC<SelectAllButtonProps> = ({
    isAllSelected,
    onClick,
}) => {
    const { classes: styles } = useStyles();

    return (
        <Box sx={{ ml: 3.5, my: 0.5 }}>
            <Link
                onClick={onClick}
                className={styles.selectOptionsLink}
                component="button"
                underline="hover"
            >
                {isAllSelected ? 'Deselect all' : 'Select all'}
            </Link>
        </Box>
    );
};
