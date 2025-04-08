import Add from '@mui/icons-material/Add';
import {
    Autocomplete,
    InputAdornment,
    styled,
    TextField,
    useTheme,
} from '@mui/material';
import type { AutocompleteRenderInputParams } from '@mui/material/Autocomplete';
import { useState } from 'react';
import type { ReactNode } from 'react';

interface IAutocompleteBoxProps {
    label: string;
    options: IAutocompleteBoxOption[];
    value?: IAutocompleteBoxOption[];
    onChange: (value: IAutocompleteBoxOption[]) => void;
    disabled?: boolean;
    icon?: ReactNode | null;
}

export interface IAutocompleteBoxOption {
    value: string;
    label: string;
}

const StyledContainer = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    borderRadius: theme.spacing(2),
    '& .MuiInputLabel-root[data-shrink="false"]': {
        top: 3,
    },
}));

const StyledAutocomplete = styled(Autocomplete)({
    flex: 1,
}) as typeof Autocomplete;

export const AutocompleteBox = ({
    label,
    options,
    value = [],
    onChange,
    disabled,
    icon,
}: IAutocompleteBoxProps) => {
    const [_, setPlaceholder] = useState('Add Segments');
    const theme = useTheme();

    const renderCustomInput = (params: AutocompleteRenderInputParams) => {
        const { InputProps } = params;

        let startAdornment = undefined;
        if (icon !== null) {
            startAdornment = (
                <InputAdornment position='start'>
                    {icon || (
                        <Add
                            sx={{
                                height: 20,
                                width: 20,
                                color: theme.palette.primary.main,
                            }}
                        />
                    )}
                </InputAdornment>
            );
        }

        return (
            <TextField
                {...params}
                InputProps={{
                    ...InputProps,
                    startAdornment,
                }}
                variant='outlined'
                sx={{
                    width: '215px',
                    '& .MuiOutlinedInput-root': {
                        '& .MuiInputBase-input': {
                            color: theme.palette.primary.main,
                            opacity: 1,
                            '&::placeholder': {
                                color: theme.palette.primary.main,
                                fontWeight: 'bold',
                                opacity: 1,
                            },
                        },
                        '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: theme.palette.primary.main,
                            opacity: 0.5,
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderWidth: '1px',
                        },
                    },
                }}
                placeholder={label}
                onFocus={() => setPlaceholder('')}
                onBlur={() => setPlaceholder(label)}
            />
        );
    };
    return (
        <StyledContainer>
            <StyledAutocomplete
                options={options}
                value={value}
                onChange={(_, value) => onChange(value || [])}
                renderInput={renderCustomInput}
                getOptionLabel={(value) => value.label}
                disabled={disabled}
                size='small'
                multiple
            />
        </StyledContainer>
    );
};
