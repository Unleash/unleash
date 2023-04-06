import {
    Autocomplete,
    autocompleteClasses,
    Checkbox,
    Popper,
    styled,
    TextField,
} from '@mui/material';
import { VariableSizeList, ListChildComponentProps } from 'react-window';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import { IUser } from 'interfaces/user';
import { VFC } from 'react';
import { useUsers } from 'hooks/api/getters/useUsers/useUsers';
import { IGroupUser } from 'interfaces/group';
import { UG_USERS_ID } from 'utils/testIds';
import { caseInsensitiveSearch } from 'utils/search';
import { useServiceAccounts } from 'hooks/api/getters/useServiceAccounts/useServiceAccounts';
import { IServiceAccount } from 'interfaces/service-account';
import React from 'react';

const StyledOption = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    '& > span:first-of-type': {
        color: theme.palette.text.secondary,
    },
}));

const StyledGroupHeader = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    color: theme.palette.text.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing(1),
}));

const StyledTags = styled('div')(({ theme }) => ({
    paddingLeft: theme.spacing(1),
}));

const StyledGroupFormUsersSelect = styled('div')(({ theme }) => ({
    display: 'flex',
    marginBottom: theme.spacing(3),
    '& > div:first-of-type': {
        width: '100%',
        maxWidth: theme.spacing(50),
        marginRight: theme.spacing(1),
    },
}));

const renderOption = (option: IUser, selected: boolean) => (
    <>
        <Checkbox
            icon={<CheckBoxOutlineBlankIcon fontSize="small" />}
            checkedIcon={<CheckBoxIcon fontSize="small" />}
            style={{ marginRight: 8 }}
            checked={selected}
        />
        <StyledOption>
            <span>{option.name || option.username}</span>
            <span>
                {option.name && option.username
                    ? option.username
                    : option.email}
            </span>
        </StyledOption>
    </>
);

const renderTags = (value: IGroupUser[]) => (
    <StyledTags>
        {value.length > 1
            ? `${value.length} users selected`
            : value[0].name || value[0].username || value[0].email}
    </StyledTags>
);

type UserOption = IUser & {
    type: string;
};

interface IGroupFormUsersSelectProps {
    users: IGroupUser[];
    setUsers: React.Dispatch<React.SetStateAction<IGroupUser[]>>;
}

const StyledPopper = styled(Popper)({
    [`& .${autocompleteClasses.listbox}`]: {
        boxSizing: 'border-box',
        '& ul': {
            padding: 0,
            margin: 0,
        },
    },
});

function renderRow(props: ListChildComponentProps) {
    const { data, index, style } = props;
    const dataSet = data[index]; // this is what we send in renderOption
    if (dataSet[1]) {
        return (
            <li {...dataSet[0]} style={style}>
                {renderOption(dataSet[1], dataSet[2])}
            </li>
        );
    } else {
        return (
            <li {...dataSet[0]} style={{ ...style, display: 'flex' }}>
                <StyledGroupHeader>
                    {dataSet.group} ({dataSet.children.length})
                </StyledGroupHeader>
            </li>
        );
    }
}

const OuterElementContext = React.createContext({});

const OuterElementType = React.forwardRef<HTMLDivElement>((props, ref) => {
    const outerProps = React.useContext(OuterElementContext);
    return <div ref={ref} {...props} {...outerProps} />;
});

function useResetCache(data: any) {
    const ref = React.useRef<VariableSizeList>(null);
    React.useEffect(() => {
        if (ref.current != null) {
            ref.current.resetAfterIndex(0, true);
        }
    }, [data]);
    return ref;
}

// Adapter for react-window
const ListboxComponent = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLElement>
>(function ListboxComponent(props, ref) {
    const { children, ...other } = props;
    const itemData: React.ReactChild[] = [];
    (children as React.ReactChild[]).forEach(
        (item: React.ReactChild & { children?: React.ReactChild[] }) => {
            itemData.push(item);
            itemData.push(...(item.children || []));
        }
    );

    const itemCount = itemData.length;
    const itemSize = 50;

    const getChildSize = (child: React.ReactChild) => {
        if (child.hasOwnProperty('group')) {
            return 50; // this is for grouping
        }

        return itemSize;
    };

    const getHeight = () => {
        if (itemCount > 8) {
            return 8 * itemSize;
        }
        return itemData.map(getChildSize).reduce((a, b) => a + b, 0);
    };

    const gridRef = useResetCache(itemCount);

    return (
        <div ref={ref}>
            <OuterElementContext.Provider value={other}>
                <VariableSizeList
                    itemData={itemData}
                    height={getHeight()}
                    width="100%"
                    ref={gridRef}
                    outerElementType={OuterElementType}
                    innerElementType="ul"
                    itemSize={index => getChildSize(itemData[index])}
                    overscanCount={5}
                    itemCount={itemCount}
                >
                    {renderRow}
                </VariableSizeList>
            </OuterElementContext.Provider>
        </div>
    );
});

