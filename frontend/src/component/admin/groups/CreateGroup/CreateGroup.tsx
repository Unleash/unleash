import FormTemplate from 'component/common/FormTemplate/FormTemplate';
import { useNavigate } from 'react-router-dom';
import { GroupForm } from '../GroupForm/GroupForm.tsx';
import { useGroupForm } from '../hooks/useGroupForm.ts';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import useToast from 'hooks/useToast';
import { useGroupApi } from 'hooks/api/actions/useGroupApi/useGroupApi';
import { formatUnknownError } from 'utils/formatUnknownError';
import { UG_CREATE_BTN_ID } from 'utils/testIds';
import { Button } from '@mui/material';
import { CREATE } from 'constants/misc';
import { GO_BACK } from 'constants/navigate';
import { useGroups } from 'hooks/api/getters/useGroups/useGroups';

export const CreateGroup = () => {
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
        rootRole,
        setRootRole,
        getGroupPayload,
        clearErrors,
        errors,
        setErrors,
    } = useGroupForm();

    const { groups } = useGroups();
    const { createGroup, loading } = useGroupApi();

    const handleSubmit = async (e: Event) => {
        e.preventDefault();
        clearErrors();

        if (!isValid) return;

        const payload = getGroupPayload();
        try {
            const group = await createGroup(payload);
            navigate(`/admin/groups/${group.id}`);
            setToastData({
                text: 'Group created successfully',
                type: 'success',
            });
        } catch (error: unknown) {
            setToastApiError(formatUnknownError(error));
        }
    };

    const formatApiCode = () => {
        return `curl --location --request POST '${uiConfig.unleashUrl}/api/admin/groups' \\
    --header 'Authorization: INSERT_API_KEY' \\
    --header 'Content-Type: application/json' \\
    --data-raw '${JSON.stringify(getGroupPayload(), undefined, 2)}'`;
    };

    const handleCancel = () => {
        navigate(GO_BACK);
    };

    const isNameNotEmpty = (name: string) => name.length;
    const isNameUnique = (name: string) =>
        !groups?.filter((group) => group.name === name).length;
    const isValid = isNameNotEmpty(name) && isNameUnique(name);

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
            title='Create group'
            description='Groups is the best and easiest way to organize users and then use them in projects to assign a specific role in one go to all the users in a group.'
            documentationLink='https://docs.getunleash.io/reference/rbac#user-groups'
            documentationLinkLabel='Groups documentation'
            formatApiCode={formatApiCode}
        >
            <GroupForm
                name={name}
                description={description}
                mappingsSSO={mappingsSSO}
                rootRole={rootRole}
                users={users}
                setName={onSetName}
                setDescription={setDescription}
                setMappingsSSO={setMappingsSSO}
                setRootRole={setRootRole}
                setUsers={setUsers}
                errors={errors}
                handleSubmit={handleSubmit}
                handleCancel={handleCancel}
                mode={CREATE}
                isScimGroup={false}
            >
                <Button
                    type='submit'
                    variant='contained'
                    color='primary'
                    disabled={!isValid}
                    data-testid={UG_CREATE_BTN_ID}
                >
                    Create group
                </Button>
            </GroupForm>
        </FormTemplate>
    );
};
