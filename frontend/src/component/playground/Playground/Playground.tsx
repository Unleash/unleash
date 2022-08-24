import { FormEventHandler, useEffect, useState, VFC } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Box, Paper, useMediaQuery, useTheme } from '@mui/material';
import { PageContent } from 'component/common/PageContent/PageContent';
import { PageHeader } from 'component/common/PageHeader/PageHeader';
import useToast from 'hooks/useToast';
import { formatUnknownError } from 'utils/formatUnknownError';
import { PlaygroundResultsTable } from './PlaygroundResultsTable/PlaygroundResultsTable';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { usePlaygroundApi } from 'hooks/api/actions/usePlayground/usePlayground';
import { PlaygroundResponseSchema } from 'component/playground/Playground/interfaces/playground.model';
import { useEnvironments } from 'hooks/api/getters/useEnvironments/useEnvironments';
import { PlaygroundForm } from './PlaygroundForm/PlaygroundForm';
import {
    resolveDefaultEnvironment,
    resolveProjects,
    resolveResultsWidth,
} from './playground.utils';
import { PlaygroundGuidance } from './PlaygroundGuidance/PlaygroundGuidance';
import { PlaygroundGuidancePopper } from './PlaygroundGuidancePopper/PlaygroundGuidancePopper';
import Loader from '../../common/Loader/Loader';

export const Playground: VFC<{}> = () => {
    const { environments } = useEnvironments();
    const theme = useTheme();
    const matches = useMediaQuery(theme.breakpoints.down('lg'));

    const [environment, setEnvironment] = useState<string>('');
    const [projects, setProjects] = useState<string[]>([]);
    const [context, setContext] = useState<string>();
    const [results, setResults] = useState<
        PlaygroundResponseSchema | undefined
    >();
    const { setToastData } = useToast();
    const [searchParams, setSearchParams] = useSearchParams();
    const { evaluatePlayground, loading } = usePlaygroundApi();

    useEffect(() => {
        setEnvironment(resolveDefaultEnvironment(environments));
    }, [environments]);

    useEffect(() => {
        // Load initial values from URL
        try {
            const environmentFromUrl = searchParams.get('environment');
            if (environmentFromUrl) {
                setEnvironment(environmentFromUrl);
            }

            let projectsArray: string[];
            let projectsFromUrl = searchParams.get('projects');
            if (projectsFromUrl) {
                projectsArray = projectsFromUrl.split(',');
                setProjects(projectsArray);
            }

            let contextFromUrl = searchParams.get('context');
            if (contextFromUrl) {
                contextFromUrl = decodeURI(contextFromUrl);
                setContext(contextFromUrl);
            }

            const makePlaygroundRequest = async () => {
                if (environmentFromUrl && contextFromUrl) {
                    await evaluatePlaygroundContext(
                        environmentFromUrl,
                        projectsArray || '*',
                        contextFromUrl
                    );
                }
            };

            makePlaygroundRequest();
        } catch (error) {
            setToastData({
                type: 'error',
                title: `Failed to parse URL parameters: ${formatUnknownError(
                    error
                )}`,
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const evaluatePlaygroundContext = async (
        environment: string,
        projects: string[] | string,
        context: string | undefined,
        action?: () => void
    ) => {
        try {
            const parsedContext = JSON.parse(context || '{}');
            const response = await evaluatePlayground({
                environment,
                projects: resolveProjects(projects),
                context: {
                    appName: 'playground',
                    ...parsedContext,
                },
            });

            if (action && typeof action === 'function') {
                action();
            }
            setResults(response);
        } catch (error: unknown) {
            setToastData({
                type: 'error',
                title: `Error parsing context: ${formatUnknownError(error)}`,
            });
        }
    };

    const onSubmit: FormEventHandler<HTMLFormElement> = async event => {
        event.preventDefault();

        await evaluatePlaygroundContext(
            environment,
            projects,
            context,
            setURLParameters
        );
    };

    const setURLParameters = () => {
        searchParams.set('context', encodeURI(context || '')); // always set because of native validation
        searchParams.set('environment', environment);
        if (
            Array.isArray(projects) &&
            projects.length > 0 &&
            !(projects.length === 1 && projects[0] === '*')
        ) {
            searchParams.set('projects', projects.join(','));
        } else {
            searchParams.delete('projects');
        }
        setSearchParams(searchParams);
    };

    const formWidth = results && !matches ? '35%' : 'auto';
    const resultsWidth = resolveResultsWidth(matches, results);

    return (
        <PageContent
            header={
                <PageHeader
                    title="Unleash playground"
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
                        background: theme.palette.playgroundBackground,
                        borderBottomLeftRadius: theme.shape.borderRadiusMedium,
                    }}
                >
                    <Paper
                        elevation={0}
                        sx={{
                            px: 4,
                            py: 3,
                            mb: 4,
                            mt: 2,
                            background: theme.palette.playgroundBackground,
                            transition: 'width 0.4s ease',
                            minWidth: matches ? 'auto' : '500px',
                            width: formWidth,
                            position: 'sticky',
                            top: 0,
                        }}
                    >
                        <PlaygroundForm
                            onSubmit={onSubmit}
                            context={context}
                            setContext={setContext}
                            environments={environments}
                            projects={projects}
                            environment={environment}
                            setProjects={setProjects}
                            setEnvironment={setEnvironment}
                        />
                    </Paper>
                </Box>
                <Box
                    sx={theme => ({
                        width: resultsWidth,
                        transition: 'width 0.4s ease',
                        padding: theme.spacing(4, 2),
                    })}
                >
                    <ConditionallyRender
                        condition={loading}
                        show={<Loader />}
                        elseShow={
                            <ConditionallyRender
                                condition={Boolean(results)}
                                show={
                                    <PlaygroundResultsTable
                                        loading={loading}
                                        features={results?.features}
                                        input={results?.input}
                                    />
                                }
                                elseShow={<PlaygroundGuidance />}
                            />
                        }
                    />
                </Box>
            </Box>
        </PageContent>
    );
};

export default Playground;
