import type React from 'react';
import { type FormEvent, useState } from 'react';
import {
    Button,
    capitalize,
    Checkbox,
    Chip,
    styled,
    TextField,
} from '@mui/material';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import useProjectApi from 'hooks/api/actions/useProjectApi/useProjectApi';
import useToast from 'hooks/useToast';
import useProjectAccess, {
    ENTITY_TYPE,
    type IProjectAccess,
} from 'hooks/api/getters/useProjectAccess/useProjectAccess';
import type { IRole } from 'interfaces/role';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import FormTemplate from 'component/common/FormTemplate/FormTemplate';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { SidebarModal } from 'component/common/SidebarModal/SidebarModal';
import { formatUnknownError } from 'utils/formatUnknownError';
import type { IUser } from 'interfaces/user';
import type { IGroup } from 'interfaces/group';
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
import type { IServiceAccount } from 'interfaces/service-account';
import { MultipleRoleSelect } from 'component/common/MultipleRoleSelect/MultipleRoleSelect';
import type { IUserProjectRole } from '../../../../interfaces/userProjectRoles.ts';
import { useCheckProjectPermissions } from 'hooks/useHasAccess';
import { ADMIN } from 'component/providers/AccessProvider/permissions';
import AutocompleteVirtual from 'component/common/AutocompleteVirtual/AutcompleteVirtual';

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

const getOptionLabel = (option: IAccessOption) => {
    if (
        option.type === ENTITY_TYPE.USER ||
        option.type === ENTITY_TYPE.SERVICE_ACCOUNT
    ) {
        const optionUser = option.entity as IUser;
        return optionUser.email || optionUser.name || optionUser.username || '';
    } else {
        return option.entity.name;
    }
};

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
    userRoles: IUserProjectRole[];
}

