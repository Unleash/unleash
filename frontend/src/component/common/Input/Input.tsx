import { INPUT_ERROR_TEXT } from 'utils/testIds';
import { useStyles } from './Input.styles';
import React from 'react';
import { TextField, OutlinedTextFieldProps } from '@mui/material';

interface IInputProps extends Omit<OutlinedTextFieldProps, 'variant'> {
    label: string;
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
    placeholder,
    error,
    errorText,
    style,
    className,
    value,
    onChange,
    InputProps,
    ...rest
}: IInputProps) => {
    const { classes: styles } = useStyles();
    return (
        <div className={styles.inputContainer} data-loading>
            <TextField
                size="small"
                variant="outlined"
                label={label}
                placeholder={placeholder}
                error={error}
                helperText={errorText}
                style={style}
                className={className ? className : ''}
                value={value}
                onChange={onChange}
                FormHelperTextProps={{
                    ['data-testid']: INPUT_ERROR_TEXT,
                    classes: {
                        root: styles.helperText,
                    },
                }}
                {...rest}
            />
        </div>
    );
};

export default Input;
