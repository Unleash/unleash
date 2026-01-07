import Search from '@mui/icons-material/Search';
import { Box, InputAdornment, List, ListItemText } from '@mui/material';
import { type FC, type ReactNode, useEffect, useRef, useState } from 'react';
import {
    StyledCheckbox,
    StyledDropdown,
    StyledListItem,
    StyledPopover,
    StyledTextField,
} from './FilterItem.styles';
import { FilterItemChip } from './FilterItemChip/FilterItemChip.tsx';

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

interface UseSelectionManagementProps {
    options: Array<{ label: string; value: string }>;
    handleToggle: (value: string) => () => void;
}

const useSelectionManagement = ({
    options,
    handleToggle,
}: UseSelectionManagementProps) => {
    const listRefs = useRef<Array<HTMLInputElement | HTMLLIElement | null>>([]);

    const handleSelection = (event: React.KeyboardEvent, index: number) => {
        // we have to be careful not to prevent other keys e.g tab
        if (event.key === 'ArrowDown' && index < listRefs.current.length - 1) {
            event.preventDefault();
            listRefs.current[index + 1]?.focus();
        } else if (event.key === 'ArrowUp' && index > 0) {
            event.preventDefault();
            listRefs.current[index - 1]?.focus();
        } else if (
            event.key === 'Enter' &&
            index === 0 &&
            listRefs.current[0]?.value &&
            options.length > 0
        ) {
            // if the search field is not empty and the user presses
            // enter from the search field, toggle the topmost item in
            // the filtered list event.preventDefault();
            handleToggle(options[0].value)();
        } else if (
            event.key === 'Enter' ||
            // allow selection with space when not in the search field
            (index !== 0 && event.key === ' ')
        ) {
            event.preventDefault();
            if (index > 0) {
                const listItemIndex = index - 1;
                handleToggle(options[listItemIndex].value)();
            }
        }
    };

    return { listRefs, handleSelection };
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
    const [anchorEl, setAnchorEl] = useState<HTMLDivElement | null>();
    const [searchText, setSearchText] = useState('');

    const currentOperators =
        state && state.values.length > 1 ? pluralOperators : singularOperators;

    const open = () => {
        setAnchorEl(ref.current);
    };

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

    const handleToggle = (value: string) => () => {
        if (
            selectedOptions?.some((selectedOption) => selectedOption === value)
        ) {
            const newOptions = selectedOptions?.filter(
                (selectedOption) => selectedOption !== value,
            );
            onChange({ operator: currentOperator, values: newOptions });
        } else {
            const newOptions = [
                ...(selectedOptions ?? []),
                (
                    options.find((option) => option.value === value) ?? {
                        label: '',
                        value: '',
                    }
                ).value,
            ];
            onChange({ operator: currentOperator, values: newOptions });
        }
    };

    const { listRefs, handleSelection } = useSelectionManagement({
        options: filteredOptions,
        handleToggle,
    });

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
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position='start'>
                                    <Search fontSize='small' />
                                </InputAdornment>
                            ),
                        }}
                        inputRef={(el) => {
                            listRefs.current[0] = el;
                        }}
                        onKeyDown={(event) => handleSelection(event, 0)}
                    />
                    <List sx={{ overflowY: 'auto' }} disablePadding>
                        {filteredOptions.map((option, index) => {
                            const labelId = `checkbox-list-label-${option.value}`;

                            return (
                                <StyledListItem
                                    key={option.value}
                                    dense
                                    disablePadding
                                    tabIndex={0}
                                    onClick={handleToggle(option.value)}
                                    ref={(el) => {
                                        listRefs.current[index + 1] = el;
                                    }}
                                    onKeyDown={(event) =>
                                        handleSelection(event, index + 1)
                                    }
                                >
                                    <StyledCheckbox
                                        edge='start'
                                        checked={
                                            selectedOptions?.some(
                                                (selectedOption) =>
                                                    selectedOption ===
                                                    option.value,
                                            ) ?? false
                                        }
                                        tabIndex={-1}
                                        inputProps={{
                                            'aria-labelledby': labelId,
                                        }}
                                        size='small'
                                        disableRipple
                                    />
                                    <ListItemText
                                        id={labelId}
                                        primary={option.label}
                                    />
                                </StyledListItem>
                            );
                        })}
                    </List>
                </StyledDropdown>
            </StyledPopover>
        </>
    );
};
