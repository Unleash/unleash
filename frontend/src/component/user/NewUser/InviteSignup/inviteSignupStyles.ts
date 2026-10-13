import {
    Button,
    styled,
    TextField,
    type Theme,
    Typography,
} from '@mui/material';

const stackStyles = ({ theme }: { theme: Theme }) => ({
    display: 'flex',
    flexDirection: 'column' as const,
    gap: theme.spacing(3),
});

export const StyledContainer = styled('div')(stackStyles);

export const StyledForm = styled('form')(stackStyles);

export const StyledHeader = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1.5),
    wordBreak: 'break-word',
}));

export const StyledTitle = styled(Typography)(({ theme }) => ({
    fontSize: theme.typography.h2.fontSize,
    fontWeight: theme.typography.fontWeightBold,
    lineHeight: '28px',
}));

export const StyledSubtitle = styled(Typography)(({ theme }) => ({
    lineHeight: '20px',
    color: theme.palette.text.secondary,
}));

export const StyledField = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1),
}));

export const StyledLabel = styled('label')(({ theme }) => ({
    fontWeight: theme.typography.fontWeightBold,
    lineHeight: '22px',
}));

export const StyledInput = styled(TextField)(({ theme }) => ({
    '&&& .MuiOutlinedInput-root': {
        height: 52,
        fontWeight: theme.typography.fontWeightMedium,
    },
    '& .MuiOutlinedInput-root.Mui-readOnly': {
        backgroundColor: theme.palette.background.elevation1,
    },
    '& .MuiOutlinedInput-notchedOutline': {
        borderColor: theme.palette.neutral.containerBorder,
    },
}));

export const StyledPrimaryButton = styled(Button)(({ theme }) => ({
    height: 40,
    fontWeight: theme.typography.fontWeightBold,
}));
