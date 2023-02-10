import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FormTemplate from 'component/common/FormTemplate/FormTemplate';
import ApiTokenForm from '../ApiTokenForm/ApiTokenForm';
import { CreateButton } from 'component/common/CreateButton/CreateButton';
import useApiTokensApi from 'hooks/api/actions/useApiTokensApi/useApiTokensApi';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import useToast from 'hooks/useToast';
import { useApiTokenForm } from 'component/admin/apiToken/ApiTokenForm/useApiTokenForm';
import {
    ADMIN,
    CREATE_PROJECT_API_TOKEN,
} from 'component/providers/AccessProvider/permissions';
import { ConfirmToken } from '../ConfirmToken/ConfirmToken';
import { scrollToTop } from 'component/common/util';
import { formatUnknownError } from 'utils/formatUnknownError';
import { usePageTitle } from 'hooks/usePageTitle';
import { GO_BACK } from 'constants/navigate';
import { useApiTokens } from '../../../../hooks/api/getters/useApiTokens/useApiTokens';
import useProjectApiTokensApi from '../../../../hooks/api/actions/useProjectApiTokensApi/useProjectApiTokensApi';

const pageTitle = 'Create API token';

interface ICreateApiTokenProps {
    modal?: boolean;
    project?: string;
}
export const CreateApiToken = ({
    modal = false,
    project,
}: ICreateApiTokenProps) => {
    const { setToastApiError } = useToast();
    const { uiConfig } = useUiConfig();
    const navigate = useNavigate();
    const [showConfirm, setShowConfirm] = useState(false);
    const [token, setToken] = useState('');

    const {
        getApiTokenPayload,
        username,
        type,
        projects,
        environment,
        setUsername,
        setTokenType,
        setProjects,
        setEnvironment,
        isValid,
        errors,
        clearErrors,
    } = useApiTokenForm(project);

    const { createToken, loading: globalLoading } = useApiTokensApi();
    const { createToken: createProjectToken, loading: projectLoading } =
        useProjectApiTokensApi();
    const { refetch } = useApiTokens();

    usePageTitle(pageTitle);

    const PATH = Boolean(project)
        ? `api/admin/project/${project}/api-tokens`
        : 'api/admin/api-tokens';
    const permission = Boolean(project) ? CREATE_PROJECT_API_TOKEN : ADMIN;
    const scope = Boolean(project) ? 'project' : 'global';
    const loading = globalLoading || projectLoading;

    const handleSubmit = async (e: Event) => {
        e.preventDefault();
        if (!isValid()) {
            return;
        }
        try {
            const payload = getApiTokenPayload();
            if (Boolean(project)) {
                await createProjectToken(payload, project)
                    .then(res => res.json())
                    .then(api => {
                        scrollToTop();
                        setToken(api.secret);
                        setShowConfirm(true);
                    });
            } else {
                await createToken(payload)
                    .then(res => res.json())
                    .then(api => {
                        scrollToTop();
                        setToken(api.secret);
                        setShowConfirm(true);
                    });
            }
        } catch (error: unknown) {
            setToastApiError(formatUnknownError(error));
        }
    };

    const closeConfirm = () => {
        setShowConfirm(false);
        refetch();
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
            modal={modal}
            description="Unleash SDKs use API tokens to authenticate to the Unleash API. Client SDKs need a token with 'client privileges', which allows them to fetch feature toggle configurations and post usage metrics."
            documentationLink="https://docs.getunleash.io/reference/api-tokens-and-client-keys"
            documentationLinkLabel="API tokens documentation"
            formatApiCode={formatApiCode}
        >
            <ApiTokenForm
                username={username}
                type={type}
                scope={scope}
                projects={projects}
                environment={environment}
                setEnvironment={setEnvironment}
                setTokenType={setTokenType}
                setUsername={setUsername}
                setProjects={setProjects}
                errors={errors}
                handleSubmit={handleSubmit}
                handleCancel={handleCancel}
                mode="Create"
                clearErrors={clearErrors}
            >
                <CreateButton name="token" permission={permission} />
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
