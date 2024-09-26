import { styled } from '@mui/material';

export const SectionHeader = styled('div')(({ theme }) => ({
    fontWeight: theme.typography.fontWeightBold,
    marginBottom: theme.spacing(1),
    fontSize: theme.typography.body1.fontSize,
}));

export const StepperBox = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: theme.spacing(2),
}));
