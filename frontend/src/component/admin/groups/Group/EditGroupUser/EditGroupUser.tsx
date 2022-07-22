import { Button, MenuItem, Select, styled } from '@mui/material';
import FormTemplate from 'component/common/FormTemplate/FormTemplate';
import { SidebarModal } from 'component/common/SidebarModal/SidebarModal';
import { useGroupApi } from 'hooks/api/actions/useGroupApi/useGroupApi';
import { useGroup } from 'hooks/api/getters/useGroup/useGroup';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import useToast from 'hooks/useToast';
import { IGroup, IGroupUser, Role } from 'interfaces/group';
import { FC, FormEvent, useEffect, useMemo, useState } from 'react';
import { formatUnknownError } from 'utils/formatUnknownError';

const StyledForm = styled('form')(() => ({
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
}));

const StyledUser = styled('div')(({ theme }) => ({
    width: '100%',
    maxWidth: theme.spacing(50),
    marginBottom: theme.spacing(2),
    padding: theme.spacing(1.5),
    borderRadius: theme.shape.borderRadiusMedium,
    backgroundColor: theme.palette.secondaryContainer,
    display: 'flex',
    flexDirection: 'column',
    '& > span:first-of-type': {
        color: theme.palette.text.secondary,
    },
}));

const StyledInputDescription = styled('p')(({ theme }) => ({
    color: theme.palette.text.secondary,
    marginBottom: theme.spacing(1),
}));

const StyledSelect = styled(Select)(({ theme }) => ({
    width: '100%',
    maxWidth: theme.spacing(50),
    marginBottom: theme.spacing(2),
}));

const StyledButtonContainer = styled('div')(() => ({
    marginTop: 'auto',
    display: 'flex',
    justifyContent: 'flex-end',
}));

const StyledCancelButton = styled(Button)(({ theme }) => ({
    marginLeft: theme.spacing(3),
}));

interface IEditGroupUserProps {
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    user?: IGroupUser;
    group: IGroup;
}

export const EditGroupUser: FC<IEditGroupUserProps> = ({
    open,
    setOpen,
    user,
    group,
}) => {
    const { refetchGroup } = useGroup(group.id);
    const { updateGroup, loading } = useGroupApi();
    const { setToastData, setToastApiError } = useToast();
    const { uiConfig } = useUiConfig();

    const [role, setRole] = useState<Role>(user?.role || Role.Member);

    useEffect(() => {
        setRole(user?.role || Role.Member);
    }, [user, open]);

    const payload = useMemo(() => {
        const editUsers = [...group.users];
        const editUserIndex = editUsers.findIndex(({ id }) => id === user?.id);
        editUsers[editUserIndex] = {
            ...user!,
            role,
        };
        return {
            name: group.name,
            description: group.description,
            users: editUsers.map(({ id, role }) => ({
                user: { id },
                role,
            })),
        };
    }, [group, user, role]);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        try {
            await updateGroup(group.id, payload);
            refetchGroup();
            setOpen(false);
            setToastData({
                title: 'User edited successfully',
                type: 'success',
            });
        } catch (error: unknown) {
            setToastApiError(formatUnknownError(error));
        }
    };

    const formatApiCode = () => {
        return `curl --location --request PUT '${
            uiConfig.unleashUrl
        }/api/admin/groups/${group.id}' \\
    --header 'Authorization: INSERT_API_KEY' \\
    --header 'Content-Type: application/json' \\
    --data-raw '${JSON.stringify(payload, undefined, 2)}'`;
    };

    return (
        <SidebarModal
            open={open && Boolean(user)}
            onClose={() => {
                setOpen(false);
            }}
            label="Edit user"
        >
            <FormTemplate
                loading={loading}
                modal
                title="Edit user"
                description="Groups is the best and easiest way to organize users and then use them in projects to assign a specific role in one go to all the users in a group."
                documentationLink="https://docs.getunleash.io/advanced/groups"
                documentationLinkLabel="Groups documentation"
                formatApiCode={formatApiCode}
            >
                <StyledForm onSubmit={handleSubmit}>
                    <div>
                        <StyledUser>
                            <span>{user?.name || user?.username}</span>
                            <span>{user?.email}</span>
                        </StyledUser>
                        <StyledInputDescription>
                            Assign the role the user should have in this group
                        </StyledInputDescription>
                        <StyledSelect
                            size="small"
                            value={role}
                            onChange={event =>
                                setRole(event.target.value as Role)
                            }
                        >
                            {Object.values(Role).map(role => (
                                <MenuItem key={role} value={role}>
                                    {role}
                                </MenuItem>
                            ))}
                        </StyledSelect>
                    </div>

                    <StyledButtonContainer>
                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                        >
                            Save
                        </Button>
                        <StyledCancelButton
                            onClick={() => {
                                setOpen(false);
                            }}
                        >
                            Cancel
                        </StyledCancelButton>
                    </StyledButtonContainer>
                </StyledForm>
            </FormTemplate>
        </SidebarModal>
    );
};
