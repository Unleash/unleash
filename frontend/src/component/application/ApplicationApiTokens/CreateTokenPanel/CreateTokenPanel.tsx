import { type FormEvent, useEffect, useState } from 'react';
import { Button, Checkbox, Radio, RadioGroup, Typography } from '@mui/material';
import { AutocompleteField } from 'component/common/AutocompleteField/AutocompleteField';
import { FormGroup } from 'component/common/FormGroup/FormGroup';
import { DynamicSidebarModal } from 'component/common/SidebarModal/SidebarModal';
import Input from 'component/common/Input/Input';
import { Limit } from 'component/common/Limit/Limit';
import { useApiTokenForm } from 'component/admin/apiToken/ApiTokenForm/useApiTokenForm';
import {
    apiTokenCreationProps,
    createApiTokenTracking,
} from 'component/common/ApiTokenTable/apiTokenTracking';
import useApiTokensApi from 'hooks/api/actions/useApiTokensApi/useApiTokensApi';
import { useApiTokens } from 'hooks/api/getters/useApiTokens/useApiTokens';
import { useApplicationApiTokens } from 'hooks/api/getters/useApplicationApiTokens/useApplicationApiTokens';
import { useApiTokenLimit } from 'hooks/api/getters/useApiTokenLimit/useApiTokenLimit';
import { useEnvironments } from 'hooks/api/getters/useEnvironments/useEnvironments';
import useProjects from 'hooks/api/getters/useProjects/useProjects';
import useToast from 'hooks/useToast';
import { useTracking } from 'hooks/useTracking';
import { formatUnknownError } from 'utils/formatUnknownError';
import type { TokenType } from 'interfaces/token';
import { ALL_PROJECTS } from '../../ApplicationOverviewPanels/buildApplicationEnvironments.ts';
import { isTokenExpired } from '../../isTokenExpired.ts';
import {
    StyledAppName,
    StyledBody,
    StyledEnvironment,
    StyledEnvironments,
    StyledFooter,
    StyledHeader,
    StyledOption,
    StyledOptionDescription,
    StyledOptionTitle,
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
    } = useApiTokenForm(undefined, preferredEnvironment, []);
    const { environments } = useEnvironments();
    const { refetch } = useApiTokens();
    const { tokens: applicationTokens, refetch: refetchApplicationTokens } =
        useApplicationApiTokens(appName);
    const { projects: availableProjects } = useProjects();
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

    const [projectsEdited, setProjectsEdited] = useState(false);
    const namedProjects = new Set(
        applicationTokens
            .filter((token) => !isTokenExpired(token))
            .flatMap((token) => token.projects),
    );
    const suggestedProjects = availableProjects
        .map((project) => project.id)
        .filter((id) => namedProjects.has(id))
        .join(',');
    useEffect(() => {
        if (!projectsEdited) {
            setProjects(suggestedProjects ? suggestedProjects.split(',') : []);
        }
    }, [projectsEdited, suggestedProjects, setProjects]);

    const allProjects = projects.includes(ALL_PROJECTS);
    // the picks to bring back when "all projects" is unticked
    const [pickedProjects, setPickedProjects] = useState<string[]>([]);
    const changeProjects = (newProjects: string[]) => {
        setProjectsEdited(true);
        setProjects(newProjects);
        clearErrors('projects');
    };

    const nameHint = nameEdited
        ? undefined
        : 'Suggested from the application name and environment.';
    const projectsHint =
        !projectsEdited && suggestedProjects
            ? "Pre-selected from this application's other tokens."
            : undefined;

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
                            Linked to application{' '}
                            <StyledAppName>{appName}</StyledAppName>
                        </Typography>
                    </StyledHeader>
                    <StyledBody>
                        <Input
                            label='Token name'
                            value={tokenName}
                            onChange={(event) => {
                                setTokenName(event.target.value);
                                setNameEdited(true);
                                clearErrors('tokenName');
                            }}
                            error={Boolean(errors.tokenName)}
                            errorText={errors.tokenName ?? nameHint}
                            autoFocus
                        />
                        <FormGroup variant='nested' title='Environment'>
                            <StyledEnvironments
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
                        </FormGroup>
                        <FormGroup variant='nested' title='Token type'>
                            <RadioGroup
                                value={type}
                                onChange={(_, value) => {
                                    setTokenType(value as TokenType);
                                    // the form resets the projects on a type change
                                    setProjects(projects);
                                }}
                            >
                                {apiTokenTypes.map(
                                    ({ key, label, title, enabled }) => (
                                        <StyledOption
                                            key={key}
                                            value={key}
                                            disabled={!enabled}
                                            control={<Radio />}
                                            label={
                                                <>
                                                    <StyledOptionTitle>
                                                        {label}
                                                    </StyledOptionTitle>
                                                    <StyledOptionDescription>
                                                        {title}
                                                    </StyledOptionDescription>
                                                </>
                                            }
                                        />
                                    ),
                                )}
                            </RadioGroup>
                        </FormGroup>
                        <StyledSection>
                            <AutocompleteField
                                label='Projects'
                                placeholder={
                                    projects.length > 0
                                        ? undefined
                                        : 'Select one or more projects'
                                }
                                multiple
                                disableCloseOnSelect
                                disabled={allProjects}
                                options={availableProjects}
                                getOptionLabel={(project) => project.name}
                                value={availableProjects.filter((project) =>
                                    projects.includes(project.id),
                                )}
                                onChange={(_, selected) =>
                                    changeProjects(
                                        selected.map((project) => project.id),
                                    )
                                }
                                error={Boolean(errors.projects)}
                                helperText={errors.projects ?? projectsHint}
                            />
                            <StyledOption
                                control={
                                    <Checkbox
                                        checked={allProjects}
                                        onChange={(_, checked) => {
                                            if (checked) {
                                                setPickedProjects(projects);
                                                changeProjects([ALL_PROJECTS]);
                                            } else {
                                                changeProjects(pickedProjects);
                                            }
                                        }}
                                    />
                                }
                                label={
                                    <>
                                        All current and future projects
                                        <StyledOptionDescription>
                                            Turns off the project picker. Use
                                            only when this application really
                                            needs every project.
                                        </StyledOptionDescription>
                                    </>
                                }
                            />
                        </StyledSection>
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
