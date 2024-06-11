import { styled } from '@mui/material';

// Visually hide content, but make it available to screen readers
export const ScreenReaderOnly = styled('div')(() => ({
    border: 0,
    clip: 'rect(0 0 0 0)',
    height: 'auto',
    margin: 0,
    overflow: 'hidden',
    padding: 0,
    position: 'absolute',
    width: '1px',
    whiteSpace: 'nowrap',
}));
