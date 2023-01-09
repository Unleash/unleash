import React, { FC } from 'react';
import { Box, Link, styled } from '@mui/material';

type SelectAllButtonProps = {
    isAllSelected: boolean;
    onClick: () => void;
};

const StyledLink = styled(Link)(({ theme }) => ({
    cursor: 'pointer',
    fontSize: theme.fontSizes.bodySize,
})) as typeof Link;

export const SelectAllButton: FC<SelectAllButtonProps> = ({
    isAllSelected,
    onClick,
}) => {
    return (
        <Box sx={{ ml: 3.5, my: 0.5 }}>
            <StyledLink onClick={onClick} component="button" underline="hover">
                {isAllSelected ? 'Deselect all' : 'Select all'}
            </StyledLink>
        </Box>
    );
};
