import type { SxProps, Theme } from '@mui/material';

export const asSxArray = (sx?: SxProps<Theme>) =>
    Array.isArray(sx) ? sx : [sx];
