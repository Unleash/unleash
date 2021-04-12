import React from 'react';
import { Select, FormControl, MenuItem, InputLabel } from '@material-ui/core';
import PropTypes from 'prop-types';

const SelectMenu = ({
    name,
    value,
    label,
    options,
    onChange,
    id,
    disabled = false,
    className,
    classes,
    ...rest
}) => {
    const renderSelectItems = () =>
        options.map(option => (
            <MenuItem key={option.key} value={option.key} title={option.title}>
                {option.label}
            </MenuItem>
        ));

    return (
        <FormControl variant="outlined" size="small" classes={classes}>
            <InputLabel htmlFor={id} id={id}>
                {label}
            </InputLabel>
            <Select
                name={name}
                disabled={disabled}
                onChange={onChange}
                className={className}
                label={label}
                id={id}
                size="small"
                value={value}
                {...rest}
            >
                {renderSelectItems()}
            </Select>
        </FormControl>
    );
};

SelectMenu.propTypes = {
    name: PropTypes.string,
    id: PropTypes.string,
    value: PropTypes.string,
    label: PropTypes.string,
    options: PropTypes.array,
    style: PropTypes.object,
    onChange: PropTypes.func.isRequired,
    disabled: PropTypes.bool,
};

export default SelectMenu;
