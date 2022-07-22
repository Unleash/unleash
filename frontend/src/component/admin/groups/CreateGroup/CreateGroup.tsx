import FormTemplate from 'component/common/FormTemplate/FormTemplate';
import { useNavigate } from 'react-router-dom';
import { GroupForm } from '../GroupForm/GroupForm';
import { useGroupForm } from '../hooks/useGroupForm';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import useToast from 'hooks/useToast';
import { useGroupApi } from 'hooks/api/actions/useGroupApi/useGroupApi';
import { formatUnknownError } from 'utils/formatUnknownError';
import { UG_CREATE_BTN_ID } from 'utils/testIds';
import { Button } from '@mui/material';
import { CREATE } from 'constants/misc';

export const CreateGroup = () => {
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
    } = useGroupForm();

    const { createGroup, loading } = useGroupApi();

    const handleSubmit = async (e: Event) => {
        e.preventDefault();
        clearErrors();

        const payload = getGroupPayload();
        try {
            const group = await createGroup(payload);
            navigate(`/admin/groups/${group.id}`);
            setToastData({
                title: 'Group created successfully',
                text: 'Now you can start using your group.',
                confetti: true,
                type: 'success',
            });
        } catch (error: unknown) {
            setToastApiError(formatUnknownError(error));
        }
    };

    const formatApiCode = () => {
        return `curl --location --request POST '${
            uiConfig.unleashUrl
        }/api/admin/groups' \\
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
            title="Create group"
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
                mode={CREATE}
                clearErrors={clearErrors}
            >
                <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    data-testid={UG_CREATE_BTN_ID}
                >
                    Create group
                </Button>
            </GroupForm>
        </FormTemplate>
    );
};
