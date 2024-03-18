import { Paper, styled } from '@mui/material';
import { TextField, Typography } from '@mui/material';
import {
    forwardRef,
    type FC,
    type ReactNode,
    type ComponentProps,
} from 'react';

export const StyledForm = styled('form')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    gap: theme.spacing(2),
    marginTop: theme.spacing(1),
}));

export const StyledAlerts = styled('section')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
}));

export const StyledHelpText = styled('p')(({ theme }) => ({
    marginBottom: theme.spacing(1),
    color: theme.palette.text.secondary,
    fontSize: theme.typography.body2.fontSize,
}));

export const StyledContainer = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(4),
}));

export const StyledButtonContainer = styled('div')({
    display: 'flex',
    justifyContent: 'flex-end',
});

export const StyledButtonSection = styled('section')(({ theme }) => ({
    display: 'flex',
    justifyContent: 'flex-end',
    gap: theme.spacing(2),
}));

export const StyledTextField = styled(TextField)(({ theme }) => ({
    width: '100%',
}));

export const StyledTitle = forwardRef<
    HTMLHeadingElement,
    { children: ReactNode }
>(({ children }, ref) => (
    <Typography
        ref={ref}
        component='h4'
        variant='h4'
        sx={(theme) => ({
            margin: theme.spacing(1, 0),
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

export const StyledRaisedSection: FC<ComponentProps<typeof Paper>> = ({
    ...props
}) => (
    <Paper
        elevation={0}
        sx={(theme) => ({
            background: theme.palette.background.elevation1,
            padding: theme.spacing(2, 3),
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            borderRadius: `${theme.shape.borderRadiusLarge}px`,
        })}
        {...props}
    />
);
