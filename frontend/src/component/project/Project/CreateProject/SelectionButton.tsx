import Search from '@mui/icons-material/Search';
import { Box, Button, InputAdornment, List, ListItemText } from '@mui/material';
import { type FC, type ReactNode, useRef, useState } from 'react';
import {
    StyledCheckbox,
    StyledDropdown,
    StyledListItem,
    StyledPopover,
    StyledTextField,
} from './FilterItem.styles';
import CloudCircle from '@mui/icons-material/CloudCircle';

export interface IFilterItemProps {
    label: ReactNode;
    options: Array<{ label: string; value: string }>;
    selectedOptions: Set<string>;
    onChange: (values: Set<string>) => void;
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
        } else if (event.key === 'Enter' || event.key === ' ') {
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
    options,
    onChange,
    selectedOptions,
}) => {
    const ref = useRef<HTMLDivElement>(null);
    const [anchorEl, setAnchorEl] = useState<HTMLDivElement | null>();
    const [searchText, setSearchText] = useState('');

    const open = () => {
        setAnchorEl(ref.current);
    };

    const onClose = () => {
        setAnchorEl(null);
    };

    const handleToggle = (value: string) => () => {
        if (selectedOptions.has(value)) {
            selectedOptions.delete(value);
        } else {
            selectedOptions.add(value);
        }

        onChange(new Set(selectedOptions));
    };

    const { listRefs, handleSelection } = useSelectionManagement({
        options,
        handleToggle,
    });

    const buttonText =
        selectedOptions.size > 0
            ? `${selectedOptions.size} selected`
            : 'Select environments';

    return (
        <>
            <Box ref={ref}>
                <Button
                    variant='outlined'
                    color='primary'
                    startIcon={<CloudCircle />}
                    onClick={open}
                >
                    {buttonText}
                </Button>
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
                        {options
                            ?.filter((option) =>
                                option.label
                                    .toLowerCase()
                                    .includes(searchText.toLowerCase()),
                            )
                            .map((option, index) => {
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
                                            checked={selectedOptions.has(
                                                option.value,
                                            )}
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
