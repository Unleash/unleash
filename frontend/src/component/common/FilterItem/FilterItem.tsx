import { Search } from '@mui/icons-material';
import { Box, InputAdornment, List, ListItemText } from '@mui/material';
import { FC, useEffect, useRef, useState } from 'react';
import {
    StyledCheckbox,
    StyledDropdown,
    StyledListItem,
    StyledPopover,
    StyledTextField,
} from './FilterItem.styles';
import { FilterItemChip } from './FilterItemChip/FilterItemChip';

export interface IFilterItemProps {
    label: string;
    options: Array<{ label: string; value: string }>;
    onChange: (value: FilterItemParams) => void;
    onChipClose: () => void;
    state: FilterItemParams | null | undefined;
    singularOperators: [string, ...string[]];
    pluralOperators: [string, ...string[]];
}

export type FilterItemParams = {
    operator: string;
    values: string[];
};

export const FilterItem: FC<IFilterItemProps> = ({
    label,
    options,
    onChange,
    onChipClose,
    state,
    singularOperators,
    pluralOperators,
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
        if (!state) {
            open();
        }
    }, []);

    const onClose = () => {
        setAnchorEl(null);
    };

    const selectedOptions = state ? state.values : [];
    const currentOperator = state ? state.operator : currentOperators[0];

    const onDelete = () => {
        onChange({ operator: singularOperators[0], values: [] });
        onClose();
        onChipClose();
    };

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
                    label={label}
                    selectedOptions={selectedOptions}
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
                    />
                    <List sx={{ overflowY: 'auto' }} disablePadding>
                        {options
                            ?.filter((option) =>
                                option.label
                                    .toLowerCase()
                                    .includes(searchText.toLowerCase()),
                            )
                            .map((option) => {
                                const labelId = `checkbox-list-label-${option.value}`;

                                return (
                                    <StyledListItem
                                        key={option.value}
                                        dense
                                        disablePadding
                                        onClick={handleToggle(option.value)}
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
