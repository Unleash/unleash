import FormTemplate from '../../../common/FormTemplate/FormTemplate';
import { useHistory } from 'react-router-dom';
import ApiTokenForm from '../ApiTokenForm/ApiTokenForm';
import useApiTokenForm from '../hooks/useApiTokenForm';
import useUiConfig from '../../../../hooks/api/getters/useUiConfig/useUiConfig';
import useToast from '../../../../hooks/useToast';
import useApiTokensApi from '../../../../hooks/api/actions/useApiTokensApi/useApiTokensApi';
import PermissionButton from '../../../common/PermissionButton/PermissionButton';
import { ADMIN } from '../../../providers/AccessProvider/permissions';
import ConfirmToken from '../ConfirmToken/ConfirmToken';
import { useState } from 'react';
import { scrollToTop } from '../../../common/util';

const CreateApiToken = () => {
    /* @ts-ignore */
    const { setToastApiError } = useToast();
    const { uiConfig } = useUiConfig();
    const history = useHistory();
    const [showConfirm, setShowConfirm] = useState(false);
    const [token, setToken] = useState('');

    const {
        getApiTokenPayload,
        username,
        type,
        project,
        environment,
        setUsername,
        setTokenType,
        setProject,
        setEnvironment,
        isValid,
        errors,
        clearErrors,
    } = useApiTokenForm();

    const { createToken, loading } = useApiTokensApi();

    const handleSubmit = async (e: Event) => {
        e.preventDefault();
        if (!isValid()) {
            return;
        }
        try {
            const payload = getApiTokenPayload();
            await createToken(payload)
                .then(res => res.json())
                .then(api => {
                    scrollToTop();
                    setToken(api.secret);
                    setShowConfirm(true);
                });
        } catch (e: any) {
            setToastApiError(e.toString());
        }
    };

    const closeConfirm = () => {
        setShowConfirm(false);
        history.push('/admin/api');
    };

    const formatApiCode = () => {
        return `curl --location --request POST '${
            uiConfig.unleashUrl
        }/api/admin/api-tokens' \\
--header 'Authorization: INSERT_API_KEY' \\
--header 'Content-Type: application/json' \\
--data-raw '${JSON.stringify(getApiTokenPayload(), undefined, 2)}'`;
    };

    const handleCancel = () => {
        history.goBack();
    };

    return (
        <FormTemplate
            loading={loading}
            title="Create Api Token"
            description="In order to connect to Unleash clients will need an API token to grant access. A client SDK will need to token with 'client privileges', which allows them to fetch feature toggle configuration and post usage metrics back."
            documentationLink="https://docs.getunleash.io/user_guide/api-token"
            formatApiCode={formatApiCode}
        >
            <ApiTokenForm
                username={username}
                type={type}
                project={project}
                environment={environment}
                setEnvironment={setEnvironment}
                setTokenType={setTokenType}
                setUsername={setUsername}
                setProject={setProject}
                errors={errors}
                handleSubmit={handleSubmit}
                handleCancel={handleCancel}
                mode="Create"
                clearErrors={clearErrors}
            >
                <PermissionButton
                    permission={ADMIN}
                    type="submit"
                >
                    Create token
                </PermissionButton>
            </ApiTokenForm>
            <ConfirmToken
                open={showConfirm}
                closeConfirm={closeConfirm}
                token={token}
            />
        </FormTemplate>
    );
};

export default CreateApiToken;
