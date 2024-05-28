import Search from '@mui/icons-material/Search';
import { type FC, useRef, useState } from 'react';
import { InputAdornment, List, ListItemText } from '@mui/material';
import {
    StyledCheckbox,
    StyledListItem,
    StyledDropdownSearch,
} from './SelectionButton.styles';

const useSelectionManagement = (
    handleToggle: (value: string) => () => void,
) => {
    const listRefs = useRef<Array<HTMLInputElement | HTMLLIElement | null>>([]);

    const handleSelection = (
        event: React.KeyboardEvent,
        index: number,
        filteredOptions: { label: string; value: string }[],
    ) => {
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
            filteredOptions.length > 0
        ) {
            // if the search field is not empty and the user presses
            // enter from the search field, toggle the topmost item in
            // the filtered list event.preventDefault();
            handleToggle(filteredOptions[0].value)();
        } else if (
            event.key === 'Enter' ||
            // allow selection with space when not in the search field
            (index !== 0 && event.key === ' ')
        ) {
            event.preventDefault();
            if (index > 0) {
                const listItemIndex = index - 1;
                handleToggle(filteredOptions[listItemIndex].value)();
            }
        }
    };

    return { listRefs, handleSelection };
};

export type DropdownListProps = {
    options: Array<{ label: string; value: string }>;
    onChange: (value: string) => void;
    search: {
        label: string;
        placeholder: string;
    };
    multiselect?: { selectedOptions: Set<string> };
};

export const DropdownList: FC<DropdownListProps> = ({
    options,
    onChange,
    search,
    multiselect,
}) => {
    const [searchText, setSearchText] = useState('');

    const onSelection = (selected: string) => {
        onChange(selected);
    };

    const { listRefs, handleSelection } = useSelectionManagement(
        (selected: string) => () => onSelection(selected),
    );

    const filteredOptions = options?.filter((option) =>
        option.label.toLowerCase().includes(searchText.toLowerCase()),
    );

    return (
        <>
            <StyledDropdownSearch
                variant='outlined'
                size='small'
                value={searchText}
                onChange={(event) => setSearchText(event.target.value)}
                label={search.label}
                hideLabel
                placeholder={search.placeholder}
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
                onKeyDown={(event) =>
                    handleSelection(event, 0, filteredOptions)
                }
            />
            <List sx={{ overflowY: 'auto' }} disablePadding>
                {filteredOptions.map((option, index) => {
                    const labelId = `checkbox-list-label-${option.value}`;

                    return (
                        <StyledListItem
                            aria-describedby={labelId}
                            key={option.value}
                            dense
                            disablePadding
                            tabIndex={0}
                            onClick={() => {
                                onSelection(option.value);
                            }}
                            ref={(el) => {
                                listRefs.current[index + 1] = el;
                            }}
                            onKeyDown={(event) =>
                                handleSelection(
                                    event,
                                    index + 1,
                                    filteredOptions,
                                )
                            }
                        >
                            {multiselect ? (
                                <StyledCheckbox
                                    edge='start'
                                    checked={multiselect.selectedOptions.has(
                                        option.value,
                                    )}
                                    tabIndex={-1}
                                    inputProps={{
                                        'aria-labelledby': labelId,
                                    }}
                                    size='small'
                                    disableRipple
                                />
                            ) : null}
                            <ListItemText id={labelId} primary={option.label} />
                        </StyledListItem>
                    );
                })}
            </List>
        </>
    );
};
