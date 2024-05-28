import Search from '@mui/icons-material/Search';
import { v4 as uuidv4 } from 'uuid';
import {
    type FC,
    type ReactNode,
    useRef,
    useState,
    useMemo,
    type PropsWithChildren,
} from 'react';
import { Box, Button, InputAdornment, List, ListItemText } from '@mui/material';
import {
    StyledCheckbox,
    StyledDropdown,
    StyledListItem,
    StyledPopover,
    StyledDropdownSearch,
    TableSearchInput,
    HiddenDescription,
    ScrollContainer,
    ButtonLabel,
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
    button: { label: string; icon: ReactNode; labelWidth?: string };
    search: {
        label: string;
        placeholder: string;
    };
    multiselect?: { selectedOptions: Set<string> };
    onOpen?: () => void;
    onClose?: () => void;
    description: string; // visually hidden, for assistive tech
};

const CombinedSelectNoDropdown: FC<
    PropsWithChildren<{
        button: { label: string; icon: ReactNode; labelWidth?: string };
        onOpen?: () => void;
        onClose?: () => void;
        description: string; // visually hidden, for assistive tech
        preventOpen?: boolean;
        anchorEl: HTMLDivElement | null | undefined;
        setAnchorEl: (el: HTMLDivElement | null | undefined) => void;
    }>
> = ({
    button,
    onOpen = () => {},
    onClose = () => {},
    description,
    children,
    preventOpen,
    anchorEl,
    setAnchorEl,
}) => {
    const ref = useRef<HTMLDivElement>(null);
    const descriptionId = uuidv4();

    const open = () => {
        setAnchorEl(ref.current);
        onOpen();
    };

    const handleClose = () => {
        setAnchorEl(null);
        onClose();
    };

    return (
        <>
            <Box ref={ref}>
                <Button
                    variant='outlined'
                    color='primary'
                    startIcon={button.icon}
                    onClick={() => {
                        if (!preventOpen) {
                            open();
                        }
                    }}
                >
                    <ButtonLabel labelWidth={button.labelWidth}>
                        {button.label}
                    </ButtonLabel>
                </Button>
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
                <HiddenDescription id={descriptionId}>
                    {description}
                </HiddenDescription>
                <StyledDropdown aria-describedby={descriptionId}>
                    {children}
                </StyledDropdown>
            </StyledPopover>
        </>
    );
};

