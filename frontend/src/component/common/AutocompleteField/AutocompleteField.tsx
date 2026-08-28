import { Autocomplete, TextField, type AutocompleteProps } from '@mui/material';
import type { ReactNode } from 'react';
import { useUiFlag } from 'hooks/useUiFlag';
import { FormField } from '../FormField/FormField';

export interface AutocompleteFieldProps<
    Value,
    Multiple extends boolean | undefined,
    DisableClearable extends boolean | undefined,
    FreeSolo extends boolean | undefined,
> extends Omit<
        AutocompleteProps<Value, Multiple, DisableClearable, FreeSolo>,
        'renderInput'
    > {
    label: string;
    description?: ReactNode;
    helperText?: ReactNode;
    placeholder?: string;
    startAdornment?: ReactNode;
    required?: boolean;
    error?: boolean;
}

export function AutocompleteField<
    Value,
    Multiple extends boolean | undefined = false,
    DisableClearable extends boolean | undefined = false,
    FreeSolo extends boolean | undefined = false,
>({
    label,
    description,
    helperText,
    placeholder,
    startAdornment,
    required,
    error,
    size,
    ...props
}: AutocompleteFieldProps<Value, Multiple, DisableClearable, FreeSolo>) {
    const topLabelInputs = useUiFlag('topLabelInputs');

    return (
        <FormField label={label} description={description}>
            <Autocomplete
                fullWidth
                size={size}
                {...props}
                renderInput={(params) => {
                    const slotProps = startAdornment
                        ? {
                              ...params.slotProps,
                              input: {
                                  ...params.slotProps?.input,
                                  startAdornment: (
                                      <>
                                          {startAdornment}
                                          {
                                              params.slotProps?.input
                                                  ?.startAdornment
                                          }
                                      </>
                                  ),
                              },
                          }
                        : params.slotProps;

                    return (
                        <TextField
                            {...params}
                            size={size}
                            required={required}
                            error={error}
                            label={topLabelInputs ? undefined : label}
                            placeholder={placeholder}
                            helperText={helperText}
                            slotProps={slotProps}
                        />
                    );
                }}
            />
        </FormField>
    );
}
