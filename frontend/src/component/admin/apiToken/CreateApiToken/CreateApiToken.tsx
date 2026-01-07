import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { styled } from '@mui/material';
import FormTemplate from 'component/common/FormTemplate/FormTemplate';
import ApiTokenForm from '../ApiTokenForm/ApiTokenForm.tsx';
import { CreateButton } from 'component/common/CreateButton/CreateButton';
import useApiTokensApi from 'hooks/api/actions/useApiTokensApi/useApiTokensApi';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import useToast from 'hooks/useToast';
import { useApiTokenForm } from 'component/admin/apiToken/ApiTokenForm/useApiTokenForm';
import { ConfirmToken } from '../ConfirmToken/ConfirmToken.tsx';
import { scrollToTop } from 'component/common/util';
import { formatUnknownError } from 'utils/formatUnknownError';
import { usePageTitle } from 'hooks/usePageTitle';
import { GO_BACK } from 'constants/navigate';
import { useApiTokens } from 'hooks/api/getters/useApiTokens/useApiTokens';
import { TokenInfo } from '../ApiTokenForm/TokenInfo/TokenInfo.tsx';
import { TokenTypeSelector } from '../ApiTokenForm/TokenTypeSelector/TokenTypeSelector.tsx';
import { ProjectSelector } from '../ApiTokenForm/ProjectSelector/ProjectSelector.tsx';
import { EnvironmentSelector } from '../ApiTokenForm/EnvironmentSelector/EnvironmentSelector.tsx';
import {
    ADMIN,
    CREATE_CLIENT_API_TOKEN,
    CREATE_FRONTEND_API_TOKEN,
} from '@server/types/permissions';
import { Limit } from 'component/common/Limit/Limit';

const pageTitle = 'Create API token';
interface ICreateApiTokenProps {
    modal?: boolean;
}

const StyledLimit = styled(Limit)(({ theme }) => ({
    margin: theme.spacing(2, 0, 4),
}));

const useApiTokenLimit = () => {
    const { tokens, loading: loadingTokens } = useApiTokens();
    const { uiConfig, loading: loadingConfig } = useUiConfig();
    const apiTokensLimit = uiConfig.resourceLimits.apiTokens;

    return {
        limit: apiTokensLimit,
        currentValue: tokens.length,
        limitReached: tokens.length >= apiTokensLimit,
        loading: loadingConfig || loadingTokens,
    };
};

export const CreateApiToken = ({ modal = false }: ICreateApiTokenProps) => {
    const { setToastApiError } = useToast();
    const { uiConfig } = useUiConfig();
    const navigate = useNavigate();
    const [showConfirm, setShowConfirm] = useState(false);
    const [token, setToken] = useState('');
    const {
        limit,
        currentValue,
        limitReached,
        loading: loadingLimit,
    } = useApiTokenLimit();

    const {
        getApiTokenPayload,
        tokenName,
        type,
        projects,
        environment,
        setTokenName,
        setTokenType,
        setProjects,
        setEnvironment,
        isValid,
        errors,
        clearErrors,
        apiTokenTypes,
    } = useApiTokenForm();

    const { createToken, loading: loadingCreateToken } = useApiTokensApi();
    const { refetch } = useApiTokens();

    usePageTitle(pageTitle);

    const PATH = `api/admin/api-tokens`;

    const handleSubmit = async (e: Event) => {
        e.preventDefault();
        if (!isValid()) {
            return;
        }
        try {
            const payload = getApiTokenPayload();

            await createToken(payload)
                .then((res) => res.json())
                .then((api) => {
                    scrollToTop();
                    setToken(api.secret);
                    setShowConfirm(true);
                    refetch();
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
            loading={loadingCreateToken}
            title={pageTitle}
            modal={modal}
            description='Unleash SDKs use API tokens to authenticate with the Unleash API. An SDK must be configured with a token of the corresponding type, so they can fetch feature flags and post usage metrics.'
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
                        permission={[
                            ADMIN,
                            CREATE_CLIENT_API_TOKEN,
                            CREATE_FRONTEND_API_TOKEN,
                        ]}
                        disabled={
                            limitReached || loadingLimit || loadingCreateToken
                        }
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
                <ProjectSelector
                    type={type}
                    projects={projects}
                    setProjects={setProjects}
                    errors={errors}
                    clearErrors={clearErrors}
                />
                <EnvironmentSelector
                    type={type}
                    environment={environment}
                    setEnvironment={setEnvironment}
                />
                <StyledLimit
                    name='API tokens'
                    shortName='tokens'
                    currentValue={currentValue}
                    limit={limit}
                />
            </ApiTokenForm>
            <ConfirmToken
                open={showConfirm}
                setOpen={setShowConfirm}
                closeConfirm={closeConfirm}
                token={token}
                type={type}
            />
        </FormTemplate>
    );
};
