import {
    type CSSProperties,
    type ElementType,
    type ReactNode,
    useId,
    useMemo,
    useState,
} from 'react';
import {
    autocompleteClasses,
    Button,
    Checkbox,
    InputAdornment,
    ListSubheader,
    Popover,
    type PopoverProps,
    styled,
    TextField,
    useAutocomplete,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

const StyledSearch = styled('div')(({ theme }) => ({
    padding: theme.spacing(1.5, 1.5, 1),
    borderBottom: `1px solid ${theme.palette.divider}`,
}));

const StyledList = styled('ul')(({ theme }) => ({
    listStyle: 'none',
    margin: 0,
    overflowY: 'auto',
    padding: theme.spacing(1, 0),
    '&:empty': {
        padding: 0,
    },
}));

const StyledRow = styled('li')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1.5),
    padding: theme.spacing(1, 2),
    cursor: 'pointer',
    fontSize: theme.typography.body2.fontSize,
    [`&.${autocompleteClasses.focused}, &:hover`]: {
        backgroundColor: theme.palette.action.hover,
    },
}));

const StyledCheckbox = styled(Checkbox)({
    padding: 0,
});

const StyledLabel = styled('span')({
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
});

const StyledDetail = styled('span')(({ theme }) => ({
    marginLeft: 'auto',
    whiteSpace: 'nowrap',
    color: theme.palette.text.secondary,
}));

const StyledFooter = styled('div')(({ theme }) => ({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing(1, 1, 1, 2),
    borderTop: `1px solid ${theme.palette.divider}`,
    color: theme.palette.text.secondary,
    fontSize: theme.typography.body2.fontSize,
}));

const StyledGroup = styled('li')(({ theme }) => ({
    '&:not(:last-child)': {
        borderBottom: `1px solid ${theme.palette.divider}`,
    },
}));

const StyledListSubheader = styled(ListSubheader)<{
    component?: ElementType;
}>(({ theme }) => ({
    lineHeight: 'normal',
    fontSize: theme.fontSizes.smallerBody,
    fontWeight: theme.typography.fontWeightBold,
    textTransform: 'uppercase',
    color: theme.palette.text.disabled,
    padding: theme.spacing(1, 1.5, 0.5),
}));

export type SelectOption<T> = {
    value: T;
    label: string;
    detail?: ReactNode;
};

export type SelectOptionGroup<T> = {
    groupHeader: string;
    options: SelectOption<T>[];
};

type FlatOption<T> = SelectOption<T> & { group?: string };

type OptionsSource<T> =
    | { options: SelectOption<T>[]; optionGroups?: never }
    | { optionGroups: SelectOptionGroup<T>[]; options?: never };

type BaseProps<T> = {
    onClose: () => void;
    selected: T[];
    onChange: (selected: T[]) => void;
    searchPlaceholderText: string;
    listMaxHeight?: CSSProperties['maxHeight'];
    renderBelowOptions?: (searchText: string) => ReactNode;
    horizontalAlign?: 'left' | 'right';
    multiple?: boolean;
};

type SelectPopoverProps<T> = Pick<PopoverProps, 'open' | 'anchorEl'> &
    BaseProps<T> &
    OptionsSource<T>;

type PanelProps<T> = Omit<BaseProps<T>, 'horizontalAlign'> &
    OptionsSource<T> & { closeHintId: string };

