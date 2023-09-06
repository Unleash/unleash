import { styled } from '@mui/system';
import { FormControlLabel, TextField, Typography } from '@mui/material';
import { forwardRef, type FC, type ReactNode } from 'react';

export const StyledForm = styled('form')({
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    gap: '1rem',
});

export const StyledAlerts = styled('section')(({ theme }) => ({
    marginBottom: '36px',
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
}));

export const StyledHelpText = styled('p')({
    marginBottom: '0.5rem',
});

export const StyledContainer = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(4),
}));

export const StyledButtonContainer = styled('div')({
    marginTop: 'auto',
    display: 'flex',
    justifyContent: 'flex-end',
});

export const StyledButtonSection = styled('section')(({ theme }) => ({
    display: 'flex',
    justifyContent: 'flex-end',
    paddingTop: theme.spacing(2),
    gap: theme.spacing(1),
}));

export const StyledTextField = styled(TextField)({
    width: '100%',
    marginBottom: '1rem',
    marginTop: '0px',
});

export const StyledSelectAllFormControlLabel = styled(FormControlLabel)({
    paddingBottom: '16px',
});

export const StyledTitle = forwardRef<
    HTMLHeadingElement,
    { children: ReactNode }
>(({ children }, ref) => (
    <Typography
        ref={ref}
        component="h4"
        variant="h4"
        sx={theme => ({
            marginBottom: theme.spacing(2),
            marginTop: theme.spacing(2),
        })}
    >
        {children}
    </Typography>
));

export const StyledAddonParameterContainer = styled('div')({
    marginTop: '25px',
});

export const StyledConfigurationSection = styled('section')(({ theme }) => ({
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: theme.palette.neutral.border,
    borderRadius: `${theme.shape.borderRadiusLarge}px`,
    padding: theme.spacing(3),
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(3),
}));
