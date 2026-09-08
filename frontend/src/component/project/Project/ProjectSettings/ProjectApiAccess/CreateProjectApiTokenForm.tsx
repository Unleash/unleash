import { useState } from 'react';
import { useNavigate } from 'react-router';
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
import { useTracking } from 'hooks/useTracking';
import {
    apiTokenCreatedTracking,
    apiTokenCreationProps,
} from 'component/common/ApiTokenTable/apiTokenTracking';

const pageTitle = 'Create project API token';

export const CreateProjectApiTokenForm = () => {
    const projectId = useRequiredPathParam('projectId');
    const { setToastApiError } = useToast();
    const { uiConfig } = useUiConfig();
    const navigate = useNavigate();
    const [showConfirm, setShowConfirm] = useState(false);
    const [token, setToken] = useState('');
    const [secure, setSecure] = useState(false);

    const {
        getApiTokenPayload,
        tokenName,
        type,
        apiTokenTypes,
        environment,
        setTokenName,
        setTokenType,
        setEnvironment,
        isValid,
        errors,
        clearErrors,
    } = useApiTokenForm(projectId);

    const { createToken: createProjectToken, loading } =
        useProjectApiTokensApi();
    const { refetch: refetchProjectTokens } = useProjectApiTokens(projectId);
    const { trackMutation, trackValidationFailed } = useTracking(
        apiTokenCreatedTracking,
    );

    usePageTitle(pageTitle);

    const PATH = `api/admin/projects/${projectId}/api-tokens`;
    const permission = CREATE_PROJECT_API_TOKEN;

    const handleSubmit = async (e: Event) => {
        e.preventDefault();

        if (!isValid()) {
            trackValidationFailed(apiTokenCreationProps(getApiTokenPayload()));
            return;
        }

        try {
            const payload = getApiTokenPayload();
            const api = await trackMutation(
                async () =>
                    (await createProjectToken(payload, projectId)).json(),
                apiTokenCreationProps(payload),
            );
            scrollToTop();
            setToken(api.secret);
            setSecure(api.secure);
            setShowConfirm(true);
            refetchProjectTokens();
        } catch (error: unknown) {
            setToastApiError(formatUnknownError(error));
        }
    };

    const closeConfirm = () => {
        setShowConfirm(false);
        navigate(GO_BACK);
    };

    const formatApiCode = () => {
        return `curl --location --request POST '${uiConfig.unleashUrl}/${PATH}' \\
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
            description="Unleash SDKs use API tokens to authenticate to the Unleash API. Client SDKs need a token with 'client privileges', which allows them to fetch feature flag configurations and post usage metrics."
            documentationLink='https://docs.getunleash.io/concepts/api-tokens-and-client-keys'
            documentationLinkLabel='API tokens documentation'
            formatApiCode={formatApiCode}
        >
            <ApiTokenForm
                handleSubmit={handleSubmit}
                handleCancel={handleCancel}
                mode='Create'
                actions={
                    <CreateButton
                        name='token'
                        permission={permission}
                        projectId={projectId}
                        disabled={loading}
                    />
                }
            >
                <TokenInfo
                    tokenName={tokenName}
                    setTokenName={setTokenName}
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
                setOpen={setShowConfirm}
                closeConfirm={closeConfirm}
                token={token}
                type={type}
                secure={secure}
            />
        </FormTemplate>
    );
};
