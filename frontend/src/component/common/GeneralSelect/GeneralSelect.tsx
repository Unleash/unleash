import {
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    type SelectProps,
    type SelectChangeEvent,
    styled,
    ListSubheader,
} from '@mui/material';
import { SELECT_ITEM_ID } from 'utils/testIds';
import KeyboardArrowDownOutlined from '@mui/icons-material/KeyboardArrowDownOutlined';
import type { SxProps } from '@mui/system';
import type { Theme } from '@mui/material/styles';
import { visuallyHidden } from '@mui/utils';
import type { ReactNode } from 'react';
import { formFieldLabelId } from 'component/common/FormField/FormField';

export interface ISelectOption {
    key: string;
    title?: string;
    label?: string;
    disabled?: boolean;
    sx?: SxProps<Theme>;
}

export type SelectOptionGroup = {
    groupHeader: string;
    options: ISelectOption[];
};

const isSelectOptionGroup = (
    options: ISelectOption[] | SelectOptionGroup[],
): options is SelectOptionGroup[] => {
    const firstElement = options[0];
    return firstElement && 'groupHeader' in firstElement;
};

export interface IGeneralSelectProps<T extends string = string>
    extends Omit<SelectProps, 'onChange'> {
    name?: string;
    value?: T;
    label?: string;
    options: ISelectOption[] | SelectOptionGroup[];
    onChange: (key: T) => void;
    disabled?: boolean;
    fullWidth?: boolean;
    classes?: any;
    defaultValue?: string;
    visuallyHideLabel?: boolean;
    variant?: 'outlined' | 'filled' | 'standard';
    /** Shown (muted) when no option is selected. */
    placeholder?: string;
    /**
     * Icon rendered inside the trigger, before the selected value. Lets the
     * control carry its own meaning (e.g. a sort glyph) instead of a label.
     */
    startIcon?: ReactNode;
}

const StyledFormControl = styled(FormControl)({
    maxWidth: '100%',
});

const StyledPlaceholder = styled('span')(({ theme }) => ({
    color: theme.palette.text.secondary,
}));

const StyledValueWithIcon = styled('span')(({ theme }) => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    '& > svg': {
        fontSize: theme.spacing(2.5),
        color: theme.palette.text.secondary,
    },
}));

const toMenuItem = (option: ISelectOption) => (
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
);

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
    placeholder,
    startIcon,
    ...rest
}: IGeneralSelectProps<T>) {
    // MUI names the combobox via `labelId` (a `<label htmlFor>` can't name the
    // `div[role=combobox]`). When wrapped in a FormField the label has no own
    // `label` text here, so point `labelId` at FormField's label element,
    // derived from the injected `id`. An explicit `labelId` still wins.
    const resolvedLabelId = labelId ?? (id ? formFieldLabelId(id) : undefined);
    const onSelectChange = (event: SelectChangeEvent) => {
        event.preventDefault();
        onChange(String(event.target.value) as T);
    };

    const flatOptions = isSelectOptionGroup(options)
        ? options.flatMap((group) => group.options)
        : options;
    const renderValue =
        placeholder || startIcon
            ? (selected: unknown) => {
                  const selectedLabel = flatOptions.find(
                      (option) => option.key === String(selected),
                  )?.label;
                  const content = selectedLabel ?? (
                      <StyledPlaceholder>{placeholder}</StyledPlaceholder>
                  );
                  return startIcon ? (
                      <StyledValueWithIcon>
                          {startIcon}
                          {content}
                      </StyledValueWithIcon>
                  ) : (
                      content
                  );
              }
            : undefined;

    return (
        <StyledFormControl
            variant={variant}
            // old MUI `small` (~40px) maps to `large` (32px) on the v2 control scale
            size='large'
            classes={classes}
            fullWidth={fullWidth}
        >
            {label ? (
                <InputLabel
                    sx={visuallyHideLabel ? visuallyHidden : null}
                    htmlFor={id}
                    id={resolvedLabelId}
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
                displayEmpty={Boolean(placeholder)}
                renderValue={renderValue}
                IconComponent={KeyboardArrowDownOutlined}
                labelId={resolvedLabelId}
                {...rest}
            >
                {isSelectOptionGroup(options)
                    ? options.flatMap((group) => {
                          return [
                              <ListSubheader key={group.groupHeader}>
                                  {group.groupHeader}
                              </ListSubheader>,
                          ].concat(group.options.map(toMenuItem));
                      })
                    : options.map(toMenuItem)}
            </Select>
        </StyledFormControl>
    );
}

export default GeneralSelect;
