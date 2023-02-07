import { styled } from '@mui/material';
import { FileDropZone } from './FileDropZone';

export const StyledFileDropZone = styled(FileDropZone)(({ theme }) => ({
    padding: theme.spacing(4, 2, 2, 2),
    border: `1px dashed ${theme.palette.secondary.border}`,
    borderRadius: theme.shape.borderRadiusLarge,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
}));
