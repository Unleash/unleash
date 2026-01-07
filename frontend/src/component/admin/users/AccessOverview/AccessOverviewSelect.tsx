import { Autocomplete, type AutocompleteProps, TextField } from '@mui/material';

interface IAccessOverviewSelectProps<T>
    extends Partial<AutocompleteProps<T, false, false, false>> {
    label: string;
    options: T[];
    value: T;
    setValue: (role: T | null) => void;
}

export const AccessOverviewSelect = <T,>({
    label,
    options,
    value,
    setValue,
    ...rest
}: IAccessOverviewSelectProps<T>) => (
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
