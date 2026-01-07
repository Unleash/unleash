import { type FC, type FormEventHandler, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Alert, Box, Paper, styled, useTheme } from '@mui/material';
import { PageContent } from 'component/common/PageContent/PageContent';
import { PageHeader } from 'component/common/PageHeader/PageHeader';
import useToast from 'hooks/useToast';
import { formatUnknownError } from 'utils/formatUnknownError';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { usePlaygroundApi } from 'hooks/api/actions/usePlayground/usePlayground';
import { useEnvironments } from 'hooks/api/getters/useEnvironments/useEnvironments';
import { PlaygroundForm } from './PlaygroundForm/PlaygroundForm.tsx';
import {
    resolveDefaultEnvironment,
    resolveEnvironments,
    resolveProjects,
    resolveResultsWidth,
} from './playground.utils';
import { PlaygroundGuidance } from './PlaygroundGuidance/PlaygroundGuidance.tsx';
import { PlaygroundGuidancePopper } from './PlaygroundGuidancePopper/PlaygroundGuidancePopper.tsx';
import Loader from 'component/common/Loader/Loader';
import { AdvancedPlaygroundResultsTable } from './AdvancedPlaygroundResultsTable/AdvancedPlaygroundResultsTable.tsx';
import type { AdvancedPlaygroundResponseSchema } from 'openapi';
import { createLocalStorage } from 'utils/createLocalStorage';
import { BadRequestError } from 'utils/apiUtils';
import { usePlausibleTracker } from 'hooks/usePlausibleTracker';

const StyledAlert = styled(Alert)(({ theme }) => ({
    marginBottom: theme.spacing(3),
}));

const GenerateWarningMessages: React.FC<{
    response?: AdvancedPlaygroundResponseSchema;
}> = ({ response }) => {
    const invalidContextProperties =
        response?.warnings?.invalidContextProperties;

    if (invalidContextProperties && invalidContextProperties.length > 0) {
        invalidContextProperties.sort();
        const summary =
            'Some context properties were not taken into account during evaluation';

        const StyledDetails = styled('details')(({ theme }) => ({
            '* + *': { marginBlockStart: theme.spacing(1) },
        }));

        return (
            <StyledAlert severity='warning'>
                <StyledDetails>
                    <summary>{summary}</summary>
                    <p>
                        The context you provided for this query contained
                        top-level properties with invalid values. These
                        properties were not taken into consideration when
                        evaluating your query. The properties are:
                    </p>
                    <ul>
                        {invalidContextProperties.map((prop) => (
                            <li
                                key={prop}
                                data-testid='context-warning-list-element'
                            >
                                <code>{prop}</code>
                            </li>
                        ))}
                    </ul>

                    <p>
                        Remember that context fields (with the exception of the{' '}
                        <code>properties</code> object) must be strings.
                    </p>
                    <p>
                        Because we didn't take these properties into account
                        during the feature flag evaluation, they will not appear
                        in the results table.
                    </p>
                </StyledDetails>
            </StyledAlert>
        );
    } else {
        return null;
    }
};

