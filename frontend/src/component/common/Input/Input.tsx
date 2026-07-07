import { INPUT_ERROR_TEXT } from 'utils/testIds';
import { TextField, type OutlinedTextFieldProps } from '@mui/material';
import type { ReactNode } from 'react';
import { useStyles } from './Input.styles';
import { FormField } from '../FormField/FormField';

interface IInputProps extends Omit<OutlinedTextFieldProps, 'variant'> {
    label: string;
    description?: ReactNode;
    error?: boolean;
    errorText?: string;
    style?: Object;
    className?: string;
    value: string;
    onChange: (e: any) => any;
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
    const { classes: styles } = useStyles();
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
                        classes: {
                            root: styles.helperText,
                        },
                    },
                    ...slotProps,
                }}
            />
        </FormField>
    );
};

export default Input;
