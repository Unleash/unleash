import { Autocomplete, AutocompleteProps, TextField } from '@mui/material';

interface IAccessMatrixSelectProps<T>
    extends Partial<AutocompleteProps<T, false, false, false>> {
    label: string;
    options: T[];
    value: T;
    setValue: (role: T | null) => void;
}

export const AccessMatrixSelect = <T,>({
    label,
    options,
    value,
    setValue,
    ...rest
}: IAccessMatrixSelectProps<T>) => (
    <Autocomplete
        options={options}
        value={value}
        onChange={(_, value) => setValue(value)}
        renderInput={(params) => (
            <TextField {...params} label={label} fullWidth />
        )}
        size='small'
        fullWidth
        {...rest}
    />
);
