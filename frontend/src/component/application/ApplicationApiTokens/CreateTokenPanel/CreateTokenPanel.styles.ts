import { FormControlLabel, RadioGroup, styled } from '@mui/material';

export const StyledPanel = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100%',
    width: theme.spacing(90),
    maxWidth: '100%',
}));

export const StyledHeader = styled('div')(({ theme }) => ({
    padding: theme.spacing(4, 10, 3, 4),
    borderBottom: `1px solid ${theme.palette.divider}`,
}));

export const StyledBody = styled('div')(({ theme }) => ({
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(3),
    padding: theme.spacing(3, 4),
}));

export const StyledSection = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1),
}));

export const StyledFooter = styled('div')(({ theme }) => ({
    display: 'flex',
    justifyContent: 'flex-end',
    gap: theme.spacing(2),
    padding: theme.spacing(2, 4),
    borderTop: `1px solid ${theme.palette.divider}`,
}));

export const StyledEnvironments = styled(RadioGroup)(({ theme }) => ({
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
    gap: theme.spacing(1.5),
}));

export const StyledEnvironment = styled(FormControlLabel)(({ theme }) => ({
    margin: 0,
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadius,
    '&:has(input:checked)': {
        borderColor: theme.palette.primary.main,
        backgroundColor: theme.palette.secondary.light,
    },
    '&:has(input:focus-visible)': {
        outline: `2px solid ${theme.palette.primary.main}`,
    },
}));

export const StyledCode = styled('pre')(({ theme }) => ({
    margin: 0,
    padding: theme.spacing(2),
    borderRadius: theme.shape.borderRadius,
    overflowX: 'auto',
    fontSize: theme.typography.body2.fontSize,
    backgroundColor: theme.palette.text.primary,
    color: theme.palette.background.paper,
}));
