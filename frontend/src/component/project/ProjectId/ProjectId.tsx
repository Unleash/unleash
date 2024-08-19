import { styled } from '@mui/material';

export const ProjectId = styled('code')(({ theme }) => ({
    backgroundColor: theme.palette.background.elevation2,
    padding: theme.spacing(0.5, 1.5),
    display: 'inline-block',
    borderRadius: `${theme.shape.borderRadius}px`,
    fontSize: theme.typography.body2.fontSize,
}));
