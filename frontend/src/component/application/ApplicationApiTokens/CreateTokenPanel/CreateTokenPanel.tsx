import { type FormEvent, useEffect, useState } from 'react';
import { Button, Radio, Typography } from '@mui/material';
import { DynamicSidebarModal } from 'component/common/SidebarModal/SidebarModal';
import Input from 'component/common/Input/Input';
import { Limit } from 'component/common/Limit/Limit';
import { useApiTokenForm } from 'component/admin/apiToken/ApiTokenForm/useApiTokenForm';
import { TokenTypeSelector } from 'component/admin/apiToken/ApiTokenForm/TokenTypeSelector/TokenTypeSelector';
import { ProjectSelector } from 'component/admin/apiToken/ApiTokenForm/ProjectSelector/ProjectSelector';
import {
    apiTokenCreationProps,
    createApiTokenTracking,
} from 'component/common/ApiTokenTable/apiTokenTracking';
import useApiTokensApi from 'hooks/api/actions/useApiTokensApi/useApiTokensApi';
import { useApiTokens } from 'hooks/api/getters/useApiTokens/useApiTokens';
import { useApplicationApiTokens } from 'hooks/api/getters/useApplicationApiTokens/useApplicationApiTokens';
import { useApiTokenLimit } from 'hooks/api/getters/useApiTokenLimit/useApiTokenLimit';
import { useEnvironments } from 'hooks/api/getters/useEnvironments/useEnvironments';
import useToast from 'hooks/useToast';
import { useTracking } from 'hooks/useTracking';
import { formatUnknownError } from 'utils/formatUnknownError';
import {
    StyledBody,
    StyledEnvironment,
    StyledEnvironments,
    StyledFooter,
    StyledHeader,
    StyledPanel,
    StyledSection,
} from './CreateTokenPanel.styles.ts';
import { TokenCreated } from './TokenCreated/TokenCreated.tsx';

interface ICreateTokenPanelProps {
    appName: string;
    preferredEnvironment?: string;
    onClose: () => void;
}

export const CreateTokenPanel = ({
    appName,
    preferredEnvironment,
    onClose,
}: ICreateTokenPanelProps) => {
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
    } = useApiTokenForm(undefined, preferredEnvironment);
    const { environments } = useEnvironments();
    const { refetch } = useApiTokens();
    const { refetch: refetchApplicationTokens } =
        useApplicationApiTokens(appName);
    const { limit, currentValue, limitReached } = useApiTokenLimit();
    const { createToken, loading } = useApiTokensApi();
    const { setToastApiError } = useToast();
    const trackCreateApiToken = useTracking(createApiTokenTracking);
    const [secret, setSecret] = useState<string>();

    // prefill with "<application>-<environment>" suggested name
    const [nameEdited, setNameEdited] = useState(false);
    useEffect(() => {
        if (!nameEdited && environment) {
            setTokenName(`${appName}-${environment}`);
        }
    }, [appName, environment, nameEdited, setTokenName]);

    const close = () => {
        if (!loading) {
            onClose();
        }
    };

    const onSubmit = async (event: FormEvent) => {
        event.preventDefault();
        const payload = { ...getApiTokenPayload(), appName };
        if (!isValid()) {
            trackCreateApiToken.validationFailed(
                apiTokenCreationProps(payload),
            );
            return;
        }
        try {
            const response = await trackCreateApiToken.mutation(
                async () => (await createToken(payload)).json(),
                apiTokenCreationProps(payload),
            );
            setSecret(response.secret);
            refetch();
            refetchApplicationTokens();
        } catch (error: unknown) {
            setToastApiError(formatUnknownError(error));
        }
    };

    return (
        <DynamicSidebarModal
            open
            onClose={close}
            label={secret ? 'Token created' : 'Create token'}
            tracking={secret || loading ? undefined : createApiTokenTracking}
        >
            {secret ? (
                <TokenCreated
                    appName={appName}
                    tokenName={tokenName}
                    type={type}
                    secret={secret}
                    onDone={onClose}
                />
            ) : (
                <StyledPanel as='form' onSubmit={onSubmit}>
                    <StyledHeader>
                        <Typography variant='h2'>Create token</Typography>
                        <Typography color='text.secondary'>
                            {appName}
                        </Typography>
                    </StyledHeader>
                    <StyledBody>
                        <Input
                            label='Token name'
                            description='Suggested from the application name and environment.'
                            value={tokenName}
                            onChange={(event) => {
                                setTokenName(event.target.value);
                                setNameEdited(true);
                                clearErrors('tokenName');
                            }}
                            error={Boolean(errors.tokenName)}
                            errorText={errors.tokenName}
                            autoFocus
                        />
                        <StyledSection>
                            <Typography id='token-environment'>
                                Environment
                            </Typography>
                            <StyledEnvironments
                                aria-labelledby='token-environment'
                                value={environment ?? ''}
                                onChange={(_, value) => setEnvironment(value)}
                            >
                                {environments
                                    .filter(({ enabled }) => enabled)
                                    .map(({ name }) => (
                                        <StyledEnvironment
                                            key={name}
                                            value={name}
                                            control={<Radio />}
                                            label={name}
                                        />
                                    ))}
                            </StyledEnvironments>
                        </StyledSection>
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
                        <Limit
                            name='Tokens'
                            shortName='tokens'
                            currentValue={currentValue}
                            limit={limit}
                        />
                    </StyledBody>
                    <StyledFooter>
                        <Button
                            disabled={loading}
                            onClick={() => {
                                trackCreateApiToken('dismissed', {
                                    method: 'cancel-button',
                                });
                                onClose();
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            type='submit'
                            variant='contained'
                            disabled={loading || limitReached}
                        >
                            Create token
                        </Button>
                    </StyledFooter>
                </StyledPanel>
            )}
        </DynamicSidebarModal>
    );
};
