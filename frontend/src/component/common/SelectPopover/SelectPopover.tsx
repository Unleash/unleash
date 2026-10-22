import {
    type CSSProperties,
    type ElementType,
    type KeyboardEvent,
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
    '&:hover': {
        backgroundColor: theme.palette.action.hover,
    },
}));

const StyledPanel = styled('div')(({ theme }) => ({
    [`&:focus-within .${autocompleteClasses.focused}`]: {
        backgroundColor: theme.palette.action.hover,
    },
    [`&:focus-within .${autocompleteClasses.focusVisible}`]: {
        outline: `2px solid ${theme.palette.primary.main}`,
        outlineOffset: '-2px',
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

const NO_VALUE: never[] = [];

const isToggleIntent = (event: KeyboardEvent<HTMLInputElement>) =>
    event.key === ' ' && // only space can toggle
    !event.nativeEvent.isComposing && // IMEs (e.g. Japanese input) use space to convert text and cycle candidates; don't touch that
    event.keyCode !== 229; // IME keycode: https://developer.mozilla.org/en-US/docs/Web/API/Element/keydown_event#keydown_events_with_ime

type OptionsSource<T> =
    | { options: SelectOption<T>[]; optionGroups?: never }
    | { optionGroups: SelectOptionGroup<T>[]; options?: never };

type SelectionProps<T> =
    | { multiple: true; selected?: T[]; onChange: (selected: T[]) => void }
    | { multiple?: false; selected?: T; onChange: (selected: T) => void };

type BaseProps = {
    onClose: () => void;
    searchPlaceholderText: string;
    listMaxHeight?: CSSProperties['maxHeight'];
    renderBelowOptions?: (searchText: string) => ReactNode;
    horizontalAlign?: 'left' | 'right';
};

type SelectPopoverProps<T> = Pick<PopoverProps, 'open' | 'anchorEl'> &
    BaseProps &
    OptionsSource<T> &
    SelectionProps<T>;

type PanelProps<T> = Omit<BaseProps, 'horizontalAlign'> &
    OptionsSource<T> &
    SelectionProps<T> & { closeHintId: string };

const toSelectedArray = <T,>({
    multiple,
    selected,
}: SelectionProps<T>): T[] => {
    if (multiple) return selected ?? [];
    if (selected === undefined) return [];
    return [selected];
};

const SelectPanel = <T extends string | number>(props: PanelProps<T>) => {
    const {
        onClose,
        options,
        optionGroups,
        searchPlaceholderText,
        listMaxHeight,
        renderBelowOptions,
        closeHintId,
    } = props;
    const [searchText, setSearchText] = useState('');
    const [keyboardHighlightedOption, setKeyboardHighlightedOption] =
        useState<FlatOption<T> | null>(null);
    const selectedValues = new Set(toSelectedArray(props));

    const toggleOption = (option: FlatOption<T>) => {
        if (props.multiple) {
            const selected = props.selected ?? [];
            props.onChange(
                selectedValues.has(option.value)
                    ? selected.filter((value) => value !== option.value)
                    : [...selected, option.value],
            );
            return;
        }
        props.onChange(option.value);
        onClose();
    };

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
        value: NO_VALUE,
        inputValue: searchText,
        onInputChange: (_, value, reason) => {
            if (reason !== 'reset') {
                setSearchText(value);
                setKeyboardHighlightedOption(null);
            }
        },
        onChange: (_, __, reason, details) => {
            if (reason === 'selectOption' && details?.option) {
                toggleOption(details.option);
            }
        },
        onHighlightChange: (_, option, reason) =>
            setKeyboardHighlightedOption(reason === 'keyboard' ? option : null),
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

    const handleInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
        // Intercept `space`: toggle the option if keyboard-highlighted and
        // appropriate. Otherwise, fall through to standard handling.
        if (keyboardHighlightedOption && isToggleIntent(event)) {
            event.preventDefault();
            toggleOption(keyboardHighlightedOption);
        }
    };

    const renderRow = (option: FlatOption<T>, index: number) => {
        const {
            key,
            onMouseMove: _hoverHighlight,
            ...optionProps
        } = getOptionProps({ option, index });
        return (
            <StyledRow
                key={key}
                {...optionProps}
                aria-selected={selectedValues.has(option.value)}
            >
                {props.multiple ? (
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
            <StyledPanel {...getRootProps()}>
                <StyledSearch>
                    <TextField
                        size='large'
                        fullWidth
                        autoFocus
                        placeholder={searchPlaceholderText}
                        inputRef={inputRef}
                        focused={keyboardHighlightedOption ? false : undefined}
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
                                onKeyDown: handleInputKeyDown,
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
                    aria-multiselectable={props.multiple}
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
            </StyledPanel>
            {renderBelowOptions?.(searchText.trim())}
            {props.multiple ? (
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

export const SelectPopover = <T extends string | number>(
    props: SelectPopoverProps<T>,
) => {
    const { open, anchorEl, horizontalAlign = 'left', onClose } = props;
    const closeHintId = useId();

    return (
        <Popover
            open={open}
            anchorEl={anchorEl}
            onClose={onClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: horizontalAlign }}
            transformOrigin={{ vertical: 'top', horizontal: horizontalAlign }}
            slotProps={{
                paper: {
                    role: 'dialog',
                    'aria-describedby': props.multiple
                        ? closeHintId
                        : undefined,
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
            <SelectPanel {...props} closeHintId={closeHintId} />
        </Popover>
    );
};
