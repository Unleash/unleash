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
    onChange?: (value: string) => void;
}

const singularOperators = ['IS', 'IS_NOT'];
const pluralOperators = ['IS_ANY_OF', 'IS_NONE_OF'];

export const FilterItem: FC<IFilterItemProps> = ({
    label,
    options,
    onChange,
}) => {
    const ref = useRef<HTMLDivElement>(null);
    const [selectedOptions, setSelectedOptions] = useState<typeof options>([]);
    const [anchorEl, setAnchorEl] = useState<HTMLDivElement | null>(null);
    const [searchText, setSearchText] = useState('');
    const currentOperators =
        selectedOptions?.length > 1 ? pluralOperators : singularOperators;
    const [operator, setOperator] = useState(currentOperators[0]);

    const onClick = () => {
        setAnchorEl(ref.current);
    };

    const onClose = () => {
        setAnchorEl(null);
    };

    const handleOnChange = (
        op: typeof operator,
        values: typeof selectedOptions,
    ) => {
        const value = values.length
            ? `${op}:${values?.map((option) => option.value).join(', ')}`
            : '';
        onChange?.(value);
    };

    const handleOperatorChange = (value: string) => {
        setOperator(value);
        handleOnChange(value, selectedOptions);
    };

    const handleOptionsChange = (values: typeof selectedOptions) => {
        setSelectedOptions(values);
        handleOnChange(operator, values);
    };

    const onDelete = () => {
        handleOptionsChange([]);
        onClose();
    };

    const handleToggle = (value: string) => () => {
        if (
            selectedOptions?.some(
                (selectedOption) => selectedOption.value === value,
            )
        ) {
            const newOptions = selectedOptions?.filter(
                (selectedOption) => selectedOption.value !== value,
            );
            handleOptionsChange(newOptions);
        } else {
            const newOptions = [
                ...(selectedOptions ?? []),
                options.find((option) => option.value === value) ?? {
                    label: '',
                    value: '',
                },
            ];
            handleOptionsChange(newOptions);
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
                    onDelete={onDelete}
                    onClick={onClick}
                    operator={operator}
                    operatorOptions={currentOperators}
                    onChangeOperator={handleOperatorChange}
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
