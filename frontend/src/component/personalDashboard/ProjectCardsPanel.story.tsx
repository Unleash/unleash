import type { ReactNode } from 'react';
import { SWRConfig, type Middleware } from 'swr';
import type { Story, StoryMeta } from 'component/stories/types';
import type { ProjectSchema } from 'openapi';
import type { RemoteData } from './RemoteData.ts';
import { AccessProviderMock } from 'component/providers/AccessProvider/AccessProviderMock';
import { CREATE_PROJECT } from 'component/providers/AccessProvider/permissions';
import { formatApiPath } from 'utils/formatPath';
import { ProjectCardsPanelView } from './ProjectCardsPanel';

export const meta: StoryMeta = {
    title: 'PersonalDashboard / ProjectCardsPanel',
    background: 'application',
};

const uiConfigPath = formatApiPath('api/admin/ui-config');

const withEdition =
    (oss: boolean): Middleware =>
    (useSWRNext) =>
    (key, fetcher, config) => {
        const uiConfigFetcher = async () => ({
            versionInfo: {
                current: oss ? { oss: '7.0.0' } : { enterprise: '7.0.0' },
            },
        });
        return useSWRNext(
            key,
            key === uiConfigPath
                ? (uiConfigFetcher as typeof fetcher)
                : fetcher,
            config,
        );
    };

const Setup = ({
    oss = false,
    canCreateProject = true,
    children,
}: {
    oss?: boolean;
    canCreateProject?: boolean;
    children: ReactNode;
}) => (
    <SWRConfig value={{ provider: () => new Map(), use: [withEdition(oss)] }}>
        <AccessProviderMock
            permissions={
                canCreateProject ? [{ permission: CREATE_PROJECT }] : []
            }
        >
            {children}
        </AccessProviderMock>
    </SWRConfig>
);

const daysAgo = (days: number) =>
    new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

const project = (overrides: Partial<ProjectSchema> & { id: string }) => ({
    name: overrides.id,
    featureCount: 12,
    cleanupCount: 4,
    memberCount: 5,
    mode: 'open' as const,
    createdAt: daysAgo(400),
    lastUpdatedAt: daysAgo(1),
    lastReportedFlagUsage: new Date().toISOString(),
    ...overrides,
});

const defaultProject = project({ id: 'default', name: 'Default' });

const projects: ProjectSchema[] = [
    { ...defaultProject, favorite: true },
    project({ id: 'checkout', name: 'Checkout', cleanupCount: 0 }),
    project({
        id: 'private-billing',
        name: 'Billing',
        mode: 'private',
        lastUpdatedAt: daysAgo(365),
    }),
    project({ id: 'search', name: 'Search' }),
    project({ id: 'mobile', name: 'Mobile' }),
    ...['ads', 'auth', 'cart', 'emails', 'growth', 'payments', 'web'].map(
        (id) => project({ id }),
    ),
];

const Panel = ({ projects }: { projects: RemoteData<ProjectSchema[]> }) => (
    <ProjectCardsPanelView projects={projects} onProjectClick={() => {}} />
);

const loaded = (data: ProjectSchema[]): RemoteData<ProjectSchema[]> => ({
    state: 'success',
    data,
});

export const ManyProjects: Story = () => (
    <Setup>
        <Panel projects={loaded(projects)} />
    </Setup>
);

export const TwoProjects: Story = () => (
    <Setup>
        <Panel projects={loaded(projects.slice(0, 2))} />
    </Setup>
);

export const SingleProject: Story = () => (
    <Setup>
        <Panel projects={loaded(projects.slice(0, 1))} />
    </Setup>
);

export const OnboardingAndLongNames: Story = () => (
    <Setup>
        <Panel
            projects={loaded([
                project({
                    id: 'new',
                    name: 'A brand new project that has a rather long name to check truncation',
                    featureCount: 0,
                    cleanupCount: 0,
                    lastReportedFlagUsage: null,
                    onboardingStatus: { status: 'onboarding-started' },
                }),
                project({
                    id: 'first-flag',
                    name: 'First flag created',
                    featureCount: 1,
                    cleanupCount: 0,
                    lastReportedFlagUsage: null,
                    onboardingStatus: {
                        status: 'first-flag-created',
                        feature: 'my-first-flag',
                    },
                }),
            ])}
        />
    </Setup>
);

export const CannotCreateProject: Story = () => (
    <Setup canCreateProject={false}>
        <Panel projects={loaded(projects)} />
    </Setup>
);

export const NoProjects: Story = () => (
    <Setup>
        <Panel projects={loaded([])} />
    </Setup>
);

export const LoadError: Story = () => (
    <Setup>
        <Panel
            projects={{ state: 'error', error: new Error('Failed to load') }}
        />
    </Setup>
);

export const NoProjectsCannotCreateProject: Story = () => (
    <Setup canCreateProject={false}>
        <Panel projects={loaded([])} />
    </Setup>
);

export const Oss: Story = () => (
    <Setup oss>
        <Panel projects={loaded([defaultProject])} />
    </Setup>
);

export const OssNoProjects: Story = () => (
    <Setup oss>
        <Panel projects={loaded([])} />
    </Setup>
);

export const Loading: Story = () => (
    <Setup>
        <Panel projects={{ state: 'loading' }} />
    </Setup>
);
