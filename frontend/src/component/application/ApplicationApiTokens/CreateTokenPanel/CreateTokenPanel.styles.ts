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

export const StyledAppName = styled('span')({
    fontFamily: 'monospace',
});

export const StyledEnvironments = styled(RadioGroup)(({ theme }) => ({
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gap: theme.spacing(1.5),
    [theme.breakpoints.down('sm')]: {
        gridTemplateColumns: 'minmax(0, 1fr)',
    },
}));

export const StyledEnvironment = styled(FormControlLabel)(({ theme }) => ({
    margin: 0,
    padding: theme.spacing(0.5, 1),
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadiusMedium,
    overflowWrap: 'anywhere',
    '&:has(input:checked)': {
        borderColor: theme.palette.primary.containerBorder,
        backgroundColor: theme.palette.primary.container,
        '& .MuiFormControlLabel-label': {
            fontWeight: theme.typography.fontWeightBold,
        },
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

export const StyledOption = styled(FormControlLabel)(({ theme }) => ({
    alignItems: 'flex-start',
    marginRight: 0,
    '& .MuiFormControlLabel-label': {
        paddingTop: theme.spacing(1),
    },
}));

export const StyledOptionTitle = styled('span')(({ theme }) => ({
    display: 'block',
    fontWeight: theme.typography.fontWeightBold,
}));

export const StyledOptionDescription = styled('span')(({ theme }) => ({
    display: 'block',
    fontSize: theme.typography.body2.fontSize,
    color: theme.palette.text.secondary,
}));
