import React from 'react';
import { styled } from '@mui/material';

const StyledContainer = styled('ul')(({ theme }) => ({
    listStyleType: 'none',
    display: 'flex',
    flexWrap: 'wrap',
    gap: theme.spacing(1),
    padding: 0,
    margin: 0,
    marginBottom: '1rem !important',
}));

export const ContextFormChipList: React.FC = StyledContainer;
