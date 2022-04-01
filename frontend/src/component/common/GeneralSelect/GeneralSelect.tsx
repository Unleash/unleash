import React from 'react';
import { FormControl, InputLabel, MenuItem, Select } from '@material-ui/core';
import { SELECT_ITEM_ID } from 'utils/testIds';
import { KeyboardArrowDownOutlined } from '@material-ui/icons';

export interface ISelectOption {
    key: string;
    title?: string;
    label?: string;
    disabled?: boolean;
}

export interface ISelectMenuProps {
    name: string;
    id: string;
    value?: string;
    label?: string;
    autoFocus?: boolean;
    options: ISelectOption[];
    style?: object;
    onChange?: OnGeneralSelectChange;
    disabled?: boolean;
    fullWidth?: boolean;
    className?: string;
    classes?: any;
    defaultValue?: string;
}

export type OnGeneralSelectChange = (
    event: React.ChangeEvent<{ name?: string; value: unknown }>,
    child: React.ReactNode
) => void;

const GeneralSelect: React.FC<ISelectMenuProps> = ({
    name,
    value = '',
    label = '',
    options,
    onChange,
    defaultValue,
    id,
    disabled = false,
    autoFocus,
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
                data-test={`${SELECT_ITEM_ID}-${option.label}`}
                disabled={option.disabled}
            >
                {option.label}
            </MenuItem>
        ));

    return (
        <FormControl
            variant="outlined"
            size="small"
            classes={classes}
            fullWidth={fullWidth}
        >
            <InputLabel htmlFor={id}>{label}</InputLabel>
            <Select
                defaultValue={defaultValue}
                name={name}
                disabled={disabled}
                onChange={onChange}
                className={className}
                label={label}
                autoFocus={autoFocus}
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
