import FormTemplate from 'component/common/FormTemplate/FormTemplate';
import { useNavigate } from 'react-router-dom';
import { GroupForm } from '../GroupForm/GroupForm';
import { useGroupForm } from '../hooks/useGroupForm';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import useToast from 'hooks/useToast';
import { useGroupApi } from 'hooks/api/actions/useGroupApi/useGroupApi';
import { formatUnknownError } from 'utils/formatUnknownError';
import { Button } from '@mui/material';
import { EDIT } from 'constants/misc';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import { useGroup } from 'hooks/api/getters/useGroup/useGroup';

export const EditGroup = () => {
    const groupId = Number(useRequiredPathParam('groupId'));
    const { group, refetchGroup } = useGroup(groupId);
    const { setToastData, setToastApiError } = useToast();
    const { uiConfig } = useUiConfig();
    const navigate = useNavigate();

    const {
        name,
        setName,
        description,
        setDescription,
        users,
        setUsers,
        getGroupPayload,
        clearErrors,
        errors,
    } = useGroupForm(group?.name, group?.description, group?.users);

    const { updateGroup, loading } = useGroupApi();

    const handleSubmit = async (e: Event) => {
        e.preventDefault();
        clearErrors();

        const payload = getGroupPayload();
        try {
            await updateGroup(groupId, payload);
            refetchGroup();
            navigate(-1);
            setToastData({
                title: 'Group updated successfully',
                type: 'success',
            });
        } catch (error: unknown) {
            setToastApiError(formatUnknownError(error));
        }
    };

    const formatApiCode = () => {
        return `curl --location --request PUT '${
            uiConfig.unleashUrl
        }/api/admin/groups/${groupId}' \\
    --header 'Authorization: INSERT_API_KEY' \\
    --header 'Content-Type: application/json' \\
    --data-raw '${JSON.stringify(getGroupPayload(), undefined, 2)}'`;
    };

    const handleCancel = () => {
        navigate(-1);
    };

    return (
        <FormTemplate
            loading={loading}
            title="Edit group"
            description="Groups is the best and easiest way to organize users and then use them in projects to assign a specific role in one go to all the users in a group."
            documentationLink="https://docs.getunleash.io/advanced/groups"
            documentationLinkLabel="Groups documentation"
            formatApiCode={formatApiCode}
        >
            <GroupForm
                name={name}
                description={description}
                users={users}
                setName={setName}
                setDescription={setDescription}
                setUsers={setUsers}
                errors={errors}
                handleSubmit={handleSubmit}
                handleCancel={handleCancel}
                mode={EDIT}
                clearErrors={clearErrors}
            >
                <Button type="submit" variant="contained" color="primary">
                    Save
                </Button>
            </GroupForm>
        </FormTemplate>
    );
};
