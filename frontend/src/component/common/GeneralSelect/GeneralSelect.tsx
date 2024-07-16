import type React from 'react';
import {
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    type SelectProps,
    type SelectChangeEvent,
    styled,
} from '@mui/material';
import { SELECT_ITEM_ID } from 'utils/testIds';
import KeyboardArrowDownOutlined from '@mui/icons-material/KeyboardArrowDownOutlined';
import type { SxProps } from '@mui/system';
import type { Theme } from '@mui/material/styles';
import { visuallyHidden } from '@mui/utils';

export interface ISelectOption {
    key: string;
    title?: string;
    label?: string;
    disabled?: boolean;
    sx?: SxProps<Theme>;
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
    visuallyHideLabel?: boolean;
}

const StyledFormControl = styled(FormControl)({
    maxWidth: '100%',
});

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
    visuallyHideLabel,
    ...rest
}) => {
    const onSelectChange = (event: SelectChangeEvent) => {
        event.preventDefault();
        onChange(String(event.target.value));
    };

    return (
        <StyledFormControl
            variant='outlined'
            size='small'
            classes={classes}
            fullWidth={fullWidth}
        >
            <InputLabel
                sx={visuallyHideLabel ? visuallyHidden : null}
                htmlFor={id}
            >
                {label}
            </InputLabel>
            <Select
                name={name}
                disabled={disabled}
                onChange={onSelectChange}
                className={className}
                label={visuallyHideLabel ? '' : label}
                id={id}
                value={value}
                MenuProps={{
                    sx: {
                        '.MuiPopover-paper.MuiMenu-paper': {
                            width: 'min-content',
                        },
                    },
                }}
                IconComponent={KeyboardArrowDownOutlined}
                {...rest}
            >
                {options.map((option) => (
                    <MenuItem
                        sx={option.sx}
                        key={option.key}
                        value={option.key}
                        title={option.title || ''}
                        data-testid={`${SELECT_ITEM_ID}-${option.label}`}
                        disabled={option.disabled}
                    >
                        {option.label}
                    </MenuItem>
                ))}
            </Select>
        </StyledFormControl>
    );
};

export default GeneralSelect;
