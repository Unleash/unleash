import { VFC } from 'react';
import { TextField, TextFieldProps } from '@mui/material';

interface IInputListFieldProps {
    label: string;
    values?: any[];
    error?: boolean;
    placeholder?: string;
    name: string;
    updateValues: (values: string[]) => void;
    onBlur?: TextFieldProps['onBlur'];
    helperText?: TextFieldProps['helperText'];
    FormHelperTextProps?: TextFieldProps['FormHelperTextProps'];
}

export const InputListField: VFC<IInputListFieldProps> = ({
    values = [],
    updateValues,
    placeholder = '',
    error,
    ...rest
}) => {
    const handleChange: TextFieldProps['onChange'] = event => {
        const values = event.target.value.split(/,\s?/);
        const trimmedValues = values.map(v => v.trim());
        updateValues(trimmedValues);
    };

    const handleKeyDown: TextFieldProps['onKeyDown'] = event => {
        if (event.key === 'Backspace') {
            const currentValue = (event.target as HTMLInputElement).value;
            if (currentValue.endsWith(', ')) {
                event.preventDefault();
                const value = currentValue.slice(0, -2);
                updateValues(value.split(/,\s*/));
            }
        }
    };

    return (
        <TextField
            {...rest}
            error={error}
            placeholder={placeholder}
            value={values ? values.join(', ') : ''}
            onKeyDown={handleKeyDown}
            onChange={handleChange}
            style={{ width: '100%' }}
            variant="outlined"
            size="small"
        />
    );
};
