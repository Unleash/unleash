import { type CSSProperties, type ReactNode, useId, useState } from 'react';
import {
    autocompleteClasses,
    Button,
    Checkbox,
    InputAdornment,
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

export type MultiSelectOption<T> = {
    value: T;
    label: string;
    detail?: ReactNode;
};

type MultiSelectPopoverProps<T> = Pick<PopoverProps, 'open' | 'anchorEl'> & {
    onClose: () => void;
    options: MultiSelectOption<T>[];
    selected: T[];
    onChange: (selected: T[]) => void;
    searchPlaceholderText: string;
    listMaxHeight?: CSSProperties['maxHeight'];
    renderBelowOptions?: (searchText: string) => ReactNode;
    horizontalAlign?: 'left' | 'right';
};

type PanelProps<T> = Omit<
    MultiSelectPopoverProps<T>,
    'open' | 'anchorEl' | 'horizontalAlign'
> & {
    closeHintId: string;
};

const MultiSelectPanel = <T extends string | number>({
    onClose,
    options,
    selected,
    onChange,
    searchPlaceholderText,
    listMaxHeight,
    renderBelowOptions,
    closeHintId,
}: PanelProps<T>) => {
    const [searchText, setSearchText] = useState('');
    const selectedValues = new Set(selected);

    const {
        getRootProps,
        getInputProps,
        getListboxProps,
        getOptionProps,
        groupedOptions,
    } = useAutocomplete<MultiSelectOption<T>, true, true, false>({
        multiple: true,
        open: true,
        options,
        value: options.filter((option) => selectedValues.has(option.value)),
        inputValue: searchText,
        onInputChange: (_, value, reason) => {
            if (reason !== 'reset') setSearchText(value);
        },
        onChange: (_, newValue) => {
            onChange(newValue.map((option) => option.value));
        },
        onClose: (_, reason) => {
            if (reason === 'escape') onClose();
        },
        getOptionLabel: (option) => option.label,
        getOptionKey: (option) => String(option.value),
        isOptionEqualToValue: (option, value) => option.value === value.value,
        autoHighlight: true,
        disableCloseOnSelect: true,
        clearOnBlur: false,
    });

    const { ref: inputRef, ...inputProps } = getInputProps();

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
                    aria-multiselectable
                    sx={{ maxHeight: listMaxHeight }}
                >
                    {(groupedOptions as MultiSelectOption<T>[]).map(
                        (option, index) => {
                            const { key, ...optionProps } = getOptionProps({
                                option,
                                index,
                            });
                            return (
                                <StyledRow key={key} {...optionProps}>
                                    <StyledCheckbox
                                        checked={selectedValues.has(
                                            option.value,
                                        )}
                                        tabIndex={-1}
                                        size='small'
                                        aria-hidden
                                    />
                                    <StyledLabel>{option.label}</StyledLabel>
                                    {option.detail ? (
                                        <StyledDetail>
                                            {option.detail}
                                        </StyledDetail>
                                    ) : null}
                                </StyledRow>
                            );
                        },
                    )}
                </StyledList>
            </div>
            {renderBelowOptions?.(searchText.trim())}
            <StyledFooter>
                <span id={closeHintId}>Esc to close</span>
                <Button size='small' onClick={onClose}>
                    Done
                </Button>
            </StyledFooter>
        </>
    );
};

export const MultiSelectPopover = <T extends string | number>({
    open,
    anchorEl,
    horizontalAlign = 'left',
    ...panelProps
}: MultiSelectPopoverProps<T>) => {
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
                    'aria-describedby': closeHintId,
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
            <MultiSelectPanel {...panelProps} closeHintId={closeHintId} />
        </Popover>
    );
};
