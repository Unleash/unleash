import { Search } from '@mui/icons-material';
import { List, ListItemText, Box, InputAdornment } from '@mui/material';
import { FC, useEffect, useRef, useState } from 'react';
import {
    StyledCheckbox,
    StyledDropdown,
    StyledListItem,
    StyledPopover,
    StyledTextField,
} from './FilterItem.styles';
import { FilterItemChip } from './FilterItemChip/FilterItemChip';

interface IFilterItemProps {
    label: string;
    options: Array<{ label: string; value: string }>;
}

const singularOperators = ['IS', 'IS_NOT'];
const pluralOperators = [
    'IS_IN',
    'IS_NOT_IN',
];

export const FilterItem: FC<IFilterItemProps> = ({ label, options }) => {
    const ref = useRef<HTMLDivElement>(null);
    const [selectedOptions, setSelectedOptions] = useState<typeof options>([]);
    const [anchorEl, setAnchorEl] = useState<HTMLDivElement | null>(null);
    const [searchText, setSearchText] = useState('');
    const currentOperators =
        selectedOptions?.length > 1 ? pluralOperators : singularOperators;
    const [operator, setOperator] = useState(currentOperators[0]);

    const handleClick = () => {
        setAnchorEl(ref.current);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleToggle = (value: string) => () => {
        if (
            selectedOptions?.some(
                (selectedOption) => selectedOption.value === value,
            )
        ) {
            setSelectedOptions(
                selectedOptions?.filter(
                    (selectedOption) => selectedOption.value !== value,
                ),
            );
        } else {
            setSelectedOptions([
                ...(selectedOptions ?? []),
                options.find((option) => option.value === value) ?? {
                    label: '',
                    value: '',
                },
            ]);
        }
    };

    useEffect(() => {
        if (!currentOperators.includes(operator)) {
            setOperator(currentOperators[0]);
        }
    }, [currentOperators, operator]);

    return (
        <>
            <Box ref={ref}>
                <FilterItemChip
                    label={label}
                    selectedOptions={selectedOptions?.map(
                        (option) => option?.label,
                    )}
                    onDelete={handleClick}
                    onClick={handleClick}
                    operator={operator}
                    operatorOptions={currentOperators}
                    onChangeOperator={setOperator}
                />
            </Box>
            <StyledPopover
                open={Boolean(anchorEl)}
                anchorEl={anchorEl}
                onClose={handleClose}
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
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position='start'>
                                    <Search fontSize='small' />
                                </InputAdornment>
                            ),
                        }}
                    />
                    <List disablePadding>
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
                                                        selectedOption.value ===
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
