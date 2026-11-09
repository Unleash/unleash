import type { KeyboardEvent, Ref } from 'react';
import { InputAdornment, styled, TextField } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

const StyledSearch = styled('div')(({ theme }) => ({
    padding: theme.spacing(1.5, 1.5, 1),
    borderBottom: `1px solid ${theme.palette.divider}`,
}));

type SelectSearchInputProps = {
    placeholder: string;
    inputRef: Ref<HTMLInputElement>;
    inputProps: Record<string, unknown>;
    isKeyboardHighlighted: boolean;
    onKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void;
};

export const SelectSearchInput = ({
    placeholder,
    inputRef,
    inputProps,
    isKeyboardHighlighted,
    onKeyDown,
}: SelectSearchInputProps) => (
    <StyledSearch>
        <TextField
            size='large'
            fullWidth
            autoFocus
            placeholder={placeholder}
            inputRef={inputRef}
            focused={isKeyboardHighlighted ? false : undefined}
            slotProps={{
                input: {
                    startAdornment: (
                        <InputAdornment
                            position='start'
                            sx={{ marginRight: 0 }}
                        >
                            <SearchIcon fontSize='small' />
                        </InputAdornment>
                    ),
                },
                htmlInput: {
                    ...inputProps,
                    onKeyDown,
                    'aria-label': placeholder,
                    sx: {
                        '&::placeholder': {
                            color: 'text.secondary',
                            opacity: 1,
                        },
                    },
                },
            }}
        />
    </StyledSearch>
);
