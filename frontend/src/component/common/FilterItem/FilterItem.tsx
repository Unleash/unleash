import {
    List,
    ListItemText,
    Box,
    Checkbox,
} from '@mui/material';
import { FC, useEffect, useRef, useState } from 'react';
import {
    StyledDropdown,
    StyledListItem,
    StyledPopover,
} from './FilterItem.styles';
import { FilterItemChip } from './FilterItemChip/FilterItemChip';
import { FilterItemSearch } from './FilterItemSearch/FilterItemSearch';
import { ConditionallyRender } from '../ConditionallyRender/ConditionallyRender';

interface IFilterItemProps {
    label: string;
    options: Array<{ label: string; value: string }>;
    withSearch?: boolean;
}

const singularOperators = ['IS', 'IS_NOT'];
const pluralOperators = ['IS_IN', 'IS_NOT_IN'];

export const FilterItem: FC<IFilterItemProps> = ({
    label,
    options,
    withSearch = false,
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

    const onDelete = () => {
        setSelectedOptions([]);
        onClose();
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
                    onDelete={onDelete}
                    onClick={onClick}
                    operator={operator}
                    operatorOptions={currentOperators}
                    onChangeOperator={setOperator}
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
                    <ConditionallyRender
                        condition={withSearch}
                        show={
                            <FilterItemSearch
                                value={searchText}
                                setValue={setSearchText}
                            />
                        }
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
                                        <Checkbox
                                            edge='start'
                                            checked={
                                                selectedOptions?.some(
                                                    (selectedOption) =>
                                                        selectedOption.value ===
                                                        option.value,
                                                ) ?? false
                                            }
                                            inputProps={{
                                                'aria-labelledby': labelId,
                                            }}
                                            size='small'
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
