import React, { FormEvent, useState } from 'react';
import {
    Autocomplete,
    Button,
    capitalize,
    Checkbox,
    styled,
    TextField,
    Tooltip,
} from '@mui/material';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import useProjectApi from 'hooks/api/actions/useProjectApi/useProjectApi';
import useToast from 'hooks/useToast';
import useProjectAccess, {
    ENTITY_TYPE,
    IProjectAccess,
} from 'hooks/api/getters/useProjectAccess/useProjectAccess';
import { IRole } from 'interfaces/role';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import FormTemplate from 'component/common/FormTemplate/FormTemplate';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { SidebarModal } from 'component/common/SidebarModal/SidebarModal';
import { formatUnknownError } from 'utils/formatUnknownError';
import { IUser } from 'interfaces/user';
import { IGroup } from 'interfaces/group';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { useNavigate } from 'react-router-dom';
import { GO_BACK } from 'constants/navigate';
import {
    PA_ASSIGN_CREATE_ID,
    PA_ROLE_ID,
    PA_USERS_GROUPS_ID,
    PA_USERS_GROUPS_TITLE_ID,
} from 'utils/testIds';
import { caseInsensitiveSearch } from 'utils/search';
import { IServiceAccount } from 'interfaces/service-account';
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

const StyledAutocompleteWrapper = styled('div')(({ theme }) => ({
    '& > div:first-of-type': {
        width: '100%',
        maxWidth: theme.spacing(50),
        marginBottom: theme.spacing(2),
    },
}));

const StyledButtonContainer = styled('div')(({ theme }) => ({
    marginTop: theme.spacing(6),
    display: 'flex',
    justifyContent: 'flex-end',
}));

const StyledCancelButton = styled(Button)(({ theme }) => ({
    marginLeft: theme.spacing(3),
}));

const StyledGroupOption = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    '& > span:last-of-type': {
        color: theme.palette.text.secondary,
    },
}));

const StyledUserOption = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    '& > span:first-of-type': {
        color: theme.palette.text.secondary,
    },
}));

interface IAccessOption {
    id: number;
    entity: IUser | IGroup;
    type: ENTITY_TYPE;
}

interface IProjectAccessAssignProps {
    selected?: IProjectAccess;
    accesses: IProjectAccess[];
    users: IUser[];
    serviceAccounts: IServiceAccount[];
    groups: IGroup[];
    roles: IRole[];
}

