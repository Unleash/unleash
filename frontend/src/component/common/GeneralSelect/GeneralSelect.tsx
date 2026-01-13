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

export interface IGeneralSelectProps<T extends string = string>
    extends Omit<SelectProps, 'onChange'> {
    name?: string;
    value?: T;
    label?: string;
    options: ISelectOption[];
    onChange: (key: T) => void;
    disabled?: boolean;
    fullWidth?: boolean;
    classes?: any;
    defaultValue?: string;
    visuallyHideLabel?: boolean;
    variant?: 'outlined' | 'filled' | 'standard';
}

const StyledFormControl = styled(FormControl)({
    maxWidth: '100%',
});

function GeneralSelect<T extends string = string>({
    variant = 'outlined',
    name,
    value,
    label = '',
    options,
    onChange,
    id,
    disabled = false,
    className,
    classes,
    fullWidth,
    visuallyHideLabel,
    labelId,
    ...rest
}: IGeneralSelectProps<T>) {
    const onSelectChange = (event: SelectChangeEvent) => {
        event.preventDefault();
        onChange(String(event.target.value) as T);
    };

    return (
        <StyledFormControl
            variant={variant}
            size='small'
            classes={classes}
            fullWidth={fullWidth}
        >
            {label ? (
                <InputLabel
                    sx={visuallyHideLabel ? visuallyHidden : null}
                    htmlFor={id}
                    id={labelId}
                >
                    {label}
                </InputLabel>
            ) : null}
            <Select
                name={name}
                disabled={disabled}
                onChange={onSelectChange}
                className={className}
                label={visuallyHideLabel ? '' : label}
                id={id}
                value={value ?? ''}
                autoWidth
                IconComponent={KeyboardArrowDownOutlined}
                labelId={labelId}
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
}

export default GeneralSelect;
