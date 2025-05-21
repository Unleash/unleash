import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { styled } from '@mui/material';
import FormTemplate from 'component/common/FormTemplate/FormTemplate';
import ApiTokenForm from '../../apiToken/ApiTokenForm/ApiTokenForm.tsx';
import { CreateButton } from 'component/common/CreateButton/CreateButton';
import {useCdnTokensApi} from 'hooks/api/actions/useCdnTokensApi/useCdnTokensApi';
import useToast from 'hooks/useToast';
import { ConfirmToken } from '../ConfirmToken/ConfirmToken.tsx';
import { scrollToTop } from 'component/common/util';
import { formatUnknownError } from 'utils/formatUnknownError';
import { usePageTitle } from 'hooks/usePageTitle';
import { GO_BACK } from 'constants/navigate';
import { useApiTokens } from 'hooks/api/getters/useApiTokens/useApiTokens';
import { TokenInfo } from '../../apiToken/ApiTokenForm/TokenInfo/TokenInfo.tsx';
import { ProjectSelector } from '../../apiToken/ApiTokenForm/ProjectSelector/ProjectSelector.tsx';
import { EnvironmentSelector } from '../../apiToken/ApiTokenForm/EnvironmentSelector/EnvironmentSelector.tsx';
import { ADMIN } from '@server/types/permissions';
import { Limit } from 'component/common/Limit/Limit';
import { useCdnTokenForm } from '../useCdnTokenForm.ts';
import { TokenType } from 'interfaces/token.ts';

const pageTitle = 'Create CDN token';
interface ICreateApiTokenProps {
    modal?: boolean;
}

const StyledLimit = styled(Limit)(({ theme }) => ({
    margin: theme.spacing(2, 0, 4),
}));

// const useApiTokenLimit = () => {
//     const { tokens, loading: loadingTokens } = useApiTokens();
//     const { uiConfig, loading: loadingConfig } = useUiConfig();
//     const apiTokensLimit = uiConfig.resourceLimits.apiTokens;

//     return {
//         limit: apiTokensLimit,
//         currentValue: tokens.length,
//         limitReached: tokens.length >= apiTokensLimit,
//         loading: loadingConfig || loadingTokens,
//     };
// };

export const CreateCdnToken = ({ modal = false }: ICreateApiTokenProps) => {
    const { setToastApiError, setToastData } = useToast();
    const navigate = useNavigate();
    const [showConfirm, setShowConfirm] = useState(false);
    const [token, setToken] = useState('');
    // const {
    //     limit,
    //     currentValue,
    //     limitReached,
    //     loading: loadingLimit,
    // } = useApiTokenLimit();

    const {
        getApiTokenPayload,
        tokenName,
        projects,
        environment,
        setTokenName,
        setProjects,
        setEnvironment,
        isValid,
        errors,
        clearErrors,
    } = useCdnTokenForm();

    const { createToken, loading: loadingCreateToken } = useCdnTokensApi();
    const { refetch } = useApiTokens();

    usePageTitle(pageTitle);

    const PATH = `/admin/cdn`;

    const handleSubmit = async (e: Event) => {
        e.preventDefault();
        if (!isValid()) {
            return;
        }
        try {
            const payload = getApiTokenPayload();

            await createToken(payload)
                .then(() => {
                    scrollToTop();
                    setToastData({
                        type: 'success',
                        text: `CDN token created successfully`,
                    })
                    navigate(PATH)
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

    //     const formatApiCode = () => {
    //         return `curl --location --request POST '${uiConfig.unleashUrl}/${PATH}' \\
    // --header 'Authorization: INSERT_API_KEY' \\
    // --header 'Content-Type: application/json' \\
    // --data-raw '${JSON.stringify(getApiTokenPayload(), undefined, 2)}'`;
    //     };

    const handleCancel = () => {
        navigate(GO_BACK);
    };

    return (
        <FormTemplate
            loading={loadingCreateToken}
            title={pageTitle}
            modal={modal}
            description='Unleash CDN tokens'
            // FIXME: description, link and request code
            documentationLink='https://docs.getunleash.io/reference/api-tokens-and-client-keys'
            documentationLinkLabel='API tokens documentation'
            // formatApiCode={formatApiCode}
        >
            <ApiTokenForm
                handleSubmit={handleSubmit}
                handleCancel={handleCancel}
                mode='Create'
                actions={
                    <CreateButton
                        name='token'
                        permission={[ADMIN]}
                        disabled={loadingCreateToken}
                        // limitReached || loadingLimit || loadingCreateToken
                    />
                }
            >
                <TokenInfo
                    tokenName={tokenName}
                    setTokenName={setTokenName}
                    errors={errors}
                    clearErrors={clearErrors}
                />
                <ProjectSelector
                    type={TokenType.CDN}
                    projects={projects}
                    setProjects={setProjects}
                    errors={errors}
                    clearErrors={clearErrors}
                />
                <EnvironmentSelector
                    type={TokenType.CDN}
                    environment={environment}
                    setEnvironment={setEnvironment}
                />
                {/* FIXME: limit */}
                {/* <StyledLimit
                    name='API tokens'
                    shortName='tokens'
                    currentValue={currentValue}
                    limit={limit}
                /> */}
            </ApiTokenForm>
            <ConfirmToken
                open={showConfirm}
                setOpen={setShowConfirm}
                closeConfirm={closeConfirm}
                token={token}
                type={TokenType.CDN}
            />
        </FormTemplate>
    );
};
