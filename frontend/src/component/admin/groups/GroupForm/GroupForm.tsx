import React, { FC } from 'react';
import { Box, Button, styled } from '@mui/material';
import { UG_DESC_ID, UG_NAME_ID } from 'utils/testIds';
import Input from 'component/common/Input/Input';
import { IGroupUser } from 'interfaces/group';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { GroupFormUsersSelect } from './GroupFormUsersSelect/GroupFormUsersSelect';
import { GroupFormUsersTable } from './GroupFormUsersTable/GroupFormUsersTable';
import { ItemList } from 'component/common/ItemList/ItemList';
import useAuthSettings from 'hooks/api/getters/useAuthSettings/useAuthSettings';
import { Link } from 'react-router-dom';
import { HelpIcon } from 'component/common/HelpIcon/HelpIcon';
import { IRole } from 'interfaces/role';
import { useUsers } from 'hooks/api/getters/useUsers/useUsers';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { RoleSelect } from 'component/common/RoleSelect/RoleSelect';

const StyledForm = styled('form')(() => ({
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
}));

const StyledInputDescription = styled('p')(({ theme }) => ({
    color: theme.palette.text.secondary,
    marginBottom: theme.spacing(1),
}));

const StyledInput = styled(Input)(({ theme }) => ({
    width: '100%',
    maxWidth: theme.spacing(60),
    marginBottom: theme.spacing(2),
}));

const StyledItemList = styled(ItemList)(({ theme }) => ({
    width: '100%',
    maxWidth: theme.spacing(60),
    marginBottom: theme.spacing(2),
}));

const StyledGroupFormUsersTableWrapper = styled('div')(({ theme }) => ({
    marginBottom: theme.spacing(6),
}));

const StyledButtonContainer = styled('div')(() => ({
    marginTop: 'auto',
    display: 'flex',
    justifyContent: 'flex-end',
}));

const StyledCancelButton = styled(Button)(({ theme }) => ({
    marginLeft: theme.spacing(3),
}));

const StyledDescriptionBlock = styled('div')(({ theme }) => ({
    width: '100%',
    maxWidth: theme.spacing(60),
    padding: theme.spacing(3),
    backgroundColor: theme.palette.neutral.light,
    color: theme.palette.text.primary,
    fontSize: theme.fontSizes.smallBody,
    borderRadius: theme.shape.borderRadiusMedium,
    marginBottom: theme.spacing(2),

    a: {
        color: theme.palette.links,
    },
}));

const StyledAutocompleteWrapper = styled('div')(({ theme }) => ({
    '& > div:first-of-type': {
        width: '100%',
        maxWidth: theme.spacing(50),
        marginBottom: theme.spacing(2),
    },
}));

interface IGroupForm {
    name: string;
    description: string;
    mappingsSSO: string[];
    users: IGroupUser[];
    rootRole: number | null;
    setName: (name: string) => void;
    setDescription: React.Dispatch<React.SetStateAction<string>>;
    setMappingsSSO: React.Dispatch<React.SetStateAction<string[]>>;
    setUsers: React.Dispatch<React.SetStateAction<IGroupUser[]>>;
    setRootRole: React.Dispatch<React.SetStateAction<number | null>>;
    handleSubmit: (e: any) => void;
    handleCancel: () => void;
    errors: { [key: string]: string };
    mode: 'Create' | 'Edit';
}

export const GroupForm: FC<IGroupForm> = ({
    name,
    description,
    mappingsSSO,
    users,
    rootRole,
    setName,
    setDescription,
    setMappingsSSO,
    setUsers,
    handleSubmit,
    handleCancel,
    setRootRole,
    errors,
    mode,
    children,
}) => {
    const { config: oidcSettings } = useAuthSettings('oidc');
    const { config: samlSettings } = useAuthSettings('saml');
    const { uiConfig } = useUiConfig();
    const { roles } = useUsers();

    const isGroupSyncingEnabled =
        (oidcSettings?.enabled && oidcSettings.enableGroupSyncing) ||
        (samlSettings?.enabled && samlSettings.enableGroupSyncing);

    const groupRootRolesEnabled = Boolean(uiConfig.flags.groupRootRoles);

    const roleIdToRole = (rootRoleId: number | null): IRole | null => {
        return roles.find((role: IRole) => role.id === rootRoleId) || null;
    };

    return (
        <StyledForm onSubmit={handleSubmit}>
            <div>
                <StyledInputDescription>
                    What would you like to call your group?
                </StyledInputDescription>
                <StyledInput
                    autoFocus
                    label="Name"
                    id="group-name"
                    error={Boolean(errors.name)}
                    errorText={errors.name}
                    value={name}
                    onChange={e => setName(e.target.value)}
                    data-testid={UG_NAME_ID}
                    required
                />
                <StyledInputDescription>
                    How would you describe your group?
                </StyledInputDescription>
                <StyledInput
                    multiline
                    rows={4}
                    label="Description"
                    placeholder="A short description of the group"
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    data-testid={UG_DESC_ID}
                />
                <ConditionallyRender
                    condition={isGroupSyncingEnabled}
                    show={
                        <>
                            <StyledInputDescription>
                                Is this group associated with SSO groups?
                            </StyledInputDescription>
                            <StyledItemList
                                label="SSO group ID / name"
                                value={mappingsSSO}
                                onChange={setMappingsSSO}
                            />
                        </>
                    }
                    elseShow={() => (
                        <StyledDescriptionBlock>
                            <Box sx={{ display: 'flex' }}>
                                You can enable SSO groups synchronization if
                                needed
                                <HelpIcon tooltip="SSO groups synchronization allows SSO groups to be mapped to Unleash groups, so that user group membership is properly synchronized." />
                            </Box>
                            <Link data-loading to={`/admin/auth`}>
                                <span data-loading>View SSO configuration</span>
                            </Link>
                        </StyledDescriptionBlock>
                    )}
                />
                <ConditionallyRender
                    condition={groupRootRolesEnabled}
                    show={
                        <>
                            <StyledInputDescription>
                                <Box sx={{ display: 'flex' }}>
                                    Do you want to associate a root role with
                                    this group?
                                    <HelpIcon tooltip="When you associate an Admin or Editor role with this group, users in this group will automatically inherit the role globally. Note that groups with a root role association cannot be assigned to projects." />
                                </Box>
                            </StyledInputDescription>
                            <StyledAutocompleteWrapper>
                                <RoleSelect
                                    data-testid="GROUP_ROOT_ROLE"
                                    roles={roles}
                                    value={roleIdToRole(rootRole)}
                                    setValue={role =>
                                        setRootRole(role?.id || null)
                                    }
                                />
                            </StyledAutocompleteWrapper>
                        </>
                    }
                />
                <ConditionallyRender
                    condition={mode === 'Create'}
                    show={
                        <>
                            <StyledInputDescription>
                                Add users to this group
                            </StyledInputDescription>
                            <GroupFormUsersSelect
                                users={users}
                                setUsers={setUsers}
                            />
                            <StyledGroupFormUsersTableWrapper>
                                <GroupFormUsersTable
                                    users={users}
                                    setUsers={setUsers}
                                />
                            </StyledGroupFormUsersTableWrapper>
                        </>
                    }
                />
            </div>

            <StyledButtonContainer>
                {children}
                <StyledCancelButton onClick={handleCancel}>
                    Cancel
                </StyledCancelButton>
            </StyledButtonContainer>
        </StyledForm>
    );
};
