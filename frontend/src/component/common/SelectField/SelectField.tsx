import {
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    type SelectChangeEvent,
    type SelectProps,
} from '@mui/material';
import { type ReactNode, useId } from 'react';
import { FormField, formFieldLabelId } from '../FormField/FormField';

interface SelectFieldOption {
    key: string;
    label: string;
    disabled?: boolean;
}

interface SelectControlProps
    extends Omit<
        SelectProps,
        'onChange' | 'value' | 'label' | 'labelId' | 'id'
    > {
    options: SelectFieldOption[];
    value: string;
    onChange: (value: string) => void;
    label?: ReactNode;
    id?: string;
}

const SelectControl = ({
    options,
    value,
    onChange,
    label,
    id: injectedId,
    size = 'small',
    fullWidth = true,
    ...props
}: SelectControlProps) => {
    const generatedId = useId();
    const id = injectedId ?? generatedId;
    const labelId = formFieldLabelId(id);

    return (
        <FormControl variant='outlined' size={size} fullWidth={fullWidth}>
            {label ? (
                <InputLabel id={labelId} htmlFor={id}>
                    {label}
                </InputLabel>
            ) : null}
            <Select
                {...props}
                id={id}
                labelId={labelId}
                label={label ?? undefined}
                value={value}
                onChange={(event: SelectChangeEvent<unknown>) =>
                    onChange(String(event.target.value))
                }
            >
                {options.map((option) => (
                    <MenuItem
                        key={option.key}
                        value={option.key}
                        disabled={option.disabled}
                    >
                        {option.label}
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
    );
};

interface SelectFieldProps
    extends Omit<
        SelectProps,
        'onChange' | 'value' | 'label' | 'labelId' | 'id'
    > {
    label: string;
    description?: ReactNode;
    options: SelectFieldOption[];
    value: string;
    onChange: (value: string) => void;
}

export const SelectField = ({
    label,
    description,
    options,
    value,
    onChange,
    ...props
}: SelectFieldProps) => (
    <FormField label={label} description={description}>
        <SelectControl
            options={options}
            value={value}
            onChange={onChange}
            {...props}
        />
    </FormField>
);
