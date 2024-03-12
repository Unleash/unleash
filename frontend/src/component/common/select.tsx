import type React from 'react';
import {
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    type SelectChangeEvent,
} from '@mui/material';
import { SELECT_ITEM_ID } from 'utils/testIds';

export interface ISelectOption {
    key: string;
    title?: string;
    label?: string;
}
export interface ISelectMenuProps {
    name: string;
    id: string;
    value?: string;
    label?: string;
    options: ISelectOption[];
    style?: object;
    onChange?: (event: SelectChangeEvent, child: React.ReactNode) => void;
    disabled?: boolean;
    className?: string;
    classes?: any;
    formControlStyles?: React.CSSProperties;
}

const SelectMenu: React.FC<ISelectMenuProps> = ({
    name,
    value = '',
    label = '',
    options,
    onChange,
    id,
    disabled = false,
    className,
    classes,
    formControlStyles = {},
    ...rest
}) => {
    const renderSelectItems = () =>
        options.map((option) => (
            <MenuItem
                key={option.key}
                value={option.key}
                title={option.title || ''}
                data-testid={`${SELECT_ITEM_ID}-${option.label}`}
            >
                {option.label}
            </MenuItem>
        ));

    return (
        <FormControl
            variant='outlined'
            size='small'
            classes={classes}
            style={formControlStyles}
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
                {...rest}
            >
                {renderSelectItems()}
            </Select>
        </FormControl>
    );
};

export default SelectMenu;
