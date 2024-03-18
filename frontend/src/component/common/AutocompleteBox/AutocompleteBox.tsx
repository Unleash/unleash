import { useStyles } from 'component/common/AutocompleteBox/AutocompleteBox.styles';
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

interface IAutocompleteBoxProps {
    label: string;
    options: IAutocompleteBoxOption[];
    value?: IAutocompleteBoxOption[];
    onChange: (value: IAutocompleteBoxOption[]) => void;
    disabled?: boolean;
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

const StyledIcon = styled('div', {
    shouldForwardProp: (prop: string) => !prop.startsWith('$'),
})<{ $disabled: boolean }>(({ theme, $disabled }) => ({
    background: $disabled
        ? theme.palette.primary.light
        : theme.palette.primary.main,
    height: '48px',
    width: '48px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: 6,
    borderTopLeftRadius: '40px',
    borderBottomLeftRadius: '40px',
    color: theme.palette.primary.contrastText,
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
}: IAutocompleteBoxProps) => {
    const [placeHolder, setPlaceholder] = useState('Add Segments');
    const { classes: styles } = useStyles();
    const theme = useTheme();

    const renderInput = (params: AutocompleteRenderInputParams) => {
        return <TextField {...params} variant='outlined' label={label} />;
    };

    const renderCustomInput = (params: AutocompleteRenderInputParams) => {
        const { InputProps } = params;
        return (
            <TextField
                {...params}
                InputProps={{
                    ...InputProps,
                    startAdornment: (
                        <InputAdornment position='start'>
                            <Add
                                sx={{
                                    height: 20,
                                    width: 20,
                                    color: theme.palette.primary.main,
                                }}
                            />
                        </InputAdornment>
                    ),
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
                onChange={(event, value) => onChange(value || [])}
                renderInput={renderCustomInput}
                getOptionLabel={(value) => value.label}
                disabled={disabled}
                size='small'
                multiple
            />
        </StyledContainer>
    );
};
