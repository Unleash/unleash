import type React from 'react';
import { styled } from '@mui/material';

const StyledContainer = styled('ul')(({ theme }) => ({
    listStyleType: 'none',
    display: 'flex',
    flexWrap: 'wrap',
    gap: theme.spacing(1),
    padding: theme.spacing(2),
    margin: 0,
    marginBottom: '1rem !important',
    maxHeight: '412px',
    overflow: 'auto',
    borderRadius: theme.shape.borderRadiusMedium,
    border: `1px solid ${theme.palette.divider}`,
    '&:empty': {
        display: 'none',
    },
}));

export const ContextFormChipList: React.FC<{ children?: React.ReactNode }> =
    StyledContainer;