export const ProjectAccessAssign = ({
    selected,
    accesses,
    users,
    serviceAccounts,
    groups,
    roles,
    userRoles,
}: IProjectAccessAssignProps) => {
    const { uiConfig } = useUiConfig();
    const { flags } = uiConfig;
    const entityType = flags.UG ? 'user / group' : 'user';

    const projectId = useRequiredPathParam('projectId');
    const { refetchProjectAccess } = useProjectAccess(projectId);
    const { addAccessToProject, setUserRoles, setGroupRoles, loading } =
        useProjectApi();
    const edit = Boolean(selected);

    const checkPermissions = useCheckProjectPermissions(projectId);

    const { setToastData, setToastApiError } = useToast();
    const navigate = useNavigate();

    const options = [
        ...groups
            .filter(
                (group: IGroup) =>
                    edit ||
                    !accesses.some(
                        ({ entity: { id }, type }) =>
                            group.id === id && type === ENTITY_TYPE.GROUP,
                    ),
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
                            user.id === id && type === ENTITY_TYPE.USER,
                    ),
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
                            type === ENTITY_TYPE.SERVICE_ACCOUNT,
                    ),
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
                    id === selected?.entity.id && type === selected?.type,
            ),
    );
    const [selectedRoles, setRoles] = useState<IRole[]>(
        roles.filter(({ id }) => selected?.entity?.roles?.includes(id)),
    );

    const payload = {
        roles: selectedRoles.map(({ id }) => id),
        groups: selectedOptions
            ?.filter(({ type }) => type === ENTITY_TYPE.GROUP)
            .map(({ id }) => id),
        users: selectedOptions
            ?.filter(
                ({ type }) =>
                    type === ENTITY_TYPE.USER ||
                    type === ENTITY_TYPE.SERVICE_ACCOUNT,
            )
            .map(({ id }) => id),
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!isValid) return;
        try {
            if (!edit) {
                await addAccessToProject(projectId, payload);
            } else if (
                selected?.type === ENTITY_TYPE.USER ||
                selected?.type === ENTITY_TYPE.SERVICE_ACCOUNT
            ) {
                await setUserRoles(
                    projectId,
                    selectedRoles.map(({ id }) => id),
                    selected.entity.id,
                );
            } else if (selected?.type === ENTITY_TYPE.GROUP) {
                await setGroupRoles(
                    projectId,
                    selectedRoles.map(({ id }) => id),
                    selected.entity.id,
                );
            }
            refetchProjectAccess();
            navigate(GO_BACK);
            setToastData({
                text: `${selectedOptions.length} ${
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
            return `curl --location --request PUT '${
                uiConfig.unleashUrl
            }/api/admin/projects/${projectId}/${
                selected?.type === ENTITY_TYPE.USER ||
                selected?.type === ENTITY_TYPE.SERVICE_ACCOUNT
                    ? 'users'
                    : 'groups'
            }/${selected?.entity.id}/roles' \\
--header 'Authorization: INSERT_API_KEY' \\
--header 'Content-Type: application/json' \\
--data-raw '${JSON.stringify({ roles: payload.roles }, undefined, 2)}'`;
        }
        return `curl --location --request POST '${
            uiConfig.unleashUrl
        }/api/admin/projects/${projectId}/access' \\
--header 'Authorization: INSERT_API_KEY' \\
--header 'Content-Type: application/json' \\
--data-raw '${JSON.stringify(payload, undefined, 2)}'`;
    };

    const renderOption = (
        { key, ...props }: React.HTMLAttributes<HTMLLIElement> & { key?: any },
        option: IAccessOption,
        selected: boolean,
    ) => {
        let optionGroup: IGroup | undefined, optionUser: IUser | undefined;
        if (option.type === ENTITY_TYPE.GROUP) {
            optionGroup = option.entity as IGroup;
        } else {
            optionUser = option.entity as IUser;
        }
        return (
            <li key={key} {...props}>
                <Checkbox
                    icon={<CheckBoxOutlineBlankIcon fontSize='small' />}
                    checkedIcon={<CheckBoxIcon fontSize='small' />}
                    style={{ marginRight: 8 }}
                    checked={selected}
                />
                <ConditionallyRender
                    condition={option.type === ENTITY_TYPE.GROUP}
                    show={
                        <span>
                            <StyledGroupOption>
                                <span>{optionGroup?.name}</span>
                                <span>{optionGroup?.userCount} users</span>
                            </StyledGroupOption>
                        </span>
                    }
                    elseShow={
                        <StyledUserOption>
                            <span>
                                {optionUser?.name || optionUser?.username}
                            </span>
                            <span>
                                {optionUser?.name && optionUser?.username
                                    ? optionUser?.username
                                    : optionUser?.email}
                            </span>
                        </StyledUserOption>
                    }
                />
            </li>
        );
    };

    const isValid = selectedOptions.length > 0 && selectedRoles.length > 0;
    const displayAllRoles =
        checkPermissions(ADMIN) ||
        userRoles.length === 0 ||
        userRoles.some((userRole) => userRole.name === 'Owner');

    let filteredRoles: IRole[];
    if (displayAllRoles) {
        filteredRoles = roles;
    } else {
        filteredRoles = roles.filter((role) =>
            userRoles.some((userrole) => role.id === userrole.id),
        );
    }

    const autocompleteSize = 'small';

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
                description='Custom project roles allow you to fine-tune access rights and permissions within your projects.'
                documentationLink='https://docs.getunleash.io/concepts/rbac#create-and-assign-a-custom-project-role'
                documentationLinkLabel='Project access documentation'
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
                            <AutocompleteVirtual
                                data-testid={PA_USERS_GROUPS_ID}
                                size={autocompleteSize}
                                multiple
                                openOnFocus
                                limitTags={10}
                                disableCloseOnSelect
                                disabled={edit}
                                value={selectedOptions}
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
                                groupBy={(option) => option.type}
                                renderOption={(props, option, { selected }) =>
                                    renderOption(props, option, selected)
                                }
                                getOptionLabel={getOptionLabel}
                                renderTags={(tagValue, getTagProps) =>
                                    tagValue.map((option, index) => {
                                        return (
                                            <Chip
                                                {...getTagProps({ index })}
                                                size={autocompleteSize}
                                                key={`${option.type}:${option.id}`}
                                                label={getOptionLabel(option)}
                                            />
                                        );
                                    })
                                }
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
                                                    optionUser.email,
                                                ) ||
                                                caseInsensitiveSearch(
                                                    inputValue,
                                                    optionUser.name,
                                                ) ||
                                                caseInsensitiveSearch(
                                                    inputValue,
                                                    optionUser.username,
                                                )
                                            );
                                        }
                                        return caseInsensitiveSearch(
                                            inputValue,
                                            option.entity.name,
                                        );
                                    })
                                }
                                isOptionEqualToValue={(option, value) =>
                                    option.type === value.type &&
                                    option.entity.id === value.entity.id
                                }
                                renderInput={(params) => (
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
                            <MultipleRoleSelect
                                data-testid={PA_ROLE_ID}
                                roles={filteredRoles}
                                value={selectedRoles}
                                setValue={setRoles}
                            />
                        </StyledAutocompleteWrapper>
                    </div>

                    <StyledButtonContainer>
                        <Button
                            data-testid={PA_ASSIGN_CREATE_ID}
                            type='submit'
                            variant='contained'
                            color='primary'
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
