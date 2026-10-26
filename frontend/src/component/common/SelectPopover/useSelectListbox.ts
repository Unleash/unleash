import {
    type CSSProperties,
    type KeyboardEvent,
    type ReactNode,
    useMemo,
    useState,
} from 'react';
import { type PopoverProps, useAutocomplete } from '@mui/material';

export type SelectOption<T> = {
    value: T;
    label: string;
    detail?: ReactNode;
    disabled?: boolean;
};

export type SelectOptionGroup<T> = {
    groupHeader: string;
    options: SelectOption<T>[];
};

export type FlatOption<T> = SelectOption<T> & { group?: string };

export type OptionsSource<T> =
    | { options: SelectOption<T>[]; optionGroups?: never }
    | { optionGroups: SelectOptionGroup<T>[]; options?: never };

export type SelectionProps<T> =
    | { multiple: true; selected?: T[]; onChange: (selected: T[]) => void }
    | { multiple?: false; selected?: T; onChange: (selected: T) => void };

export type BaseProps = {
    onClose: () => void;
    searchPlaceholderText: string;
    listMaxHeight?: CSSProperties['maxHeight'];
    renderBelowOptions?: (searchText: string) => ReactNode;
    horizontalAlign?: 'left' | 'right';
    id?: string;
};

export type UseSelectListboxOptions<T extends string | number> =
    OptionsSource<T> &
        SelectionProps<T> & {
            onClose: () => void;
            inputValue: string;
            onInputValueChange: (value: string) => void;
            id?: string;
        };

export type SelectPopoverProps<T> = Pick<PopoverProps, 'open' | 'anchorEl'> &
    BaseProps &
    OptionsSource<T> &
    SelectionProps<T>;

const NO_VALUE: never[] = [];

const isToggleIntent = (event: KeyboardEvent<HTMLInputElement>) =>
    event.key === ' ' && // only space can toggle
    !event.nativeEvent.isComposing && // IMEs (e.g. Japanese input) use space to convert text and cycle candidates; don't touch that
    event.keyCode !== 229; // IME keycode: https://developer.mozilla.org/en-US/docs/Web/API/Element/keydown_event#keydown_events_with_ime

const toSelectedArray = <T>({ multiple, selected }: SelectionProps<T>): T[] => {
    if (multiple) return selected ?? [];
    if (selected === undefined) return [];
    return [selected];
};

export const useSelectListbox = <T extends string | number>(
    props: UseSelectListboxOptions<T>,
) => {
    const {
        onClose,
        options,
        optionGroups,
        inputValue,
        onInputValueChange,
        id,
    } = props;
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
        id,
        multiple: true,
        open: true,
        options: flatOptions,
        value: NO_VALUE,
        inputValue,
        onInputChange: (_, value, reason) => {
            if (reason !== 'reset') {
                onInputValueChange(value);
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
        getOptionDisabled: (option) => Boolean(option.disabled),
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

    const wrappedGetOptionProps = (opts: {
        option: FlatOption<T>;
        index: number;
    }) => {
        const { onMouseMove: _hoverHighlight, ...optionProps } =
            getOptionProps(opts);
        return optionProps;
    };

    const isOptionSelected = (option: FlatOption<T>) =>
        selectedValues.has(option.value);

    return {
        keyboardHighlightedOption,
        isOptionSelected,
        groupedOptions,
        getRootProps,
        inputRef,
        inputProps,
        getListboxProps,
        getOptionProps: wrappedGetOptionProps,
        handleInputKeyDown,
    };
};