export const ProjectAccessAssign = ({
    selected,
    accesses,
    users,
    serviceAccounts,
    groups,
    roles,
}: IProjectAccessAssignProps) => {
    const { uiConfig } = useUiConfig();
    const { flags } = uiConfig;
    const entityType = flags.UG ? 'user / group' : 'user';

    const projectId = useRequiredPathParam('projectId');
    const { refetchProjectAccess } = useProjectAccess(projectId);
    const { addAccessToProject, changeUserRole, changeGroupRole, loading } =
        useProjectApi();
    const edit = Boolean(selected);

    const { setToastData, setToastApiError } = useToast();
    const navigate = useNavigate();

    const options = [
        ...groups
            .filter(
                (group: IGroup) =>
                    edit ||
                    !accesses.some(
                        ({ entity: { id }, type }) =>
                            group.id === id && type === ENTITY_TYPE.GROUP
                    )
            )
            .map((group: IGroup) => ({
                id: group.id,
                entity: group,
                type: ENTITY_TYPE.GROUP,
            })),
        ...users
            .filter(
                (user: IUser) =>
                    edit ||
                    !accesses.some(
                        ({ entity: { id }, type }) =>
                            user.id === id && type === ENTITY_TYPE.USER
                    )
            )
            .sort((a: IUser, b: IUser) => {
                const aName = a.name || a.username || '';
                const bName = b.name || b.username || '';
                return aName.localeCompare(bName);
            })
            .map((user: IUser) => ({
                id: user.id,
                entity: user,
                type: ENTITY_TYPE.USER,
            })),
        ...serviceAccounts
            .filter(
                (serviceAccount: IServiceAccount) =>
                    edit ||
                    !accesses.some(
                        ({ entity: { id }, type }) =>
                            serviceAccount.id === id &&
                            type === ENTITY_TYPE.SERVICE_ACCOUNT
                    )
            )
            .sort((a: IServiceAccount, b: IServiceAccount) => {
                const aName = a.name || a.username || '';
                const bName = b.name || b.username || '';
                return aName.localeCompare(bName);
            })
            .map((serviceAccount: IServiceAccount) => ({
                id: serviceAccount.id,
                entity: serviceAccount,
                type: ENTITY_TYPE.SERVICE_ACCOUNT,
            })),
    ];

    const [selectedOptions, setSelectedOptions] = useState<IAccessOption[]>(
        () =>
            options.filter(
                ({ id, type }) =>
                    id === selected?.entity.id && type === selected?.type
            )
    );
    const [role, setRole] = useState<IRole | null>(
        roles.find(({ id }) => id === selected?.entity.roleId) ?? null
    );

    const payload = {
        users: selectedOptions
            ?.filter(
                ({ type }) =>
                    type === ENTITY_TYPE.USER ||
                    type === ENTITY_TYPE.SERVICE_ACCOUNT
            )
            .map(({ id }) => ({ id })),
        groups: selectedOptions
            ?.filter(({ type }) => type === ENTITY_TYPE.GROUP)
            .map(({ id }) => ({ id })),
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!isValid) return;

        try {
            if (!edit) {
                await addAccessToProject(projectId, role.id, payload);
            } else if (
                selected?.type === ENTITY_TYPE.USER ||
                selected?.type === ENTITY_TYPE.SERVICE_ACCOUNT
            ) {
                await changeUserRole(projectId, role.id, selected.entity.id);
            } else if (selected?.type === ENTITY_TYPE.GROUP) {
                await changeGroupRole(projectId, role.id, selected.entity.id);
            }
            refetchProjectAccess();
            navigate(GO_BACK);
            setToastData({
                title: `${selectedOptions.length} ${
                    selectedOptions.length === 1 ? 'access' : 'accesses'
                } ${!edit ? 'assigned' : 'edited'} successfully`,
                type: 'success',
            });
        } catch (error: unknown) {
            setToastApiError(formatUnknownError(error));
        }
    };

    const formatApiCode = () => {
        if (edit) {
            return `curl --location --request ${edit ? 'PUT' : 'POST'} '${
                uiConfig.unleashUrl
            }/api/admin/projects/${projectId}/${
                selected?.type === ENTITY_TYPE.USER ||
                selected?.type === ENTITY_TYPE.SERVICE_ACCOUNT
                    ? 'users'
                    : 'groups'
            }/${selected?.entity.id}/roles/${role?.id}' \\
            --header 'Authorization: INSERT_API_KEY'`;
        }
        return `curl --location --request ${edit ? 'PUT' : 'POST'} '${
            uiConfig.unleashUrl
        }/api/admin/projects/${projectId}/role/${role?.id}/access' \\
        --header 'Authorization: INSERT_API_KEY' \\
        --header 'Content-Type: application/json' \\
        --data-raw '${JSON.stringify(payload, undefined, 2)}'`;
    };

    const createRootGroupWarning = (group?: IGroup): string | undefined => {
        if (group && Boolean(group.rootRole)) {
            return 'This group has an Admin or Editor role associated with it. Groups with a root role association cannot be assigned to projects, and users in this group already have the role applied globally.';
        }
    };

    const renderOption = (
        props: React.HTMLAttributes<HTMLLIElement>,
        option: IAccessOption,
        selected: boolean
    ) => {
        let optionGroup;
        let optionUser;
        if (option.type === ENTITY_TYPE.GROUP) {
            optionGroup = option.entity as IGroup;
        } else {
            optionUser = option.entity as IUser;
        }
        return (
            <Tooltip title={createRootGroupWarning(optionGroup)}>
                <span>
                    <li {...props}>
                        <Checkbox
                            icon={<CheckBoxOutlineBlankIcon fontSize="small" />}
                            checkedIcon={<CheckBoxIcon fontSize="small" />}
                            style={{ marginRight: 8 }}
                            checked={selected}
                        />
                        <ConditionallyRender
                            condition={option.type === ENTITY_TYPE.GROUP}
                            show={
                                <span>
                                    <StyledGroupOption>
                                        <span>{optionGroup?.name}</span>
                                        <span>
                                            {optionGroup?.userCount} users
                                        </span>
                                    </StyledGroupOption>
                                </span>
                            }
                            elseShow={
                                <StyledUserOption>
                                    <span>
                                        {optionUser?.name ||
                                            optionUser?.username}
                                    </span>
                                    <span>
                                        {optionUser?.name &&
                                        optionUser?.username
                                            ? optionUser?.username
                                            : optionUser?.email}
                                    </span>
                                </StyledUserOption>
                            }
                        />
                    </li>
                </span>
            </Tooltip>
        );
    };

    const isValid = selectedOptions.length > 0 && role;

    return (
        <SidebarModal
            open
            onClose={() => navigate(GO_BACK)}
            label={`${!edit ? 'Assign' : 'Edit'} ${entityType} access`}
        >
            <FormTemplate
                loading={loading}
                modal
                title={`${!edit ? 'Assign' : 'Edit'} ${entityType} access`}
                description="Custom project roles allow you to fine-tune access rights and permissions within your projects."
                documentationLink="https://docs.getunleash.io/how-to/how-to-create-and-assign-custom-project-roles"
                documentationLinkLabel="Project access documentation"
                formatApiCode={formatApiCode}
            >
                <StyledForm onSubmit={handleSubmit}>
                    <div>
                        <StyledInputDescription
                            data-testid={PA_USERS_GROUPS_TITLE_ID}
                        >
                            Select the {entityType}
                        </StyledInputDescription>
                        <StyledAutocompleteWrapper>
                            <Autocomplete
                                data-testid={PA_USERS_GROUPS_ID}
                                size="small"
                                multiple
                                openOnFocus
                                limitTags={10}
                                disableCloseOnSelect
                                disabled={edit}
                                value={selectedOptions}
                                getOptionDisabled={option => {
                                    if (option.type === ENTITY_TYPE.GROUP) {
                                        const optionGroup =
                                            option.entity as IGroup;
                                        return Boolean(optionGroup.rootRole);
                                    }
                                    return false;
                                }}
                                onChange={(event, newValue, reason) => {
                                    if (
                                        event.type === 'keydown' &&
                                        (event as React.KeyboardEvent).key ===
                                            'Backspace' &&
                                        reason === 'removeOption'
                                    ) {
                                        return;
                                    }
                                    setSelectedOptions(newValue);
                                }}
                                options={options}
                                groupBy={option => option.type}
                                renderOption={(props, option, { selected }) =>
                                    renderOption(props, option, selected)
                                }
                                getOptionLabel={(option: IAccessOption) => {
                                    if (
                                        option.type === ENTITY_TYPE.USER ||
                                        option.type ===
                                            ENTITY_TYPE.SERVICE_ACCOUNT
                                    ) {
                                        const optionUser =
                                            option.entity as IUser;
                                        return (
                                            optionUser.email ||
                                            optionUser.name ||
                                            optionUser.username ||
                                            ''
                                        );
                                    } else {
                                        return option.entity.name;
                                    }
                                }}
                                filterOptions={(options, { inputValue }) =>
                                    options.filter((option: IAccessOption) => {
                                        if (
                                            option.type === ENTITY_TYPE.USER ||
                                            option.type ===
                                                ENTITY_TYPE.SERVICE_ACCOUNT
                                        ) {
                                            const optionUser =
                                                option.entity as IUser;
                                            return (
                                                caseInsensitiveSearch(
                                                    inputValue,
                                                    optionUser.email
                                                ) ||
                                                caseInsensitiveSearch(
                                                    inputValue,
                                                    optionUser.name
                                                ) ||
                                                caseInsensitiveSearch(
                                                    inputValue,
                                                    optionUser.username
                                                )
                                            );
                                        }
                                        return caseInsensitiveSearch(
                                            inputValue,
                                            option.entity.name
                                        );
                                    })
                                }
                                isOptionEqualToValue={(option, value) =>
                                    option.type === value.type &&
                                    option.entity.id === value.entity.id
                                }
                                renderInput={params => (
                                    <TextField
                                        {...params}
                                        label={capitalize(entityType)}
                                    />
                                )}
                            />
                        </StyledAutocompleteWrapper>
                        <StyledInputDescription>
                            Select the role to assign for this project
                        </StyledInputDescription>
                        <StyledAutocompleteWrapper>
                            <RoleSelect
                                data-testid={PA_ROLE_ID}
                                roles={roles}
                                value={role}
                                setValue={role => setRole(role || null)}
                            />
                        </StyledAutocompleteWrapper>
                    </div>

                    <StyledButtonContainer>
                        <Button
                            data-testid={PA_ASSIGN_CREATE_ID}
                            type="submit"
                            variant="contained"
                            color="primary"
                            disabled={!isValid}
                        >
                            {edit ? 'Save' : `Assign ${entityType}`}
                        </Button>
                        <StyledCancelButton onClick={() => navigate(GO_BACK)}>
                            Cancel
                        </StyledCancelButton>
                    </StyledButtonContainer>
                </StyledForm>
            </FormTemplate>
        </SidebarModal>
    );
};
