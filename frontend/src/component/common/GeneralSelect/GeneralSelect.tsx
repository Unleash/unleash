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

export interface ISelectOption {
    key: string;
    title?: string;
    label?: string;
    disabled?: boolean;
}

export interface ISelectMenuProps extends SelectProps {
    name?: string;
    value?: string;
    label?: string;
    options: ISelectOption[];
    onChange?: OnGeneralSelectChange;
    disabled?: boolean;
    fullWidth?: boolean;
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
                name={name}
                disabled={disabled}
                onChange={onChange}
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
