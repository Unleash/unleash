import Search from '@mui/icons-material/Search';
import { Box, InputAdornment } from '@mui/material';
import { type FC, type ReactNode, useEffect, useRef, useState } from 'react';
import {
    StyledDropdown,
    StyledPopover,
    StyledTextField,
} from './FilterItem.styles';
import { FilterItemChip } from './FilterItemChip/FilterItemChip.tsx';
import {
    VirtualizedFilterOptions,
    type VirtualizedFilterOptionsHandle,
} from './VirtualizedFilterOptions.tsx';

export interface IFilterItemProps {
    name: string;
    label: ReactNode;
    options: Array<{ label: string; value: string }>;
    onChange: (value: FilterItemParams) => void;
    onChipClose?: () => void;
    state: FilterItemParams | null | undefined;
    singularOperators: [string, ...string[]];
    pluralOperators: [string, ...string[]];
    initMode?: 'auto-open' | 'manual';
}

export type FilterItemParams = {
    operator: string;
    values: string[];
};

export const FilterItem: FC<IFilterItemProps> = ({
    name,
    label,
    options,
    onChange,
    onChipClose,
    state,
    singularOperators,
    pluralOperators,
    initMode = 'auto-open',
}) => {
    const ref = useRef<HTMLDivElement>(null);
    const searchRef = useRef<HTMLInputElement>(null);
    const listRef = useRef<VirtualizedFilterOptionsHandle>(null);
    const [anchorEl, setAnchorEl] = useState<HTMLDivElement | null>();
    const [searchText, setSearchText] = useState('');

    const currentOperators =
        state && state.values.length > 1 ? pluralOperators : singularOperators;

    const open = () => {
        setAnchorEl(ref.current);
    };

    // biome-ignore lint/correctness/useExhaustiveDependencies: intentional mount-only effect — popover should open once on mount, not re-open on state changes
    useEffect(() => {
        if (!state && initMode === 'auto-open') {
            open();
        }
    }, []);

    const onClose = () => {
        setAnchorEl(null);
    };

    const selectedOptions = state ? state.values : [];
    const selectedDisplayOptions = selectedOptions
        .map((value) => options.find((option) => option.value === value)?.label)
        .filter((label): label is string => label !== undefined);
    const currentOperator = state ? state.operator : currentOperators[0];

    const onDelete = onChipClose
        ? () => {
              onChange({ operator: singularOperators[0], values: [] });
              onClose();
              onChipClose();
          }
        : undefined;

    const filteredOptions = options.filter((option) =>
        option.label.toLowerCase().includes(searchText.toLowerCase()),
    );

    const handleToggle = (value: string) => {
        if (selectedOptions.includes(value)) {
            onChange({
                operator: currentOperator,
                values: selectedOptions.filter(
                    (selected) => selected !== value,
                ),
            });
        } else {
            onChange({
                operator: currentOperator,
                values: [...selectedOptions, value],
            });
        }
    };

    const handleSearchKeyDown = (event: React.KeyboardEvent) => {
        if (event.key === 'ArrowDown' && filteredOptions.length > 0) {
            event.preventDefault();
            listRef.current?.focusFirst();
        } else if (
            event.key === 'Enter' &&
            searchRef.current?.value &&
            filteredOptions.length > 0
        ) {
            event.preventDefault();
            handleToggle(filteredOptions[0].value);
        }
    };

    // biome-ignore lint/correctness/useExhaustiveDependencies: onChange and currentOperators are unstable inline references from the caller — adding them would cause the effect to run on every render
    useEffect(() => {
        if (state && !currentOperators.includes(state.operator)) {
            onChange({
                operator: currentOperators[0],
                values: state.values,
            });
        }
    }, [state]);

    return (
        <>
            <Box ref={ref}>
                <FilterItemChip
                    name={name}
                    label={label}
                    selectedDisplayOptions={selectedDisplayOptions}
                    onDelete={onDelete}
                    onClick={open}
                    operator={currentOperator}
                    operatorOptions={currentOperators}
                    onChangeOperator={(operator) => {
                        onChange({ operator, values: selectedOptions ?? [] });
                    }}
                />
            </Box>
            <StyledPopover
                open={Boolean(anchorEl)}
                anchorEl={anchorEl}
                onClose={onClose}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'left',
                }}
            >
                <StyledDropdown>
                    <StyledTextField
                        variant='outlined'
                        size='small'
                        value={searchText}
                        onChange={(event) => setSearchText(event.target.value)}
                        placeholder='Search'
                        autoFocus
                        slotProps={{
                            input: {
                                startAdornment: (
                                    <InputAdornment position='start'>
                                        <Search fontSize='small' />
                                    </InputAdornment>
                                ),
                            },
                        }}
                        inputRef={searchRef}
                        onKeyDown={handleSearchKeyDown}
                    />
                    <VirtualizedFilterOptions
                        ref={listRef}
                        options={filteredOptions}
                        selectedValues={selectedOptions}
                        onToggle={handleToggle}
                        onEscapeToSearch={() => searchRef.current?.focus()}
                    />
                </StyledDropdown>
            </StyledPopover>
        </>
    );
};
