import { Button, styled } from '@mui/material';
import FormTemplate from 'component/common/FormTemplate/FormTemplate';
import { SidebarModal } from 'component/common/SidebarModal/SidebarModal';
import { useGroupApi } from 'hooks/api/actions/useGroupApi/useGroupApi';
import { useGroup } from 'hooks/api/getters/useGroup/useGroup';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import useToast from 'hooks/useToast';
import { IGroup, IGroupUser } from 'interfaces/group';
import { FC, FormEvent, useEffect, useMemo, useState } from 'react';
import { formatUnknownError } from 'utils/formatUnknownError';
import { GroupFormUsersSelect } from 'component/admin/groups/GroupForm/GroupFormUsersSelect/GroupFormUsersSelect';
import { GroupFormUsersTable } from 'component/admin/groups/GroupForm/GroupFormUsersTable/GroupFormUsersTable';
import { UG_SAVE_BTN_ID } from 'utils/testIds';

const StyledForm = styled('form')(() => ({
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
}));

const StyledInputDescription = styled('p')(({ theme }) => ({
    color: theme.palette.text.secondary,
    marginBottom: theme.spacing(1),
}));

const StyledButtonContainer = styled('div')(() => ({
    marginTop: 'auto',
    display: 'flex',
    justifyContent: 'flex-end',
}));

const StyledCancelButton = styled(Button)(({ theme }) => ({
    marginLeft: theme.spacing(3),
}));

interface IAddGroupUserProps {
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    group: IGroup;
}

export const AddGroupUser: FC<IAddGroupUserProps> = ({
    open,
    setOpen,
    group,
}) => {
    const { refetchGroup } = useGroup(group.id);
    const { updateGroup, loading } = useGroupApi();
    const { setToastData, setToastApiError } = useToast();
    const { uiConfig } = useUiConfig();

    const [users, setUsers] = useState<IGroupUser[]>(group.users);

    useEffect(() => {
        setUsers(group.users);
    }, [group.users, open]);

    const newUsers = useMemo(() => {
        return users.filter(
            user => !group.users.some(({ id }) => id === user.id)
        );
    }, [group.users, users]);

    const payload = useMemo(() => {
        const addUsers = [...group.users, ...newUsers];
        return {
            name: group.name,
            description: group.description,
            users: addUsers.map(({ id, role }) => ({
                user: { id },
                role,
            })),
        };
    }, [group, newUsers]);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        try {
            const message =
                newUsers.length === 1
                    ? `${
                          newUsers[0].name ||
                          newUsers[0].username ||
                          newUsers[0].email
                      } added to the group`
                    : `${newUsers.length} users added to the group`;
            await updateGroup(group.id, payload);
            refetchGroup();
            setOpen(false);
            setToastData({
                title: message,
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
            open={open}
            onClose={() => {
                setOpen(false);
            }}
            label="Add user"
        >
            <FormTemplate
                loading={loading}
                modal
                title="Add user"
                description="Groups is the best and easiest way to organize users and then use them in projects to assign a specific role in one go to all the users in a group."
                documentationLink="https://docs.getunleash.io/advanced/groups"
                documentationLinkLabel="Groups documentation"
                formatApiCode={formatApiCode}
            >
                <StyledForm onSubmit={handleSubmit}>
                    <div>
                        <StyledInputDescription>
                            Add users to this group
                        </StyledInputDescription>
                        <GroupFormUsersSelect
                            users={users}
                            setUsers={setUsers}
                        />
                        <GroupFormUsersTable
                            users={newUsers}
                            setUsers={setUsers}
                        />
                    </div>

                    <StyledButtonContainer>
                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            data-testid={UG_SAVE_BTN_ID}
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
