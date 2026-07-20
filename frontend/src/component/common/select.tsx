import type React from 'react';
import { useId } from 'react';
import {
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    type SelectChangeEvent,
} from '@mui/material';
import { SELECT_ITEM_ID } from 'utils/testIds';
import { FormField, formFieldLabelId } from './FormField/FormField';

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

const SelectMenuControl: React.FC<ISelectMenuProps> = ({
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
    const generatedId = useId();
    const controlId = id ?? generatedId;
    const labelId = formFieldLabelId(controlId);

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
            {label ? (
                <InputLabel id={labelId} htmlFor={controlId}>
                    {label}
                </InputLabel>
            ) : null}
            <Select
                name={name}
                disabled={disabled}
                onChange={onChange}
                className={className}
                label={label || undefined}
                id={controlId}
                labelId={labelId}
                value={value}
                {...rest}
            >
                {renderSelectItems()}
            </Select>
        </FormControl>
    );
};

const SelectMenu: React.FC<ISelectMenuProps> = ({ label = '', ...props }) => {
    if (!label) {
        return <SelectMenuControl label={label} {...props} />;
    }

    return (
        <FormField label={label}>
            <SelectMenuControl {...props} />
        </FormField>
    );
};

export default SelectMenu;