export const AdvancedPlayground: FC<{
    FormComponent?: typeof PlaygroundForm;
}> = ({ FormComponent = PlaygroundForm }) => {
    const defaultSettings: {
        projects: string[];
        environments: string[];
        context?: string;
        token?: string;
    } = { projects: [], environments: [] };
    const { value, setValue } = createLocalStorage(
        'AdvancedPlayground:v1',
        defaultSettings,
    );
    const { trackEvent } = usePlausibleTracker();

    const { environments: availableEnvironments } = useEnvironments();
    const theme = useTheme();
    const matches = true;

    const [configurationError, setConfigurationError] = useState<string>();
    const [environments, setEnvironments] = useState<string[]>(
        value.environments,
    );
    const [projects, setProjects] = useState<string[]>(value.projects);
    const [token, setToken] = useState<string | undefined>(value.token);
    const [context, setContext] = useState<string | undefined>(value.context);
    const [results, setResults] = useState<
        AdvancedPlaygroundResponseSchema | undefined
    >();
    const { setToastData } = useToast();
    const [searchParams, setSearchParams] = useSearchParams();
    const [changeRequest, setChangeRequest] = useState<string>();
    const {
        evaluateAdvancedPlayground,
        evaluateChangeRequestPlayground,
        loading,
        errors,
    } = usePlaygroundApi();
    const [hasFormBeenSubmitted, setHasFormBeenSubmitted] = useState(false);

    useEffect(() => {
        if (environments?.length === 0 && availableEnvironments.length > 0) {
            setEnvironments([resolveDefaultEnvironment(availableEnvironments)]);
        }
    }, [JSON.stringify(environments), JSON.stringify(availableEnvironments)]);

    useEffect(() => {
        loadInitialValuesFromUrl();
    }, []);

    const loadInitialValuesFromUrl = async () => {
        try {
            const environments = resolveEnvironmentsFromUrl();
            const projects = resolveProjectsFromUrl();
            const context = resolveContextFromUrl();
            resolveTokenFromUrl();
            resolveChangeRequestFromUrl();
            // TODO: Add support for changeRequest

            if (environments && context) {
                await evaluatePlaygroundContext(
                    environments || [],
                    projects || '*',
                    context,
                );
            }
        } catch (error) {
            setToastData({
                type: 'error',
                text: `Failed to parse URL parameters: ${formatUnknownError(
                    error,
                )}`,
            });
        }
    };

    const resolveEnvironmentsFromUrl = (): string[] | null => {
        let environmentArray: string[] | null = null;
        const environmentsFromUrl = searchParams.get('environments');
        if (environmentsFromUrl) {
            environmentArray = environmentsFromUrl.split(',');
            setEnvironments(environmentArray);
        }
        return environmentArray;
    };
    const resolveProjectsFromUrl = (): string[] | null => {
        let projectsArray: string[] | null = null;
        const projectsFromUrl = searchParams.get('projects');
        if (projectsFromUrl) {
            projectsArray = projectsFromUrl.split(',');
            setProjects(projectsArray);
        }
        return projectsArray;
    };
    const resolveContextFromUrl = () => {
        let contextFromUrl = searchParams.get('context');
        if (contextFromUrl) {
            contextFromUrl = decodeURI(contextFromUrl);
            setContext(contextFromUrl);
        }
        return contextFromUrl;
    };

    const resolveTokenFromUrl = () => {
        let tokenFromUrl = searchParams.get('token');
        if (tokenFromUrl) {
            tokenFromUrl = decodeURI(tokenFromUrl);
            setToken(tokenFromUrl);
        }
        return tokenFromUrl;
    };

    const resolveChangeRequestFromUrl = () => {
        const changeRequestFromUrl = searchParams.get('changeRequest');
        if (changeRequestFromUrl) {
            setChangeRequest(changeRequestFromUrl);
        }
    };

    const evaluatePlaygroundContext = async (
        environments: string[] | string,
        projects: string[] | string,
        context: string | undefined,
        action?: () => void,
    ) => {
        try {
            setConfigurationError(undefined);
            const parsedContext = {
                appName: 'playground',
                ...JSON.parse(context || '{}'),
            };

            const response = changeRequest
                ? await evaluateChangeRequestPlayground(changeRequest, {
                      context: parsedContext,
                  })
                : await evaluateAdvancedPlayground({
                      environments: resolveEnvironments(environments),
                      projects: resolveProjects(projects),
                      context: parsedContext,
                  });

            if (action && typeof action === 'function') {
                action();
            }
            setResults(response);
        } catch (error: unknown) {
            if (error instanceof BadRequestError) {
                setConfigurationError(error.message);
            } else if (error instanceof SyntaxError) {
                setToastData({
                    type: 'error',
                    text: `Error parsing context: ${formatUnknownError(error)}`,
                });
            } else {
                setToastData({
                    type: 'error',
                    text: formatUnknownError(error),
                });
            }
        }
    };

    const trackTryConfiguration = () => {
        let mode: 'default' | 'api_token' | 'change_request' = 'default';
        if (token && token !== '') {
            mode = 'api_token';
        } else if (changeRequest) {
            mode = 'change_request';
        }
        trackEvent('playground', {
            props: {
                eventType: 'try-configuration',
                mode,
            },
        });
    };

    const onSubmit: FormEventHandler<HTMLFormElement> = async (event) => {
        event.preventDefault();

        setHasFormBeenSubmitted(true);

        trackTryConfiguration();

        await evaluatePlaygroundContext(environments, projects, context, () => {
            setURLParameters();
            if (!changeRequest) {
                setValue({
                    environments,
                    projects,
                    context,
                });
            }
        });
    };

    const onClearChangeRequest = () => {
        setChangeRequest(undefined);
    };

    const setURLParameters = () => {
        searchParams.set('context', encodeURI(context || '')); // always set because of native validation
        if (
            Array.isArray(environments) &&
            environments.length > 0 &&
            !(environments.length === 1 && environments[0] === '*')
        ) {
            searchParams.set('environments', environments.join(','));
        } else {
            searchParams.delete('projects');
        }
        if (
            Array.isArray(projects) &&
            projects.length > 0 &&
            !(projects.length === 1 && projects[0] === '*')
        ) {
            searchParams.set('projects', projects.join(','));
        } else {
            searchParams.delete('projects');
        }
        if (changeRequest) {
            searchParams.set('changeRequest', changeRequest);
        } else {
            searchParams.delete('changeRequest');
        }
        setSearchParams(searchParams);
    };

    const formWidth = results && !matches ? '35%' : 'auto';
    const resultsWidth = resolveResultsWidth(matches, results);

    return (
        <PageContent
            header={
                <PageHeader
                    title='Unleash playground'
                    actions={<PlaygroundGuidancePopper />}
                />
            }
            disableLoading
            bodyClass={'no-padding'}
        >
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: !matches ? 'row' : 'column',
                }}
            >
                <Box
                    sx={{
                        background: theme.palette.background.elevation2,
                        borderBottomLeftRadius: theme.shape.borderRadiusMedium,
                        isolation: 'isolate',
                        zIndex: 2,
                    }}
                >
                    <Paper
                        elevation={0}
                        sx={{
                            px: 4,
                            py: 3,
                            background: theme.palette.background.elevation2,
                            transition: 'width 0.4s ease',
                            minWidth: matches ? 'auto' : '500px',
                            width: formWidth,
                            position: 'sticky',
                            top: 0,
                        }}
                    >
                        <FormComponent
                            onSubmit={onSubmit}
                            context={context}
                            setContext={setContext}
                            availableEnvironments={availableEnvironments}
                            projects={projects}
                            environments={environments}
                            token={token}
                            setToken={setToken}
                            setProjects={setProjects}
                            setEnvironments={setEnvironments}
                            changeRequest={changeRequest || undefined}
                            onClearChangeRequest={onClearChangeRequest}
                        />
                    </Paper>
                </Box>
                <Box
                    sx={(theme) => ({
                        width: resultsWidth,
                        transition: 'width 0.4s ease',
                        padding: theme.spacing(4, 4),
                        isolation: 'isolate',
                        zIndex: 1,
                    })}
                >
                    <ConditionallyRender
                        condition={Boolean(configurationError)}
                        show={
                            <StyledAlert severity='warning'>
                                {configurationError}
                            </StyledAlert>
                        }
                    />
                    <ConditionallyRender
                        condition={loading}
                        show={<Loader />}
                        elseShow={
                            <>
                                <ConditionallyRender
                                    condition={
                                        Boolean(results) &&
                                        Object.values(errors).length === 0
                                    }
                                    show={
                                        <>
                                            <GenerateWarningMessages
                                                response={results}
                                            />
                                            <AdvancedPlaygroundResultsTable
                                                loading={loading}
                                                features={results?.features}
                                                input={results?.input}
                                            />
                                        </>
                                    }
                                />
                                <ConditionallyRender
                                    condition={
                                        !results && !hasFormBeenSubmitted
                                    }
                                    show={<PlaygroundGuidance />}
                                />
                            </>
                        }
                    />
                </Box>
            </Box>
        </PageContent>
    );
};

export default AdvancedPlayground;
