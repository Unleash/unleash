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
import { UG_SAVE_BTN_ID } from 'utils/testIds';
import { GO_BACK } from 'constants/navigate';
import { useGroups } from 'hooks/api/getters/useGroups/useGroups';

export const EditGroup = () => {
    const groupId = Number(useRequiredPathParam('groupId'));
    const { group, refetchGroup } = useGroup(groupId);
    const { refetchGroups } = useGroups();
    const { setToastData, setToastApiError } = useToast();
    const { uiConfig } = useUiConfig();
    const navigate = useNavigate();

    const {
        name,
        setName,
        description,
        setDescription,
        mappingsSSO,
        setMappingsSSO,
        users,
        setUsers,
        getGroupPayload,
        clearErrors,
        errors,
        setErrors,
    } = useGroupForm(
        group?.name,
        group?.description,
        group?.mappingsSSO,
        group?.users
    );

    const { groups } = useGroups();
    const { updateGroup, loading } = useGroupApi();

    const handleSubmit = async (e: Event) => {
        e.preventDefault();
        clearErrors();

        const payload = getGroupPayload();
        try {
            await updateGroup(groupId, payload);
            refetchGroup();
            refetchGroups();
            navigate(GO_BACK);
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
        navigate(GO_BACK);
    };

    const isNameEmpty = (name: string) => name.length;
    const isNameUnique = (name: string) =>
        !groups?.filter(group => group.name === name && group.id !== groupId)
            .length;
    const isValid = isNameEmpty(name) && isNameUnique(name);

    const onSetName = (name: string) => {
        clearErrors();
        if (!isNameUnique(name)) {
            setErrors({ name: 'A group with that name already exists.' });
        }
        setName(name);
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
                mappingsSSO={mappingsSSO}
                users={users}
                setName={onSetName}
                setDescription={setDescription}
                setMappingsSSO={setMappingsSSO}
                setUsers={setUsers}
                errors={errors}
                handleSubmit={handleSubmit}
                handleCancel={handleCancel}
                mode={EDIT}
            >
                <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    disabled={!isValid}
                    data-testid={UG_SAVE_BTN_ID}
                >
                    Save
                </Button>
            </GroupForm>
        </FormTemplate>
    );
};
