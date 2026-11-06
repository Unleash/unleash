import type { ReactNode } from 'react';
import { SWRConfig, type Middleware } from 'swr';
import type { Story, StoryMeta } from 'component/stories/types';
import type {
    FeatureSearchEnvironmentSchema,
    FeatureSearchResponseSchema,
} from 'openapi';
import type { RemoteData } from './RemoteData.ts';
import { formatApiPath } from 'utils/formatPath';
import { RecentFlagsPanelView } from './RecentFlagsPanel';

export const meta: StoryMeta = {
    title: 'PersonalDashboard / RecentFlagsPanel',
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
    children,
}: {
    oss?: boolean;
    children: ReactNode;
}) => (
    <SWRConfig value={{ provider: () => new Map(), use: [withEdition(oss)] }}>
        {children}
    </SWRConfig>
);

const daysAgo = (days: number) =>
    new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

const environment = (
    name: string,
    enabled: boolean,
): FeatureSearchEnvironmentSchema => ({
    name,
    enabled,
    type: name === 'production' ? 'production' : 'development',
    hasStrategies: true,
    hasEnabledStrategies: enabled,
    lastSeenAt: enabled ? daysAgo(0) : null,
});

const flag = (
    overrides: Partial<FeatureSearchResponseSchema> & { name: string },
): FeatureSearchResponseSchema => ({
    description: null,
    type: 'release',
    project: 'default',
    createdAt: daysAgo(30),
    createdBy: { id: 1, name: 'Jane Doe', imageUrl: '' },
    archivedAt: null,
    favorite: false,
    stale: false,
    dependencyType: null,
    impressionData: false,
    segments: [],
    tags: [],
    environments: [
        environment('development', true),
        environment('production', false),
    ],
    lifecycle: { stage: 'pre-live', enteredStageAt: daysAgo(10) },
    ...overrides,
});

const flags: FeatureSearchResponseSchema[] = [
    flag({
        name: 'new-checkout-flow',
        description: 'Redesigned checkout with fewer steps',
        favorite: true,
        project: 'checkout',
        tags: [{ type: 'simple', value: 'q4' }],
        environments: [
            environment('development', true),
            environment('production', true),
        ],
        lifecycle: { stage: 'live', enteredStageAt: daysAgo(3) },
    }),
    flag({
        name: 'dark-mode',
        type: 'experiment',
        createdAt: daysAgo(2),
        lifecycle: { stage: 'initial', enteredStageAt: daysAgo(2) },
        environments: [],
    }),
    flag({
        name: 'payments-kill-switch',
        type: 'kill-switch',
        project: 'payments',
        stale: true,
        lifecycle: { stage: 'completed', enteredStageAt: daysAgo(60) },
    }),
    flag({
        name: 'a-flag-with-a-really-long-name-to-check-how-the-table-handles-truncation',
        description:
            'And an equally long description that keeps going to see how it wraps inside the name column of the table',
        dependencyType: 'child',
    }),
];

const loaded = (
    data: FeatureSearchResponseSchema[],
): RemoteData<FeatureSearchResponseSchema[]> => ({
    state: 'success',
    data,
});

const Panel = ({
    flags,
}: {
    flags: RemoteData<FeatureSearchResponseSchema[]>;
}) => <RecentFlagsPanelView flags={flags} onFavorite={() => {}} />;

export const SomeFlags: Story = () => (
    <Setup>
        <Panel flags={loaded(flags)} />
    </Setup>
);

export const ManyFlags: Story = () => (
    <Setup>
        <Panel
            flags={loaded(
                Array.from({ length: 20 }, (_, index) =>
                    flag({ name: `flag-${index + 1}` }),
                ),
            )}
        />
    </Setup>
);

export const NoFlags: Story = () => (
    <Setup>
        <Panel flags={loaded([])} />
    </Setup>
);

export const LoadError: Story = () => (
    <Setup>
        <Panel flags={{ state: 'error', error: new Error('Failed to load') }} />
    </Setup>
);

export const Loading: Story = () => (
    <Setup>
        <Panel flags={{ state: 'loading' }} />
    </Setup>
);

export const Oss: Story = () => (
    <Setup oss>
        <Panel flags={loaded(flags)} />
    </Setup>
);
