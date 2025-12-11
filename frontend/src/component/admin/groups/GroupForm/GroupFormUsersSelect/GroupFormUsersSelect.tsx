import { Checkbox, styled, TextField } from '@mui/material';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import type { IUser } from 'interfaces/user';
import type { VFC } from 'react';
import { useUsers } from 'hooks/api/getters/useUsers/useUsers';
import type { IGroupUser } from 'interfaces/group';
import { UG_USERS_ID } from 'utils/testIds';
import { caseInsensitiveSearch } from 'utils/search';
import { useServiceAccounts } from 'hooks/api/getters/useServiceAccounts/useServiceAccounts';
import type { IServiceAccount } from 'interfaces/service-account';
import AutocompleteVirtual from 'component/common/AutocompleteVirtual/AutcompleteVirtual';

const StyledOption = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    '& > span:first-of-type': {
        color: theme.palette.text.secondary,
    },
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

const StrechedLi = styled('li')({ width: '100%' });

const renderOption = (
    props: React.HTMLAttributes<HTMLLIElement>,
    option: IUser,
    { selected }: { selected: boolean },
) => (
    <StrechedLi {...props} key={option.id}>
        <Checkbox
            icon={<CheckBoxOutlineBlankIcon fontSize='small' />}
            checkedIcon={<CheckBoxIcon fontSize='small' />}
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
    </StrechedLi>
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

export const GroupFormUsersSelect: VFC<IGroupFormUsersSelectProps> = ({
    users,
    setUsers,
}) => {
    const { users: usersAll, loading: isUsersLoading } = useUsers();
    const { serviceAccounts, loading: isServiceAccountsLoading } =
        useServiceAccounts();

    const isLoading = isUsersLoading || isServiceAccountsLoading;
    const options = isLoading
        ? []
        : [
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

    const _isLargeList = options.length > 200;

    return (
        <StyledGroupFormUsersSelect>
            <AutocompleteVirtual
                data-testid={UG_USERS_ID}
                size='small'
                limitTags={1}
                openOnFocus
                multiple
                disableCloseOnSelect
                value={users as UserOption[]}
                onChange={(event, newValue, reason) => {
                    if (
                        event.type === 'keydown' &&
                        (event as React.KeyboardEvent).key === 'Backspace' &&
                        reason === 'removeOption'
                    ) {
                        return;
                    }
                    setUsers(newValue);
                }}
                options={options}
                groupBy={(option) => option.type}
                renderOption={renderOption}
                filterOptions={(options, { inputValue }) =>
                    options.filter(
                        ({ name, username, email }) =>
                            caseInsensitiveSearch(inputValue, email) ||
                            caseInsensitiveSearch(inputValue, name) ||
                            caseInsensitiveSearch(inputValue, username),
                    )
                }
                isOptionEqualToValue={(option, value) => option.id === value.id}
                getOptionLabel={(option: UserOption) =>
                    option.email || option.name || option.username || ''
                }
                renderInput={(params) => (
                    <TextField {...params} label='Select users' />
                )}
                renderTags={(value) => renderTags(value)}
                noOptionsText={isLoading ? 'Loading…' : 'No options'}
            />
        </StyledGroupFormUsersSelect>
    );
};