export const GroupFormUsersSelect: VFC<IGroupFormUsersSelectProps> = ({
    users,
    setUsers,
}) => {
    const { users: usersAll } = useUsers();
    const { serviceAccounts } = useServiceAccounts();

    const options = [
        ...usersAll
            .map((user: IUser) => ({ ...user, type: 'USERS' }))
            .sort((a: IUser, b: IUser) => {
                const aName = a.name || a.username || '';
                const bName = b.name || b.username || '';
                return aName.localeCompare(bName);
            }),
        ...serviceAccounts
            .map((serviceAccount: IServiceAccount) => ({
                ...serviceAccount,
                type: 'SERVICE ACCOUNTS',
            }))
            .sort((a, b) => {
                const aName = a.name || a.username || '';
                const bName = b.name || b.username || '';
                return aName.localeCompare(bName);
            }),
    ];

    const virtualized = true;
    if (virtualized)
        return (
            <StyledGroupFormUsersSelect>
                <Autocomplete
                    data-testid={UG_USERS_ID}
                    size="small"
                    multiple
                    limitTags={1}
                    openOnFocus
                    disableCloseOnSelect
                    value={users as UserOption[]}
                    PopperComponent={StyledPopper}
                    ListboxComponent={ListboxComponent}
                    onChange={(event, newValue, reason) => {
                        if (
                            event.type === 'keydown' &&
                            (event as React.KeyboardEvent).key ===
                                'Backspace' &&
                            reason === 'removeOption'
                        ) {
                            return;
                        }
                        setUsers(newValue);
                    }}
                    groupBy={option => option.type}
                    options={options}
                    renderOption={(props, option, { selected }) =>
                        [
                            props,
                            option as UserOption,
                            selected,
                        ] as React.ReactNode
                    }
                    filterOptions={(options, { inputValue }) =>
                        options.filter(
                            ({ name, username, email }) =>
                                caseInsensitiveSearch(inputValue, email) ||
                                caseInsensitiveSearch(inputValue, name) ||
                                caseInsensitiveSearch(inputValue, username)
                        )
                    }
                    isOptionEqualToValue={(option, value) =>
                        option.id === value.id
                    }
                    getOptionLabel={(option: UserOption) =>
                        option.email || option.name || option.username || ''
                    }
                    renderInput={params => (
                        <TextField {...params} label="Select users" />
                    )}
                    renderTags={value => renderTags(value)}
                    // TODO: Post React 18 update - validate this conversion, look like a hidden bug
                    // but without this line, the component is not working
                    renderGroup={params => params as unknown as React.ReactNode}
                />
            </StyledGroupFormUsersSelect>
        );
    else
        return (
            <StyledGroupFormUsersSelect>
                <Autocomplete
                    data-testid={UG_USERS_ID}
                    size="small"
                    multiple
                    limitTags={1}
                    openOnFocus
                    disableCloseOnSelect
                    value={users as UserOption[]}
                    onChange={(event, newValue, reason) => {
                        if (
                            event.type === 'keydown' &&
                            (event as React.KeyboardEvent).key ===
                                'Backspace' &&
                            reason === 'removeOption'
                        ) {
                            return;
                        }
                        setUsers(newValue);
                    }}
                    groupBy={option => option.type}
                    options={options}
                    renderOption={(props, option, { selected }) => (
                        <li {...props}>
                            {renderOption(option as UserOption, selected)}
                        </li>
                    )}
                    filterOptions={(options, { inputValue }) =>
                        options.filter(
                            ({ name, username, email }) =>
                                caseInsensitiveSearch(inputValue, email) ||
                                caseInsensitiveSearch(inputValue, name) ||
                                caseInsensitiveSearch(inputValue, username)
                        )
                    }
                    isOptionEqualToValue={(option, value) =>
                        option.id === value.id
                    }
                    getOptionLabel={(option: UserOption) =>
                        option.email || option.name || option.username || ''
                    }
                    renderInput={params => (
                        <TextField {...params} label="Select users" />
                    )}
                    renderTags={value => renderTags(value)}
                />
            </StyledGroupFormUsersSelect>
        );
};
