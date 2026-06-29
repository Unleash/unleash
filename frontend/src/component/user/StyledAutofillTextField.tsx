import { styled, TextField } from '@mui/material';

export const StyledAutofillTextField = styled(TextField)(({ theme }) => ({
    '&&& input': {
        boxShadow: `transparent 0px 0px 0px 1px inset, ${theme.palette.background.paper} 0px 0px 0px 100px inset`,
        WebkitTextFillColor: theme.palette.text.primary,
        caretColor: theme.palette.text.primary,
    },
}));
