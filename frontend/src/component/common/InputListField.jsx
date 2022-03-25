import React from 'react';
import PropTypes from 'prop-types';
import { TextField } from '@material-ui/core';

function InputListField({
    label,
    values = [],
    error,
    errorText,
    name,
    updateValues,
    placeholder = '',
    onBlur = () => {},
    FormHelperTextProps,
}) {
    const handleChange = evt => {
        const values = evt.target.value.split(/,\s?/);
        const trimmedValues = values.map(v => v.trim());
        updateValues(trimmedValues);
    };

    const handleKeyDown = evt => {
        if (evt.key === 'Backspace') {
            const currentValue = evt.target.value;
            if (currentValue.endsWith(', ')) {
                evt.preventDefault();
                const value = currentValue.slice(0, -2);
                updateValues(value.split(/,\s*/));
            }
        }
    };

    return (
        <TextField
            name={name}
            error={error}
            helperText={errorText}
            placeholder={placeholder}
            value={values ? values.join(', ') : ''}
            onKeyDown={handleKeyDown}
            onChange={handleChange}
            onBlur={onBlur}
            label={label}
            style={{ width: '100%' }}
            variant="outlined"
            size="small"
            FormHelperTextProps={FormHelperTextProps}
        />
    );
}

InputListField.propTypes = {
    label: PropTypes.string.isRequired,
    values: PropTypes.array,
    error: PropTypes.string,
    placeholder: PropTypes.string,
    name: PropTypes.string.isRequired,
    updateValues: PropTypes.func.isRequired,
    onBlur: PropTypes.func,
};

export default InputListField;
