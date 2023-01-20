import { styled } from '@mui/material';
import { FileDropZone } from './FileDropZone';
import React from 'react';

export const StyledFileDropZone = styled(FileDropZone)(({ theme }) => ({
    padding: theme.spacing(4),
    border: '1px solid black',
    margin: theme.spacing(2, 0),
}));
