import type React from 'react';
import {
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    type SelectChangeEvent,
} from '@mui/material';
import { SELECT_ITEM_ID } from 'utils/testIds';
import { formFieldLabelId } from 'component/common/FormField/FormField';

export interface ISelectOption {
    key: string;
    title?: string;
    label?: string;
}
export interface ISelectMenuProps {
    name: string;
    // Optional: when wrapped in a FormField the id is injected at runtime; the
    // label/`labelId` wiring below tolerates an absent id.
    id?: string;
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
    // MUI names the combobox via `labelId`, not a `<label htmlFor>` on the
    // combobox div. Point it at the label element (the own InputLabel below, or
    // a wrapping FormField's label, both derived from `id`). Guard against a
    // falsy `id` so we don't emit a dangling `aria-labelledby`.
    const labelId = id ? formFieldLabelId(id) : undefined;
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
            size='large'
            classes={classes}
            style={formControlStyles}
        >
            {label ? (
                <InputLabel id={labelId} htmlFor={id}>
                    {label}
                </InputLabel>
            ) : null}
            <Select
                name={name}
                disabled={disabled}
                onChange={onChange}
                className={className}
                label={label || undefined}
                id={id}
                labelId={labelId}
                value={value}
                {...rest}
            >
                {renderSelectItems()}
            </Select>
        </FormControl>
    );
};

export default SelectMenu;
