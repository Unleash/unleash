import { useId, useState } from 'react';
import { autocompleteClasses, Popover, styled } from '@mui/material';
import { SelectSearchInput } from './SelectSearchInput.tsx';
import { SelectOptionsList } from './SelectOptionsList.tsx';
import { SelectPopoverFooter } from './SelectPopoverFooter.tsx';
import {
    type BaseProps,
    type OptionsSource,
    type SelectionProps,
    type SelectPopoverProps,
    useSelectListbox,
} from './useSelectListbox.ts';

export type { SelectOption, SelectOptionGroup } from './useSelectListbox.ts';

const StyledPanel = styled('div')(({ theme }) => ({
    [`&:focus-within .${autocompleteClasses.focused}`]: {
        backgroundColor: theme.palette.action.hover,
    },
    [`&:focus-within .${autocompleteClasses.focusVisible}`]: {
        outline: `2px solid ${theme.palette.primary.main}`,
        outlineOffset: '-2px',
    },
}));

type SelectPopoverContentProps<T extends string | number> = Omit<
    BaseProps,
    'horizontalAlign'
> &
    OptionsSource<T> &
    SelectionProps<T> & { closeHintId: string };

const SelectPopoverContent = <T extends string | number>(
    props: SelectPopoverContentProps<T>,
) => {
    const {
        onClose,
        searchPlaceholderText,
        listMaxHeight,
        renderBelowOptions,
        multiple,
        id,
        closeHintId,
    } = props;
    const [searchText, setSearchText] = useState('');

    const {
        keyboardHighlightedOption,
        isOptionSelected,
        groupedOptions,
        getRootProps,
        inputRef,
        inputProps,
        getListboxProps,
        getOptionProps,
        handleInputKeyDown,
    } = useSelectListbox({
        ...props,
        id,
        inputValue: searchText,
        onInputValueChange: setSearchText,
    });

    return (
        <>
            <StyledPanel {...getRootProps()}>
                <SelectSearchInput
                    placeholder={searchPlaceholderText}
                    inputRef={inputRef}
                    inputProps={inputProps}
                    isKeyboardHighlighted={Boolean(keyboardHighlightedOption)}
                    onKeyDown={handleInputKeyDown}
                />
                <SelectOptionsList
                    groupedOptions={groupedOptions}
                    listboxProps={getListboxProps()}
                    getOptionProps={getOptionProps}
                    isOptionSelected={isOptionSelected}
                    multiple={Boolean(multiple)}
                    listMaxHeight={listMaxHeight}
                />
            </StyledPanel>
            {renderBelowOptions?.(searchText.trim())}
            {multiple ? (
                <SelectPopoverFooter
                    closeHintId={closeHintId}
                    onClose={onClose}
                />
            ) : null}
        </>
    );
};

export const SelectPopover = <T extends string | number>(
    props: SelectPopoverProps<T>,
) => {
    const {
        open,
        anchorEl,
        horizontalAlign = 'left',
        onClose,
        multiple,
        disableRestoreFocus,
    } = props;
    const closeHintId = useId();

    return (
        <Popover
            open={open}
            anchorEl={anchorEl}
            onClose={onClose}
            disableRestoreFocus={disableRestoreFocus}
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
            <SelectPopoverContent {...props} closeHintId={closeHintId} />
        </Popover>
    );
};
