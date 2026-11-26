import type { ApiTokenSchema, ApplicationOverviewSchema } from 'openapi';
import type { IEnvironment } from 'interfaces/environments';
import { isTokenExpired } from '../isTokenExpired.ts';

export const ALL_PROJECTS = '*';

export interface IApplicationEnvironment {
    name: string;
    enabled: boolean;
    type?: string;
    instanceCount: number;
    lastSeen: string | null;
    tokens: ApiTokenSchema[];
    linked: boolean;
    linkedProjects: string[];
    observedProjects: string[];
}

interface IBuildApplicationEnvironmentsInput {
    overview: Pick<ApplicationOverviewSchema, 'environments' | 'projects'>;
    tokens: ApiTokenSchema[];
    environments: Pick<
        IEnvironment,
        'name' | 'sortOrder' | 'enabled' | 'type'
    >[];
}

const mergeProjects = (tokens: ApiTokenSchema[]) => {
    const projects = new Set(tokens.flatMap((token) => token.projects));
    return projects.has(ALL_PROJECTS)
        ? [ALL_PROJECTS]
        : [...projects].sort((a, b) => a.localeCompare(b));
};

export const canReadProject = (
    { linkedProjects }: Pick<IApplicationEnvironment, 'linkedProjects'>,
    project: string,
) => linkedProjects.includes(ALL_PROJECTS) || linkedProjects.includes(project);

export const buildApplicationEnvironments = ({
    overview,
    tokens,
    environments,
}: IBuildApplicationEnvironmentsInput): IApplicationEnvironment[] => {
    const activity = new Map(overview.environments.map((e) => [e.name, e]));
    const tokensByEnvironment = Map.groupBy(
        tokens,
        (token) => token.environment ?? '',
    );
    const known = new Map(environments.map((e) => [e.name, e]));
    const position = (name: string) =>
        known.get(name)?.sortOrder ?? Number.MAX_SAFE_INTEGER;

    return [
        ...new Set([
            ...environments.filter((e) => e.enabled).map((e) => e.name),
            ...activity.keys(),
            ...tokensByEnvironment.keys(),
        ]),
    ]
        .sort((a, b) => position(a) - position(b) || a.localeCompare(b))
        .map((name) => {
            const environmentTokens = tokensByEnvironment.get(name) ?? [];
            const workingTokens = environmentTokens.filter(
                (token) => !isTokenExpired(token),
            );
            const linkedProjects = mergeProjects(workingTokens);
            return {
                name,
                enabled: known.get(name)?.enabled ?? false,
                type: known.get(name)?.type,
                instanceCount: activity.get(name)?.instanceCount ?? 0,
                lastSeen: activity.get(name)?.lastSeen ?? null,
                tokens: environmentTokens,
                linked: workingTokens.length > 0,
                linkedProjects,
                observedProjects:
                    activity.size === 1 && activity.has(name)
                        ? overview.projects
                              .filter(
                                  (project) =>
                                      !canReadProject(
                                          { linkedProjects },
                                          project,
                                      ),
                              )
                              .sort((a, b) => a.localeCompare(b))
                        : [],
            };
        });
};
