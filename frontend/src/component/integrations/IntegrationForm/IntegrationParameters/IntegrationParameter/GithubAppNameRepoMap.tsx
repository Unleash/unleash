import { useId, useMemo } from 'react';
import { Autocomplete, TextField, styled } from '@mui/material';
import type { AddonParameterSchema, AddonSchema } from 'openapi';
import { FormGroup } from 'component/common/FormGroup/FormGroup';
import { MarkdownHelpText } from '../../IntegrationForm.styles';
import { useProjectApplications } from 'hooks/api/getters/useProjectApplications/useProjectApplications';

const APPLICATIONS_PAGE_LIMIT = 100;

type AppNameRepoMap = Record<string, Record<string, string[]>>;

type AppNameRepoMapping = {
    project: string;
    appName: string;
    repository: string;
};

const isMapping = (value: unknown): value is AppNameRepoMapping =>
    typeof value === 'object' &&
    value !== null &&
    typeof (value as AppNameRepoMapping).project === 'string' &&
    typeof (value as AppNameRepoMapping).appName === 'string' &&
    typeof (value as AppNameRepoMapping).repository === 'string';

export const toAppNameRepoMap = (value: unknown): AppNameRepoMap => {
    if (!Array.isArray(value)) return {};

    const map: AppNameRepoMap = {};
    for (const { project, appName, repository } of value.filter(isMapping)) {
        const appNames = map[project] ?? {};
        const repositories = appNames[appName] ?? [];
        map[project] = appNames;
        appNames[appName] = repositories.includes(repository)
            ? repositories
            : [...repositories, repository];
    }
    return map;
};

export const toMappings = (map: AppNameRepoMap): AppNameRepoMapping[] =>
    Object.entries(map).flatMap(([project, appNames]) =>
        Object.entries(appNames).flatMap(([appName, repositories]) =>
            repositories.map((repository) => ({
                project,
                appName,
                repository,
            })),
        ),
    );

const useProjectAppNames = (projectId: string) => {
    const { applications, loading, error } = useProjectApplications(
        { limit: APPLICATIONS_PAGE_LIMIT },
        projectId,
    );

    return {
        appNames: applications
            .map(({ name }) => name)
            .sort((a, b) => a.localeCompare(b)),
        loading,
        error,
    };
};

const repositoriesFromParameters = (
    parameters: AddonSchema['parameters'],
): string[] => {
    const defaultRepository = parameters?.defaultRepository;
    if (typeof defaultRepository !== 'string') return [];

    return [
        ...new Set(
            defaultRepository
                .split(',')
                .map((repository) => repository.trim())
                .filter(Boolean),
        ),
    ];
};

const ProjectCard = styled('section')(({ theme }) => ({
    borderRadius: theme.shape.borderRadiusLarge,
    overflow: 'hidden',
    border: `1px solid ${theme.palette.divider}`,
    '& > *': {
        padding: theme.spacing(2),
        backgroundColor: theme.palette.background.paper,
    },
}));

const ProjectHeader = styled('div')(({ theme }) => ({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    gap: theme.spacing(1),
    borderBottom: `1px solid ${theme.palette.divider}`,
}));

const ProjectName = styled('h4')(({ theme }) => ({
    margin: 0,
    fontSize: theme.typography.body1.fontSize,
    fontWeight: theme.typography.fontWeightBold,
}));

const Muted = styled('span')(({ theme }) => ({
    color: theme.palette.text.secondary,
    fontSize: theme.typography.caption.fontSize,
}));

const Rows = styled('div')(({ theme }) => ({
    '& > * + *': { marginTop: theme.spacing(1.5) },
}));

const Row = styled('div')(({ theme }) => ({
    display: 'grid',
    gridTemplateColumns: 'minmax(8rem, 1fr) 2fr',
    gap: theme.spacing(2),
    alignItems: 'center',
    [theme.breakpoints.down('sm')]: {
        gridTemplateColumns: '1fr',
        gap: theme.spacing(0.5),
    },
}));

const ColumnHeaders = styled(Row)(({ theme }) => ({
    marginBottom: theme.spacing(1),
    color: theme.palette.text.secondary,
    fontSize: theme.typography.caption.fontSize,
    fontWeight: theme.typography.fontWeightBold,
    [theme.breakpoints.down('sm')]: { display: 'none' },
}));

const AppNameLabel = styled('label')(({ theme }) => ({
    fontSize: theme.typography.body2.fontSize,
    color: theme.palette.text.primary,
    overflowWrap: 'anywhere',
}));

