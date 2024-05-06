import Search from '@mui/icons-material/Search';
import { Box, Button, InputAdornment, List, ListItemText } from '@mui/material';
import { type FC, type ReactNode, useRef, useState, useMemo } from 'react';
import {
    StyledCheckbox,
    StyledDropdown,
    StyledListItem,
    StyledPopover,
    StyledTextField,
    TableSearchInput,
} from './SelectionButton.styles';
import { ChangeRequestTable } from './ChangeRequestTable';

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
    handleToggle: (value: string) => () => void;
}

const useSelectionManagement = ({
    handleToggle,
}: UseSelectionManagementProps) => {
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

type CombinedSelectProps = {
    options: Array<{ label: string; value: string }>;
    onChange: (value: string) => void;
    button: { label: string; icon: ReactNode };
    search: {
        label: string;
        placeholder: string;
    };
    multiselect?: { selectedOptions: Set<string> };
};

const CombinedSelect: FC<CombinedSelectProps> = ({
    options,
    onChange,
    button,
    search,
    multiselect,
}) => {
    const ref = useRef<HTMLDivElement>(null);
    const [anchorEl, setAnchorEl] = useState<HTMLDivElement | null>();
    const [searchText, setSearchText] = useState('');

    const open = () => {
        setSearchText('');
        setAnchorEl(ref.current);
    };

    const onClose = () => {
        setAnchorEl(null);
    };

    const onSelection = (selected: string) => {
        onChange(selected);
        if (!multiselect) {
            onClose();
        }
    };

    const { listRefs, handleSelection } = useSelectionManagement({
        handleToggle: (selected: string) => () => onSelection(selected),
    });

    const filteredOptions = options?.filter((option) =>
        option.label.toLowerCase().includes(searchText.toLowerCase()),
    );
    return (
        <>
            <Box ref={ref}>
                <Button
                    variant='outlined'
                    color='primary'
                    startIcon={button.icon}
                    onClick={() => {
                        // todo: find out why this is clicked when you
                        // press enter in the search bar (only in
                        // single-select mode)
                        open();
                    }}
                >
                    {button.label}
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
                        label={search.label}
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

type MultiselectListProps = Pick<
    CombinedSelectProps,
    'options' | 'button' | 'search'
> & {
    selectedOptions: Set<string>;
    onChange: (values: Set<string>) => void;
};

export const MultiselectList: FC<MultiselectListProps> = ({
    selectedOptions,
    onChange,
    ...rest
}) => {
    // todo: add "select all" and "deselect all"

    const handleToggle = (value: string) => {
        if (selectedOptions.has(value)) {
            selectedOptions.delete(value);
        } else {
            selectedOptions.add(value);
        }

        onChange(new Set(selectedOptions));
    };

    return (
        <CombinedSelect
            {...rest}
            onChange={handleToggle}
            multiselect={{
                selectedOptions,
            }}
        />
    );
};

type SingleSelectListProps = Pick<
    CombinedSelectProps,
    'options' | 'button' | 'search' | 'onChange'
>;

export const SingleSelectList: FC<SingleSelectListProps> = (props) => {
    return <CombinedSelect {...props} />;
};

type TableSelectProps = Pick<CombinedSelectProps, 'button' | 'search'> & {
    updateProjectChangeRequestConfiguration: {
        disableChangeRequests: (env: string) => void;
        enableChangeRequests: (env: string, requiredApprovals: number) => void;
    };
    activeEnvironments: {
        name: string;
        type: string;
    }[];
    projectChangeRequestConfiguration: Record<
        string,
        { requiredApprovals: number }
    >;
    disabled: boolean;
};
export const TableSelect: FC<TableSelectProps> = ({
    button,
    disabled,
    search,
    projectChangeRequestConfiguration,
    updateProjectChangeRequestConfiguration,
    activeEnvironments,
}) => {
    const configured = useMemo(() => {
        return Object.fromEntries(
            Object.entries(projectChangeRequestConfiguration).map(
                ([name, config]) => [
                    name,
                    { ...config, changeRequestEnabled: true },
                ],
            ),
        );
    }, [projectChangeRequestConfiguration]);

    const tableEnvs = useMemo(
        () =>
            activeEnvironments.map(({ name, type }) => ({
                name,
                type,
                ...(configured[name] ?? { changeRequestEnabled: false }),
            })),
        [configured, activeEnvironments],
    );

    const onEnable = (name: string, requiredApprovals: number) => {
        updateProjectChangeRequestConfiguration.enableChangeRequests(
            name,
            requiredApprovals,
        );
    };

    const onDisable = (name: string) => {
        updateProjectChangeRequestConfiguration.disableChangeRequests(name);
    };

    const ref = useRef<HTMLDivElement>(null);
    const [anchorEl, setAnchorEl] = useState<HTMLDivElement | null>();
    const [searchText, setSearchText] = useState('');

    const open = () => {
        setSearchText('');
        setAnchorEl(ref.current);
    };

    const onClose = () => {
        setAnchorEl(null);
    };

    const filteredEnvs = tableEnvs.filter((env) =>
        env.name.toLowerCase().includes(searchText.toLowerCase()),
    );

    const toggleTopItem = (event: React.KeyboardEvent) => {
        if (
            event.key === 'Enter' &&
            searchText.trim().length > 0 &&
            filteredEnvs.length > 0
        ) {
            const firstEnv = filteredEnvs[0];
            if (firstEnv.name in configured) {
                onDisable(firstEnv.name);
            } else {
                onEnable(firstEnv.name, 1);
            }
        }
    };

    return (
        <>
            <Box ref={ref}>
                <Button
                    variant='outlined'
                    color='primary'
                    startIcon={button.icon}
                    onClick={() => {
                        open();
                    }}
                    disabled={disabled}
                >
                    {button.label}
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
                    <TableSearchInput
                        variant='outlined'
                        size='small'
                        value={searchText}
                        onChange={(event) => setSearchText(event.target.value)}
                        label={search.label}
                        placeholder={search.placeholder}
                        autoFocus
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position='start'>
                                    <Search fontSize='small' />
                                </InputAdornment>
                            ),
                        }}
                        onKeyDown={toggleTopItem}
                    />
                    <ChangeRequestTable
                        environments={filteredEnvs}
                        enableEnvironment={onEnable}
                        disableEnvironment={onDisable}
                    />
                </StyledDropdown>
            </StyledPopover>
        </>
    );
};
