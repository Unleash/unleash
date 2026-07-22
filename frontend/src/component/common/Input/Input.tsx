import { INPUT_ERROR_TEXT } from 'utils/testIds';
import { TextField, type OutlinedTextFieldProps } from '@mui/material';
import type { ReactNode } from 'react';
import { FormField } from '../FormField/FormField';

interface IInputProps extends Omit<OutlinedTextFieldProps, 'variant'> {
    label: ReactNode;
    description?: ReactNode;
    error?: boolean;
    errorText?: string;
    style?: Object;
    className?: string;
    value: string | number;
    onChange?: (e: any) => any;
    onFocus?: (e: any) => any;
    onBlur?: (e: any) => any;
    multiline?: boolean;
    rows?: number;
}

const Input = ({
    label,
    description,
    placeholder,
    error,
    errorText,
    style,
    className,
    value,
    onChange,
    size = 'small',
    slotProps,
    ...rest
}: IInputProps) => {
    return (
        <FormField label={label} description={description}>
            <TextField
                data-loading
                size={size}
                variant='outlined'
                placeholder={placeholder}
                error={error}
                helperText={errorText}
                style={style}
                className={className ? className : ''}
                value={value}
                onChange={onChange}
                {...rest}
                slotProps={{
                    formHelperText: {
                        'data-testid': INPUT_ERROR_TEXT,
                        title: errorText,
                    },
                    ...slotProps,
                }}
            />
        </FormField>
    );
};

export default Input;
