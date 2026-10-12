import { TextField, type TextFieldProps, type Theme } from '@mui/material';
import { forwardRef } from 'react';

type SlotWithSx = { sx?: TextFieldProps['sx'] };

const underlineOnFocusSx = (theme: Theme) => ({
    '&:before': { borderBottom: 'none' },
    '&:hover:not(.Mui-disabled):before': {
        borderBottom: `1px solid ${theme.palette.text.disabled}`,
    },
    '&:after': {
        borderBottomWidth: '1px',
        borderBottomColor: theme.palette.primary.main,
    },
});

export const BorderlessInput = forwardRef<
    HTMLDivElement,
    TextFieldProps<'standard'>
>(({ slotProps, ...props }, ref) => (
    <TextField
        ref={ref}
        {...props}
        slotProps={
            {
                ...slotProps,
                input: {
                    ...slotProps?.input,
                    sx: [
                        underlineOnFocusSx,
                        (slotProps?.input as SlotWithSx)?.sx,
                    ],
                },
                htmlInput: {
                    ...slotProps?.htmlInput,
                    sx: [
                        { padding: 0 },
                        (slotProps?.htmlInput as SlotWithSx)?.sx,
                    ],
                },
            } as TextFieldProps<'standard'>['slotProps']
        }
    />
));
