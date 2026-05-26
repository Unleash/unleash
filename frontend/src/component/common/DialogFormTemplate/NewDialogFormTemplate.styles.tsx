import { Box, styled } from '@mui/material';
import Input from 'component/common/Input/Input';

export const StyledForm = styled('form')(({ theme }) => ({
    background: theme.palette.background.default,
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
}));

const Section = styled('div')(({ theme }) => ({
    padding: theme.spacing(0, 4),
}));

export const NameRow = styled(Section)(({ theme }) => ({
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(1),
}));

export const DescriptionRow = styled(Section)(({ theme }) => ({
    paddingBottom: theme.spacing(4),
}));

export const ConfigRow = styled(Section)(({ theme }) => ({
    display: 'flex',
    gap: theme.spacing(2),
    flexFlow: 'row wrap',
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(3),
}));

export const ToggleRow = styled(Section)(({ theme }) => ({
    paddingTop: 0,
    paddingBottom: theme.spacing(4),
}));

export const Spacer = styled('div')({
    flex: 1,
});

export const FormActions = styled(Section)(({ theme }) => ({
    display: 'flex',
    gap: theme.spacing(2),
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(3),
}));

export const InlineInput = styled(Input)(() => ({
    width: '100%',
    fieldset: { border: 'none' },
    '& .MuiOutlinedInput-root': {
        padding: 0,
    },
    '& .MuiInputBase-input': {
        padding: 0,
    },
}));

export const NameInput = styled(InlineInput)(({ theme }) => ({
    '& .MuiInputBase-input': {
        fontSize: theme.typography.body1.fontSize,
        fontWeight: theme.fontWeight.bold,
        lineHeight: 1.4,
    },
    '& .MuiInputBase-input::placeholder': {
        color: theme.palette.text.primary,
        opacity: 0.55,
        fontWeight: theme.fontWeight.bold,
    },
}));

export const DescriptionInput = styled(InlineInput)(({ theme }) => ({
    '& .MuiInputBase-input': {
        fontSize: theme.typography.body1.fontSize,
        color: theme.palette.text.secondary,
    },
    '& .MuiInputBase-input::placeholder': {
        color: theme.palette.text.secondary,
        opacity: 0.8,
    },
}));

export const LimitContainer = styled(Box)(({ theme }) => ({
    '&:has(*)': {
        padding: theme.spacing(0, 4, 2, 4),
    },
}));
