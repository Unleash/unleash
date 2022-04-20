import React from 'react';
import {
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    SelectProps,
} from '@material-ui/core';
import { SELECT_ITEM_ID } from 'utils/testIds';
import { KeyboardArrowDownOutlined } from '@material-ui/icons';
import { SelectInputProps } from '@material-ui/core/Select/SelectInput';

export interface ISelectOption {
    key: string;
    title?: string;
    label?: string;
    disabled?: boolean;
}

export interface IGeneralSelectProps extends Omit<SelectProps, 'onChange'> {
    name?: string;
    value?: string;
    label?: string;
    options: ISelectOption[];
    onChange: (key: string) => void;
    disabled?: boolean;
    fullWidth?: boolean;
    classes?: any;
    defaultValue?: string;
}

const GeneralSelect: React.FC<IGeneralSelectProps> = ({
    name,
    value = '',
    label = '',
    options,
    onChange,
    id,
    disabled = false,
    className,
    classes,
    fullWidth,
    ...rest
}) => {
    const renderSelectItems = () =>
        options.map(option => (
            <MenuItem
                key={option.key}
                value={option.key}
                title={option.title || ''}
                data-testid={`${SELECT_ITEM_ID}-${option.label}`}
                disabled={option.disabled}
            >
                {option.label}
            </MenuItem>
        ));

    const onSelectChange: SelectInputProps['onChange'] = event => {
        event.preventDefault();
        onChange(String(event.target.value));
    };

    return (
        <FormControl
            variant="outlined"
            size="small"
            classes={classes}
            fullWidth={fullWidth}
        >
            <InputLabel htmlFor={id}>{label}</InputLabel>
            <Select
                name={name}
                disabled={disabled}
                onChange={onSelectChange}
                className={className}
                label={label}
                id={id}
                value={value}
                IconComponent={KeyboardArrowDownOutlined}
                {...rest}
            >
                {renderSelectItems()}
            </Select>
        </FormControl>
    );
};

export default GeneralSelect;
