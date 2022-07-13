import { FormEventHandler, useEffect, useState, VFC } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
    Box,
    Button,
    Divider,
    Paper,
    Typography,
    useTheme,
} from '@mui/material';
import { PageContent } from 'component/common/PageContent/PageContent';
import { PageHeader } from 'component/common/PageHeader/PageHeader';
import { PlaygroundConnectionFieldset } from './PlaygroundConnectionFieldset/PlaygroundConnectionFieldset';
import { PlaygroundCodeFieldset } from './PlaygroundCodeFieldset/PlaygroundCodeFieldset';
import useToast from 'hooks/useToast';
import { formatUnknownError } from 'utils/formatUnknownError';
import { PlaygroundResultsTable } from './PlaygroundResultsTable/PlaygroundResultsTable';
import { ContextBanner } from './PlaygroundResultsTable/ContextBanner/ContextBanner';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import usePlaygroundApi from 'hooks/api/actions/usePlayground/usePlayground';
import { PlaygroundResponseSchema } from 'hooks/api/actions/usePlayground/playground.model';

interface IPlaygroundProps {}

export const Playground: VFC<IPlaygroundProps> = () => {
    const theme = useTheme();
    const [environment, onSetEnvironment] = useState<string>('');
    const [projects, onSetProjects] = useState<string[]>([]);
    const [context, setContext] = useState<string>();
    const [results, setResults] = useState<
        PlaygroundResponseSchema | undefined
    >();
    const { setToastData } = useToast();
    const [searchParams, setSearchParams] = useSearchParams();
    const { evaluatePlayground, loading } = usePlaygroundApi();

    useEffect(() => {
        // Load initial values from URL
        try {
            const environmentFromUrl = searchParams.get('environment');
            if (environmentFromUrl) {
                onSetEnvironment(environmentFromUrl);
            }
            const projectsFromUrl = searchParams.get('projects');
            if (projectsFromUrl) {
                onSetProjects(projectsFromUrl.split(','));
            }
            const contextFromUrl = searchParams.get('context');
            if (contextFromUrl) {
                setContext(decodeURI(contextFromUrl));
            }
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

    const onSubmit: FormEventHandler<HTMLFormElement> = async event => {
        event.preventDefault();

        try {
            const parsedContext = JSON.parse(context || '{}');
            const response = await evaluatePlayground({
                environment,
                projects:
                    !projects ||
                    projects.length === 0 ||
                    (projects.length === 1 && projects[0] === '*')
                        ? '*'
                        : projects,
                context: {
                    appName: 'playground',
                    ...parsedContext,
                },
            });

            // Set URL search parameters
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

            // Display results
            setResults(response);
        } catch (error: unknown) {
            setToastData({
                type: 'error',
                title: `Error parsing context: ${formatUnknownError(error)}`,
            });
        }
    };

    return (
        <PageContent
            header={<PageHeader title="Unleash playground" />}
            disableLoading
            bodyClass={'no-padding'}
        >
            <Paper
                elevation={0}
                sx={{
                    px: 4,
                    py: 3,
                    mb: 4,
                    m: 4,
                    background: theme.palette.grey[200],
                }}
            >
                <Box component="form" onSubmit={onSubmit}>
                    <Typography
                        sx={{
                            mb: 3,
                        }}
                    >
                        Configure playground
                    </Typography>
                    <PlaygroundConnectionFieldset
                        environment={environment}
                        projects={projects}
                        setEnvironment={onSetEnvironment}
                        setProjects={onSetProjects}
                    />
                    <Divider
                        variant="fullWidth"
                        sx={{
                            mb: 2,
                            borderColor: theme.palette.dividerAlternative,
                            borderStyle: 'dashed',
                        }}
                    />
                    <PlaygroundCodeFieldset
                        value={context}
                        setValue={setContext}
                    />
                    <Divider
                        variant="fullWidth"
                        sx={{
                            mt: 3,
                            mb: 2,
                            borderColor: theme.palette.dividerAlternative,
                        }}
                    />
                    <Button variant="contained" size="large" type="submit">
                        Try configuration
                    </Button>
                </Box>
            </Paper>
            <ConditionallyRender
                condition={Boolean(results)}
                show={
                    <>
                        <Divider />
                        <ContextBanner
                            environment={
                                (results as PlaygroundResponseSchema)?.input
                                    ?.environment
                            }
                            projects={
                                (results as PlaygroundResponseSchema)?.input
                                    ?.projects
                            }
                            context={
                                (results as PlaygroundResponseSchema)?.input
                                    ?.context
                            }
                        />
                    </>
                }
            />

            <PlaygroundResultsTable
                loading={loading}
                features={results?.features}
            />
        </PageContent>
    );
};
