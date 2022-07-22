import {
    Autocomplete,
    Button,
    Checkbox,
    styled,
    TextField,
} from '@mui/material';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import { IUser } from 'interfaces/user';
import { useMemo, useState, VFC } from 'react';
import { useUsers } from 'hooks/api/getters/useUsers/useUsers';
import { IGroupUser, Role } from 'interfaces/group';

const StyledOption = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    '& > span:first-of-type': {
        color: theme.palette.text.secondary,
    },
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

const renderOption = (
    props: React.HTMLAttributes<HTMLLIElement>,
    option: IUser,
    selected: boolean
) => (
    <li {...props}>
        <Checkbox
            icon={<CheckBoxOutlineBlankIcon fontSize="small" />}
            checkedIcon={<CheckBoxIcon fontSize="small" />}
            style={{ marginRight: 8 }}
            checked={selected}
        />
        <StyledOption>
            <span>{option.name || option.username}</span>
            <span>{option.email}</span>
        </StyledOption>
    </li>
);

interface IGroupFormUsersSelectProps {
    users: IGroupUser[];
    setUsers: React.Dispatch<React.SetStateAction<IGroupUser[]>>;
}

export const GroupFormUsersSelect: VFC<IGroupFormUsersSelectProps> = ({
    users,
    setUsers,
}) => {
    const { users: usersAll } = useUsers();
    const [selectedUsers, setSelectedUsers] = useState<IUser[]>([]);

    const usersOptions = useMemo(
        () =>
            usersAll.filter(
                (user: IUser) => !users?.map(({ id }) => id).includes(user.id)
            ),
        [usersAll, users]
    );

    const onAdd = () => {
        const usersToBeAdded = selectedUsers.map(
            (user: IUser): IGroupUser => ({
                ...user,
                role: Role.Member,
            })
        );
        setUsers((users: IGroupUser[]) => [...users, ...usersToBeAdded]);
        setSelectedUsers([]);
    };

    return (
        <StyledGroupFormUsersSelect>
            <Autocomplete
                size="small"
                multiple
                limitTags={10}
                disableCloseOnSelect
                value={selectedUsers}
                onChange={(event, newValue, reason) => {
                    if (
                        event.type === 'keydown' &&
                        (event as React.KeyboardEvent).key === 'Backspace' &&
                        reason === 'removeOption'
                    ) {
                        return;
                    }
                    setSelectedUsers(newValue);
                }}
                options={[...usersOptions].sort((a, b) => {
                    const aName = a.name || a.username || '';
                    const bName = b.name || b.username || '';
                    return aName.localeCompare(bName);
                })}
                renderOption={(props, option, { selected }) =>
                    renderOption(props, option as IUser, selected)
                }
                getOptionLabel={(option: IUser) =>
                    option.email || option.name || option.username || ''
                }
                renderInput={params => (
                    <TextField {...params} label="Select users" />
                )}
            />
            <Button variant="outlined" onClick={onAdd}>
                Add
            </Button>
        </StyledGroupFormUsersSelect>
    );
};