const SelectPanel = <T extends string | number>({
    onClose,
    options,
    optionGroups,
    selected,
    onChange,
    searchPlaceholderText,
    listMaxHeight,
    renderBelowOptions,
    closeHintId,
    multiple = false,
}: PanelProps<T>) => {
    const [searchText, setSearchText] = useState('');
    const selectedValues = new Set(selected);

    const flatOptions: FlatOption<T>[] = useMemo(() => {
        if (optionGroups) {
            return optionGroups.flatMap((group) =>
                group.options.map((option) => ({
                    ...option,
                    group: group.groupHeader,
                })),
            );
        }
        return options ?? [];
    }, [options, optionGroups]);

    const {
        getRootProps,
        getInputProps,
        getListboxProps,
        getOptionProps,
        groupedOptions,
    } = useAutocomplete<FlatOption<T>, true, true, false>({
        multiple: true,
        open: true,
        options: flatOptions,
        value: flatOptions.filter((option) => selectedValues.has(option.value)),
        inputValue: searchText,
        onInputChange: (_, value, reason) => {
            if (reason !== 'reset') setSearchText(value);
        },
        onChange: (_, newValue, reason, details) => {
            if (multiple) {
                onChange(newValue.map((option) => option.value));
                return;
            }
            if (reason === 'selectOption' && details?.option) {
                onChange([details.option.value]);
                onClose();
            }
        },
        onClose: (_, reason) => {
            if (reason === 'escape') onClose();
        },
        getOptionLabel: (option) => option.label,
        getOptionKey: (option) => String(option.value),
        isOptionEqualToValue: (option, value) => option.value === value.value,
        groupBy: (option) => option.group ?? '',
        autoHighlight: true,
        disableCloseOnSelect: true,
        clearOnBlur: false,
    });

    const { ref: inputRef, ...inputProps } = getInputProps();

    const renderRow = (option: FlatOption<T>, index: number) => {
        const { key, ...optionProps } = getOptionProps({ option, index });
        return (
            <StyledRow key={key} {...optionProps}>
                {multiple ? (
                    <StyledCheckbox
                        checked={selectedValues.has(option.value)}
                        tabIndex={-1}
                        size='small'
                        aria-hidden
                    />
                ) : null}
                <StyledLabel>{option.label}</StyledLabel>
                {option.detail ? (
                    <StyledDetail>{option.detail}</StyledDetail>
                ) : null}
            </StyledRow>
        );
    };

    return (
        <>
            <div {...getRootProps()}>
                <StyledSearch>
                    <TextField
                        size='large'
                        fullWidth
                        autoFocus
                        placeholder={searchPlaceholderText}
                        inputRef={inputRef}
                        slotProps={{
                            input: {
                                startAdornment: (
                                    <InputAdornment
                                        position='start'
                                        sx={{ marginRight: 0 }}
                                    >
                                        <SearchIcon fontSize='small' />
                                    </InputAdornment>
                                ),
                            },
                            htmlInput: {
                                ...inputProps,
                                'aria-label': searchPlaceholderText,
                                sx: {
                                    '&::placeholder': {
                                        color: 'text.secondary',
                                        opacity: 1,
                                    },
                                },
                            },
                        }}
                    />
                </StyledSearch>
                <StyledList
                    {...getListboxProps()}
                    aria-multiselectable={multiple}
                    sx={{ maxHeight: listMaxHeight }}
                >
                    {groupedOptions.map((group) => (
                        <StyledGroup key={group.key}>
                            {group.group ? (
                                <StyledListSubheader component='div'>
                                    {group.group}
                                </StyledListSubheader>
                            ) : null}
                            <StyledList sx={{ padding: 0 }}>
                                {group.options.map((option, idx) =>
                                    renderRow(option, group.index + idx),
                                )}
                            </StyledList>
                        </StyledGroup>
                    ))}
                </StyledList>
            </div>
            {renderBelowOptions?.(searchText.trim())}
            {multiple ? (
                <StyledFooter>
                    <span id={closeHintId}>Esc to close</span>
                    <Button size='small' onClick={onClose}>
                        Done
                    </Button>
                </StyledFooter>
            ) : null}
        </>
    );
};

export const SelectPopover = <T extends string | number>({
    open,
    anchorEl,
    horizontalAlign = 'left',
    multiple = false,
    ...panelProps
}: SelectPopoverProps<T>) => {
    const closeHintId = useId();

    return (
        <Popover
            open={open}
            anchorEl={anchorEl}
            onClose={panelProps.onClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: horizontalAlign }}
            transformOrigin={{ vertical: 'top', horizontal: horizontalAlign }}
            slotProps={{
                paper: {
                    role: 'dialog',
                    'aria-describedby': multiple ? closeHintId : undefined,
                    sx: {
                        display: 'flex',
                        flexDirection: 'column',
                        width: (theme) => theme.spacing(50),
                        marginTop: (theme) => theme.spacing(1),
                        borderRadius: (theme) =>
                            `${theme.shape.borderRadiusMedium}px`,
                    },
                },
            }}
        >
            <SelectPanel
                {...panelProps}
                multiple={multiple}
                closeHintId={closeHintId}
            />
        </Popover>
    );
};
