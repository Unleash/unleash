import { Box, Typography, styled } from '@mui/material';
import Input from 'component/common/Input/Input';

export const StyledForm = styled('form')(({ theme }) => ({
    background: theme.palette.background.default,
}));

const StyledFormSection = styled('div')(({ theme }) => ({
    '& + *': {
        borderBlockStart: `1px solid ${theme.palette.divider}`,
    },

    padding: theme.spacing(6),
}));

export const TopGrid = styled(StyledFormSection)(({ theme }) => ({
    display: 'grid',
    gridTemplateAreas: `
        "icon header"
        ".    project-name"
        ".    project-description"`,
    gridTemplateColumns: 'auto 1fr',
    gap: theme.spacing(4),
}));

export const IconWrapper = styled('span')(({ theme }) => ({
    color: theme.palette.primary.main,
}));

export const StyledHeader = styled(Typography)({
    gridArea: 'header',
    alignSelf: 'center',
    fontWeight: 'lighter',
});

export const NameContainer = styled('div')(({ theme }) => ({
    gridArea: 'project-name',
    display: 'flex',
    flexFlow: 'column nowrap',
    gap: theme.spacing(2),
}));

export const DescriptionContainer = styled('div')({
    gridArea: 'project-description',
});

export const StyledInput = styled(Input)({
    width: '100%',
    fieldset: { border: 'none' },
    'label::first-letter': {
        textTransform: 'uppercase',
    },
});

export const ConfigButtons = styled(StyledFormSection)(({ theme }) => ({
    display: 'flex',
    flexFlow: 'row wrap',
    gap: theme.spacing(2),
    [theme.breakpoints.down('sm')]: {
        flexFlow: 'column nowrap',
        'div:has(button)': {
            display: 'flex',
            button: {
                flex: 1,
            },
        },
    },
}));

export const FormActions = styled(StyledFormSection)(({ theme }) => ({
    display: 'flex',
    gap: theme.spacing(5),
    justifyContent: 'flex-end',
    flexFlow: 'row wrap',
    [theme.breakpoints.down('sm')]: {
        flexFlow: 'column nowrap',
        gap: theme.spacing(2),
        '& > *': {
            display: 'flex',
            button: {
                flex: 1,
            },
        },
    },
}));

export const LimitContainer = styled(Box)(({ theme }) => ({
    '&:has(*)': {
        padding: theme.spacing(4, 6, 0, 6),
    },
}));