const AppNameRow = ({
    appName,
    repositories,
    selected,
    onChange,
}: {
    appName: string;
    repositories: string[];
    selected: string[];
    onChange: (repositories: string[]) => void;
}) => {
    const inputId = useId();

    return (
        <Row>
            <AppNameLabel htmlFor={inputId}>{appName}</AppNameLabel>
            <Autocomplete
                id={inputId}
                multiple
                size='small'
                options={repositories}
                disableCloseOnSelect
                value={selected}
                onChange={(_, value) => onChange(value)}
                renderInput={(params) => (
                    <TextField
                        {...params}
                        placeholder={
                            selected.length ? undefined : 'Select repositories'
                        }
                    />
                )}
            />
        </Row>
    );
};

const ProjectAppNames = ({
    projectId,
    repositories,
    selections,
    setRepositories,
}: {
    projectId: string;
    repositories: string[];
    selections: Record<string, string[]>;
    setRepositories: (appName: string, repositories: string[]) => void;
}) => {
    const { appNames, loading } = useProjectAppNames(projectId);

    return (
        <ProjectCard>
            <ProjectHeader>
                <ProjectName>{projectId}</ProjectName>
                {loading ? null : (
                    <Muted>
                        {appNames.length === 1
                            ? '1 application'
                            : `${appNames.length} applications`}
                    </Muted>
                )}
            </ProjectHeader>

            <div>
                {loading ? <Muted>Loading applications…</Muted> : null}
                {!loading && appNames.length === 0 ? (
                    <Muted>
                        No applications have reported into this project yet.
                    </Muted>
                ) : null}
                {appNames.length ? (
                    <>
                        <ColumnHeaders aria-hidden>
                            <span>Application</span>
                            <span>Repositories</span>
                        </ColumnHeaders>
                        <Rows>
                            {appNames.map((appName) => (
                                <AppNameRow
                                    key={appName}
                                    appName={appName}
                                    repositories={repositories}
                                    selected={selections[appName] ?? []}
                                    onChange={(value) =>
                                        setRepositories(appName, value)
                                    }
                                />
                            ))}
                        </Rows>
                    </>
                ) : null}
            </div>
        </ProjectCard>
    );
};

export interface IAppNameRepoMapEditorProps {
    definition: AddonParameterSchema;
    projects: string[];
    repositories: string[];
    value: AppNameRepoMap;
    onChange: (value: AppNameRepoMap) => void;
}

export const AppNameRepoMapEditor = ({
    definition,
    projects,
    repositories,
    value: appNameRepoMap,
    onChange,
}: IAppNameRepoMapEditorProps) => {
    const setRepositories =
        (projectId: string) => (appName: string, selected: string[]) => {
            onChange({
                ...appNameRepoMap,
                [projectId]: {
                    ...appNameRepoMap[projectId],
                    [appName]: selected,
                },
            });
        };

    return (
        <FormGroup variant='nested' title={definition.displayName}>
            <MarkdownHelpText sx={{ mb: 0 }}>
                {definition.description}
            </MarkdownHelpText>
            {projects.length ? (
                projects.map((projectId) => (
                    <ProjectAppNames
                        key={projectId}
                        projectId={projectId}
                        repositories={repositories}
                        selections={appNameRepoMap[projectId] ?? {}}
                        setRepositories={setRepositories(projectId)}
                    />
                ))
            ) : (
                <Muted>
                    Select the projects this integration applies to to map their
                    applications to repositories.
                </Muted>
            )}
        </FormGroup>
    );
};

export interface IGithubAppNameRepoMapProps {
    parametersErrors: Record<string, string>;
    definition: AddonParameterSchema;
    config: AddonSchema;
    projects: string[];
    setStructuredParameter: (param: string) => (value: unknown) => void;
}

export const GithubAppNameRepoMap = ({
    definition,
    config,
    projects,
    setStructuredParameter,
}: IGithubAppNameRepoMapProps) => {
    const stored = config.parameters?.[definition.name];
    const value = useMemo(() => toAppNameRepoMap(stored), [stored]);

    const onChange = (next: AppNameRepoMap) => {
        const mappings = toMappings(next);
        setStructuredParameter(definition.name)(
            mappings.length ? mappings : undefined,
        );
    };

    return (
        <AppNameRepoMapEditor
            definition={definition}
            projects={projects}
            repositories={repositoriesFromParameters(config.parameters)}
            value={value}
            onChange={onChange}
        />
    );
};