const DropdownList: FC<CombinedSelectProps> = ({
    options,
    onChange,
    search,
    multiselect,
}) => {
    const [searchText, setSearchText] = useState('');

    const onSelection = (selected: string) => {
        onChange(selected);
    };

    const { listRefs, handleSelection } = useSelectionManagement({
        handleToggle: (selected: string) => () => onSelection(selected),
    });

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

export const SingleSelectList2: FC<SingleSelectListProps> = ({
    onChange,
    ...props
}) => {
    const [anchorEl, setAnchorEl] = useState<HTMLDivElement | null>();
    const [recentlyClosed, setRecentlyClosed] = useState(false);

    const handleChange = (value: any) => {
        onChange(value);
        setAnchorEl(null);
        props.onClose && props.onClose();

        setRecentlyClosed(true);
        // this is a hack to prevent the button from being
        // auto-clicked after you select an item by pressing enter
        // in the search bar for single-select lists.
        setTimeout(() => setRecentlyClosed(false), 1);
    };

    return (
        <CombinedSelectNoDropdown
            {...props}
            preventOpen={recentlyClosed}
            anchorEl={anchorEl}
            setAnchorEl={setAnchorEl}
        >
            <DropdownList {...props} onChange={handleChange} />
        </CombinedSelectNoDropdown>
    );
};

export const MultiselectList2: FC<MultiselectListProps> = ({
    selectedOptions,
    onChange,
    ...rest
}) => {
    // todo: add "select all" and "deselect all"

    const [anchorEl, setAnchorEl] = useState<HTMLDivElement | null>();

    const handleToggle = (value: string) => {
        if (selectedOptions.has(value)) {
            selectedOptions.delete(value);
        } else {
            selectedOptions.add(value);
        }

        onChange(new Set(selectedOptions));
    };

    return (
        <CombinedSelectNoDropdown
            {...rest}
            anchorEl={anchorEl}
            setAnchorEl={setAnchorEl}
        >
            <DropdownList
                multiselect={{
                    selectedOptions,
                }}
                onChange={handleToggle}
                {...rest}
            />
        </CombinedSelectNoDropdown>
    );
};

export const TableSelect2: FC<TableSelectProps> = ({
    button,
    search,
    projectChangeRequestConfiguration,
    updateProjectChangeRequestConfiguration,
    activeEnvironments,
    onOpen = () => {},
    onClose = () => {},
    ...props
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

    const [anchorEl, setAnchorEl] = useState<HTMLDivElement | null>();
    const [searchText, setSearchText] = useState('');

    const open = () => {
        setSearchText('');
        setAnchorEl(ref.current);
        onOpen();
    };

    const handleClose = () => {
        setAnchorEl(null);
        onClose();
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
        <CombinedSelectNoDropdown
            button={button}
            {...props}
            anchorEl={anchorEl}
            setAnchorEl={setAnchorEl}
        >
            <TableSearchInput
                variant='outlined'
                size='small'
                value={searchText}
                onChange={(event) => setSearchText(event.target.value)}
                hideLabel
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
        </CombinedSelectNoDropdown>
    );
};

const CombinedSelect: FC<CombinedSelectProps> = ({
    options,
    onChange,
    button,
    search,
    multiselect,
    onOpen = () => {},
    onClose = () => {},
    description,
}) => {
    const ref = useRef<HTMLDivElement>(null);
    const [anchorEl, setAnchorEl] = useState<HTMLDivElement | null>();
    const [searchText, setSearchText] = useState('');
    const descriptionId = uuidv4();
    const [recentlyClosed, setRecentlyClosed] = useState(false);

    const open = () => {
        setSearchText('');
        setAnchorEl(ref.current);
        onOpen();
    };

    const handleClose = () => {
        setAnchorEl(null);
        onClose();
    };

    const onSelection = (selected: string) => {
        onChange(selected);
        if (!multiselect) {
            handleClose();
            setRecentlyClosed(true);
            // this is a hack to prevent the button from being
            // auto-clicked after you select an item by pressing enter
            // in the search bar for single-select lists.
            setTimeout(() => setRecentlyClosed(false), 1);
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
                        if (!recentlyClosed) {
                            open();
                        }
                    }}
                >
                    <ButtonLabel labelWidth={button.labelWidth}>
                        {button.label}
                    </ButtonLabel>
                </Button>
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
                <HiddenDescription id={descriptionId}>
                    {description}
                </HiddenDescription>
                <StyledDropdown aria-describedby={descriptionId}>
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
    'options' | 'button' | 'search' | 'onOpen' | 'onClose' | 'description'
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
    | 'options'
    | 'button'
    | 'search'
    | 'onChange'
    | 'onOpen'
    | 'onClose'
    | 'description'
>;

export const SingleSelectList: FC<SingleSelectListProps> = (props) => {
    return <CombinedSelect {...props} />;
};

type TableSelectProps = Pick<
    CombinedSelectProps,
    'button' | 'search' | 'onOpen' | 'onClose' | 'description'
> & {
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
};
export const TableSelect: FC<TableSelectProps> = ({
    button,
    search,
    projectChangeRequestConfiguration,
    updateProjectChangeRequestConfiguration,
    activeEnvironments,
    onOpen = () => {},
    onClose = () => {},
    ...props
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
        onOpen();
    };

    const handleClose = () => {
        setAnchorEl(null);
        onClose();
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
                >
                    <ButtonLabel labelWidth={button.labelWidth}>
                        {button.label}
                    </ButtonLabel>
                </Button>
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
                    <TableSearchInput
                        variant='outlined'
                        size='small'
                        value={searchText}
                        onChange={(event) => setSearchText(event.target.value)}
                        hideLabel
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
                    <ScrollContainer>
                        <ChangeRequestTable
                            environments={filteredEnvs}
                            enableEnvironment={onEnable}
                            disableEnvironment={onDisable}
                        />
                    </ScrollContainer>
                </StyledDropdown>
            </StyledPopover>
        </>
    );
};
