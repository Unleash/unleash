import { useNavigate } from 'react-router-dom';
import useEnvironmentForm from '../hooks/useEnvironmentForm.ts';
import EnvironmentForm from '../EnvironmentForm/EnvironmentForm.tsx';
import FormTemplate from 'component/common/FormTemplate/FormTemplate';
import { CreateButton } from 'component/common/CreateButton/CreateButton';
import useEnvironmentApi from 'hooks/api/actions/useEnvironmentApi/useEnvironmentApi';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import useToast from 'hooks/useToast';
import { useEnvironments } from 'hooks/api/getters/useEnvironments/useEnvironments';
import usePermissions from 'hooks/api/getters/usePermissions/usePermissions';
import { ADMIN } from 'component/providers/AccessProvider/permissions';
import { formatUnknownError } from 'utils/formatUnknownError';
import { GO_BACK } from 'constants/navigate';
import { Limit } from 'component/common/Limit/Limit';

const CreateEnvironment = () => {
    const { setToastApiError, setToastData } = useToast();
    const { uiConfig } = useUiConfig();
    const environmentLimit = uiConfig.resourceLimits.environments;
    const navigate = useNavigate();
    const { environments } = useEnvironments();
    const canCreateMoreEnvs = environments.length < environmentLimit;
    const { createEnvironment, loading } = useEnvironmentApi();
    const { refetch } = usePermissions();
    const {
        name,
        setName,
        type,
        setType,
        requiredApprovals,
        setRequiredApprovals,
        getEnvPayload,
        validateEnvironmentName,
        clearErrors,
        errors,
    } = useEnvironmentForm();

    const handleSubmit = async (e: Event) => {
        e.preventDefault();
        clearErrors();
            const payload = getEnvPayload();
            try {
                await createEnvironment(payload);
                refetch();
                setToastData({
                    text: 'Environment created',
                    type: 'success',
                });
                navigate('/environments');
            } catch (error: unknown) {
                setToastApiError(formatUnknownError(error));
            }
    };

    const formatApiCode = () => {
        return `curl --location --request POST '${uiConfig.unleashUrl}/api/admin/environments' \\
--header 'Authorization: INSERT_API_KEY' \\
--header 'Content-Type: application/json' \\
--data-raw '${JSON.stringify(getEnvPayload(), undefined, 2)}'`;
    };

    const handleCancel = () => {
        navigate(GO_BACK);
    };

    return (
        <FormTemplate
            loading={loading}
            title='Create environment'
            description='Environments allow you to manage your
                            product lifecycle from local development
                            through production. Your projects and
                            feature flags are accessible in all your
                            environments, but they can take different
                            configurations per environment. This means
                            that you can enable a feature flag in a
                            development or test environment without
                            enabling the feature flag in the
                            production environment.'
            documentationLink='https://docs.getunleash.io/concepts/environments'
            documentationLinkLabel='Environments documentation'
            formatApiCode={formatApiCode}
        >
            <EnvironmentForm
                errors={errors}
                handleSubmit={handleSubmit}
                handleCancel={handleCancel}
                validateEnvironmentName={validateEnvironmentName}
                name={name}
                type={type}
                setName={setName}
                setType={setType}
                requiredApprovals={requiredApprovals}
                setRequiredApprovals={setRequiredApprovals}
                mode='Create'
                clearErrors={clearErrors}
                Limit={
                    <Limit
                        name='environments'
                        limit={environmentLimit}
                        currentValue={environments.length}
                    />
                }
            >
                <CreateButton
                    name='environment'
                    permission={ADMIN}
                    disabled={!canCreateMoreEnvs}
                />
            </EnvironmentForm>
        </FormTemplate>
    );
};

export default CreateEnvironment;
