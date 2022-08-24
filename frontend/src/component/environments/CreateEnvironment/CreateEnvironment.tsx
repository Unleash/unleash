import { useNavigate } from 'react-router-dom';
import useEnvironmentForm from '../hooks/useEnvironmentForm';
import EnvironmentForm from '../EnvironmentForm/EnvironmentForm';
import FormTemplate from 'component/common/FormTemplate/FormTemplate';
import { Alert } from '@mui/material';
import { Button } from '@mui/material';
import { CreateButton } from 'component/common/CreateButton/CreateButton';
import useEnvironmentApi from 'hooks/api/actions/useEnvironmentApi/useEnvironmentApi';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import useToast from 'hooks/useToast';
import { useEnvironments } from 'hooks/api/getters/useEnvironments/useEnvironments';
import useProjectRolePermissions from 'hooks/api/getters/useProjectRolePermissions/useProjectRolePermissions';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { PageContent } from 'component/common/PageContent/PageContent';
import { ADMIN } from 'component/providers/AccessProvider/permissions';
import { PageHeader } from 'component/common/PageHeader/PageHeader';
import { formatUnknownError } from 'utils/formatUnknownError';
import { GO_BACK } from 'constants/navigate';

const CreateEnvironment = () => {
    const { setToastApiError, setToastData } = useToast();
    const { uiConfig } = useUiConfig();
    const navigate = useNavigate();
    const { environments } = useEnvironments();
    const canCreateMoreEnvs = environments.length < 7;
    const { createEnvironment, loading } = useEnvironmentApi();
    const { refetch } = useProjectRolePermissions();
    const {
        name,
        setName,
        type,
        setType,
        getEnvPayload,
        validateEnvironmentName,
        clearErrors,
        errors,
    } = useEnvironmentForm();

    const handleSubmit = async (e: Event) => {
        e.preventDefault();
        clearErrors();
        const validName = await validateEnvironmentName();
        if (validName) {
            const payload = getEnvPayload();
            try {
                await createEnvironment(payload);
                refetch();
                setToastData({
                    title: 'Environment created',
                    type: 'success',
                    confetti: true,
                });
                navigate('/environments');
            } catch (error: unknown) {
                setToastApiError(formatUnknownError(error));
            }
        }
    };

    const formatApiCode = () => {
        return `curl --location --request POST '${
            uiConfig.unleashUrl
        }/api/admin/environments' \\
--header 'Authorization: INSERT_API_KEY' \\
--header 'Content-Type: application/json' \\
--data-raw '${JSON.stringify(getEnvPayload(), undefined, 2)}'`;
    };

    const handleCancel = () => {
        navigate(GO_BACK);
    };

    return (
        <ConditionallyRender
            condition={canCreateMoreEnvs}
            show={
                <FormTemplate
                    loading={loading}
                    title="Create environment"
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
                        errors={errors}
                        handleSubmit={handleSubmit}
                        handleCancel={handleCancel}
                        validateEnvironmentName={validateEnvironmentName}
                        name={name}
                        type={type}
                        setName={setName}
                        setType={setType}
                        mode="Create"
                        clearErrors={clearErrors}
                    >
                        <CreateButton name="environment" permission={ADMIN} />
                    </EnvironmentForm>
                </FormTemplate>
            }
            elseShow={
                <>
                    <PageContent
                        header={<PageHeader title="Create environment" />}
                    >
                        <Alert severity="error">
                            <p>
                                Currently Unleash does not support more than 7
                                environments. If you need more please reach out.
                            </p>
                        </Alert>
                        <br />
                        <Button
                            onClick={handleCancel}
                            variant="contained"
                            color="primary"
                        >
                            Go back
                        </Button>
                    </PageContent>
                </>
            }
        />
    );
};

export default CreateEnvironment;
