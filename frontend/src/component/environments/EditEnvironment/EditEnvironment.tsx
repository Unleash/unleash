import FormTemplate from 'component/common/FormTemplate/FormTemplate';
import { UpdateButton } from 'component/common/UpdateButton/UpdateButton';
import useEnvironmentApi from 'hooks/api/actions/useEnvironmentApi/useEnvironmentApi';
import useEnvironment from 'hooks/api/getters/useEnvironment/useEnvironment';
import useProjectRolePermissions from 'hooks/api/getters/useProjectRolePermissions/useProjectRolePermissions';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import useToast from 'hooks/useToast';
import { useNavigate } from 'react-router-dom';
import { ADMIN } from 'component/providers/AccessProvider/permissions';
import EnvironmentForm from '../EnvironmentForm/EnvironmentForm';
import useEnvironmentForm from '../hooks/useEnvironmentForm';
import { formatUnknownError } from 'utils/formatUnknownError';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import { GO_BACK } from 'constants/navigate';

const EditEnvironment = () => {
    const { uiConfig } = useUiConfig();
    const { setToastData, setToastApiError } = useToast();
    const id = useRequiredPathParam('id');
    const { environment } = useEnvironment(id);
    const { updateEnvironment } = useEnvironmentApi();

    const navigate = useNavigate();
    const { name, type, setName, setType, errors, clearErrors } =
        useEnvironmentForm(environment.name, environment.type);
    const { refetch } = useProjectRolePermissions();

    const editPayload = () => {
        return {
            type,
            sortOrder: environment.sortOrder,
        };
    };

    const formatApiCode = () => {
        return `curl --location --request PUT '${
            uiConfig.unleashUrl
        }/api/admin/environments/update/${id}' \\
--header 'Authorization: INSERT_API_KEY' \\
--header 'Content-Type: application/json' \\
--data-raw '${JSON.stringify(editPayload(), undefined, 2)}'`;
    };

    const handleSubmit = async (e: Event) => {
        e.preventDefault();
        try {
            await updateEnvironment(id, editPayload());
            refetch();
            navigate('/environments');
            setToastData({
                type: 'success',
                title: 'Successfully updated environment.',
            });
        } catch (error: unknown) {
            setToastApiError(formatUnknownError(error));
        }
    };

    const handleCancel = () => {
        navigate(GO_BACK);
    };

    return (
        <FormTemplate
            title="Edit environment"
            description="Environments allow you to manage your
            product lifecycle from local development
            through production. Your projects and
            feature toggles are accessible in all your
            environments, but they can take different
            configurations per environment. This means
            that you can enable a feature toggle in a
            development or test environment without
            enabling the feature toggle in the
            production environment."
            documentationLink="https://docs.getunleash.io/user_guide/environments"
            documentationLinkLabel="Environments documentation"
            formatApiCode={formatApiCode}
        >
            <EnvironmentForm
                handleSubmit={handleSubmit}
                handleCancel={handleCancel}
                name={name}
                type={type}
                setName={setName}
                setType={setType}
                mode="Edit"
                errors={errors}
                clearErrors={clearErrors}
            >
                <UpdateButton permission={ADMIN} />
            </EnvironmentForm>
        </FormTemplate>
    );
};

export default EditEnvironment;
