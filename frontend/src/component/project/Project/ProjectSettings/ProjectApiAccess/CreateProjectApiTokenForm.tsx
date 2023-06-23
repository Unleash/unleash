import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FormTemplate from 'component/common/FormTemplate/FormTemplate';

import { CreateButton } from 'component/common/CreateButton/CreateButton';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import useToast from 'hooks/useToast';
import { useApiTokenForm } from 'component/admin/apiToken/ApiTokenForm/useApiTokenForm';
import { CREATE_PROJECT_API_TOKEN } from 'component/providers/AccessProvider/permissions';
import { scrollToTop } from 'component/common/util';
import { formatUnknownError } from 'utils/formatUnknownError';
import { usePageTitle } from 'hooks/usePageTitle';
import { GO_BACK } from 'constants/navigate';
import useProjectApiTokensApi from 'hooks/api/actions/useProjectApiTokensApi/useProjectApiTokensApi';

import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import ApiTokenForm from 'component/admin/apiToken/ApiTokenForm/ApiTokenForm';
import { EnvironmentSelector } from 'component/admin/apiToken/ApiTokenForm/EnvironmentSelector/EnvironmentSelector';
import { TokenInfo } from 'component/admin/apiToken/ApiTokenForm/TokenInfo/TokenInfo';
import { TokenTypeSelector } from 'component/admin/apiToken/ApiTokenForm/TokenTypeSelector/TokenTypeSelector';
import { ConfirmToken } from 'component/admin/apiToken/ConfirmToken/ConfirmToken';
import { useProjectApiTokens } from 'hooks/api/getters/useProjectApiTokens/useProjectApiTokens';
import { usePlausibleTracker } from 'hooks/usePlausibleTracker';

const pageTitle = 'Create project API token';

export const CreateProjectApiTokenForm = () => {
    const projectId = useRequiredPathParam('projectId');
    const { setToastApiError } = useToast();
    const { uiConfig } = useUiConfig();
    const navigate = useNavigate();
    const [showConfirm, setShowConfirm] = useState(false);
    const [token, setToken] = useState('');

    const {
        getApiTokenPayload,
        username,
        type,
        apiTokenTypes,
        environment,
        setUsername,
        setTokenType,
        setEnvironment,
        isValid,
        errors,
        clearErrors,
    } = useApiTokenForm(projectId);

    const { createToken: createProjectToken, loading } =
        useProjectApiTokensApi();
    const { refetch: refetchProjectTokens } = useProjectApiTokens(projectId);
    const { trackEvent } = usePlausibleTracker();

    usePageTitle(pageTitle);

    const PATH = `api/admin/project/${projectId}/api-tokens`;
    const permission = CREATE_PROJECT_API_TOKEN;

    const handleSubmit = async (e: Event) => {
        e.preventDefault();
        if (!isValid()) {
            return;
        }
        try {
            const payload = getApiTokenPayload();

            await createProjectToken(payload, projectId)
                .then(res => res.json())
                .then(api => {
                    scrollToTop();
                    setToken(api.secret);
                    setShowConfirm(true);
                    trackEvent('project_api_tokens', {
                        props: { eventType: 'api_key_created' },
                    });

                    refetchProjectTokens();
                });
        } catch (error: unknown) {
            setToastApiError(formatUnknownError(error));
        }
    };

    const closeConfirm = () => {
        setShowConfirm(false);
        navigate(GO_BACK);
    };

    const formatApiCode = () => {
        return `curl --location --request POST '${
            uiConfig.unleashUrl
        }/${PATH}' \\
--header 'Authorization: INSERT_API_KEY' \\
--header 'Content-Type: application/json' \\
--data-raw '${JSON.stringify(getApiTokenPayload(), undefined, 2)}'`;
    };

    const handleCancel = () => {
        navigate(GO_BACK);
    };

    return (
        <FormTemplate
            loading={loading}
            title={pageTitle}
            modal
            description="Unleash SDKs use API tokens to authenticate to the Unleash API. Client SDKs need a token with 'client privileges', which allows them to fetch feature toggle configurations and post usage metrics."
            documentationLink="https://docs.getunleash.io/reference/api-tokens-and-client-keys"
            documentationLinkLabel="API tokens documentation"
            formatApiCode={formatApiCode}
        >
            <ApiTokenForm
                handleSubmit={handleSubmit}
                handleCancel={handleCancel}
                mode="Create"
                actions={
                    <CreateButton
                        name="token"
                        permission={permission}
                        projectId={projectId}
                    />
                }
            >
                <TokenInfo
                    username={username}
                    setUsername={setUsername}
                    errors={errors}
                    clearErrors={clearErrors}
                />
                <TokenTypeSelector
                    type={type}
                    setType={setTokenType}
                    apiTokenTypes={apiTokenTypes}
                />
                <EnvironmentSelector
                    type={type}
                    environment={environment}
                    setEnvironment={setEnvironment}
                />
            </ApiTokenForm>
            <ConfirmToken
                open={showConfirm}
                closeConfirm={closeConfirm}
                token={token}
                type={type}
            />
        </FormTemplate>
    );
};
