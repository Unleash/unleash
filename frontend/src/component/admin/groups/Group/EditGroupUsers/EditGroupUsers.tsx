import { Button, styled } from '@mui/material';
import FormTemplate from 'component/common/FormTemplate/FormTemplate';
import { SidebarModal } from 'component/common/SidebarModal/SidebarModal';
import { useGroupApi } from 'hooks/api/actions/useGroupApi/useGroupApi';
import { useGroup } from 'hooks/api/getters/useGroup/useGroup';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import useToast from 'hooks/useToast';
import { IGroup } from 'interfaces/group';
import { FC, FormEvent, useEffect } from 'react';
import { formatUnknownError } from 'utils/formatUnknownError';
import { GroupFormUsersSelect } from 'component/admin/groups/GroupForm/GroupFormUsersSelect/GroupFormUsersSelect';
import { GroupFormUsersTable } from 'component/admin/groups/GroupForm/GroupFormUsersTable/GroupFormUsersTable';
import { UG_SAVE_BTN_ID } from 'utils/testIds';
import { useGroupForm } from 'component/admin/groups/hooks/useGroupForm';
import { useGroups } from 'hooks/api/getters/useGroups/useGroups';

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

interface IEditGroupUsersProps {
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    group: IGroup;
}

export const EditGroupUsers: FC<IEditGroupUsersProps> = ({
    open,
    setOpen,
    group,
}) => {
    const { refetchGroup } = useGroup(group.id);
    const { refetchGroups } = useGroups();
    const { updateGroup, loading } = useGroupApi();
    const { setToastData, setToastApiError } = useToast();
    const { uiConfig } = useUiConfig();

    const { users, setUsers, getGroupPayload } = useGroupForm(
        group.name,
        group.description,
        group.mappingsSSO,
        group.users
    );

    useEffect(() => {
        setUsers(group.users);
    }, [group.users, open, setUsers]);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        try {
            await updateGroup(group.id, getGroupPayload());
            refetchGroup();
            refetchGroups();
            setOpen(false);
            setToastData({
                title: 'Group users saved successfully',
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
    --data-raw '${JSON.stringify(getGroupPayload(), undefined, 2)}'`;
    };

    return (
        <SidebarModal
            open={open}
            onClose={() => {
                setOpen(false);
            }}
            label="Edit users"
        >
            <FormTemplate
                loading={loading}
                modal
                title="Edit users"
                description="Groups is the best and easiest way to organize users and then use them in projects to assign a specific role in one go to all the users in a group."
                documentationLink="https://docs.getunleash.io/advanced/groups"
                documentationLinkLabel="Groups documentation"
                formatApiCode={formatApiCode}
            >
                <StyledForm onSubmit={handleSubmit}>
                    <div>
                        <StyledInputDescription>
                            Edit users in this group
                        </StyledInputDescription>
                        <GroupFormUsersSelect
                            users={users}
                            setUsers={setUsers}
                        />
                        <GroupFormUsersTable
                            users={users}
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
