import { useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router';
import { styled, Typography } from '@mui/material';
import {
    createColumnHelper,
    getCoreRowModel,
    useReactTable,
} from '@tanstack/react-table';
import type { FeatureSchema, UserRecentFlagSchema } from 'openapi';
import { PaginatedTable } from 'component/common/Table';
import { HelpIcon } from 'component/common/HelpIcon/HelpIcon';
import { LinkCell } from 'component/common/Table/cells/LinkCell/LinkCell';
import { TimeAgoCell } from 'component/common/Table/cells/TimeAgoCell/TimeAgoCell';
import { FeatureLifecycleCell } from 'component/common/Table/cells/FeatureSeenCell/FeatureEnvironmentSeenCell';
import { createFeatureOverviewCell } from 'component/common/Table/cells/FeatureOverviewCell/FeatureOverviewCell';
import { StatusCell } from 'component/feature/FeatureToggleList/StatusCell/StatusCell';
import { featuresPlaceholder } from 'component/feature/FeatureToggleList/FeatureToggleListTable';
import { useUserRecentFlags } from 'hooks/api/getters/useUserRecentFlags/useUserRecentFlags';
import { useFavoriteFeaturesApi } from 'hooks/api/actions/useFavoriteFeaturesApi/useFavoriteFeaturesApi';
import useProjects from 'hooks/api/getters/useProjects/useProjects';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import useLoading from 'hooks/useLoading';
import useToast from 'hooks/useToast';
import { useEventTracker } from 'hooks/useEventTracker';
import { useTracking } from 'hooks/useTracking';
import { formatDateYMDHMS } from 'utils/formatDate';
import type { RemoteData } from './RemoteData.ts';
import {
    filterFlagsTracking,
    openFullListTracking,
} from './personalDashboardTracking.ts';

const RECENT_FLAGS_LIMIT = 25;

const LAST_CHANGE_HEADER = 'Your last change';

const Panel = styled('section')(({ theme }) => ({
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadiusMedium,
    backgroundColor: theme.palette.background.paper,
    overflow: 'hidden',
}));

const PanelHeader = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    minHeight: theme.spacing(4.5),
    padding: theme.spacing(2, 4),
    boxSizing: 'content-box',
}));

const PanelTitle = styled('h3')(({ theme }) => ({
    color: theme.palette.text.primary,
    fontSize: theme.typography.body1.fontSize,
    fontWeight: theme.typography.fontWeightBold,
    margin: 0,
}));

const PanelFooter = styled('div')(({ theme }) => ({
    padding: theme.spacing(2, 4),
}));

const AllFlagsLink = styled(Link)(({ theme }) => ({
    fontWeight: theme.typography.fontWeightBold,
}));

const ProjectCell = styled('div')(({ theme }) => ({
    minWidth: '180px',
    [theme.breakpoints.up('xl')]: {
        width: 'max-content',
        maxWidth: '300px',
    },
}));

const PanelMessage = styled(Typography)(({ theme }) => ({
    padding: theme.spacing(10.75, 2),
    textAlign: 'center',
}));

const LastChangeHeader = styled('span')({
    whiteSpace: 'nowrap',
});

const lastChangeTooltip = (date?: string) =>
    date ? `${LAST_CHANGE_HEADER}: ${date}` : '';

const placeholder: UserRecentFlagSchema[] = featuresPlaceholder.map((flag) => ({
    ...flag,
    userLastUpdatedAt: new Date(2022, 1, 1).toISOString(),
}));

// Not for sorting: marks the API's order so the header gets aria-sort.
const sorting = [{ id: 'userLastUpdatedAt', desc: true }];

const columnHelper = createColumnHelper<UserRecentFlagSchema>();

type RecentFlagsPanelViewProps = {
    flags: RemoteData<UserRecentFlagSchema[]>;
    onFavorite: (feature: FeatureSchema) => void;
    onFlagClick: () => void;
};

export const RecentFlagsPanelView = ({
    flags,
    onFavorite,
    onFlagClick,
}: RecentFlagsPanelViewProps) => {
    const { projects } = useProjects();
    const { isOss } = useUiConfig();
    const navigate = useNavigate();
    const loadingRef = useLoading(flags.state === 'loading');
    const trackFilterFlags = useTracking(filterFlagsTracking);
    const trackOpenFullList = useTracking(openFullListTracking);

    const columns = useMemo(
        () => [
            columnHelper.accessor('name', {
                header: 'Name',
                cell: createFeatureOverviewCell(
                    (tag) => {
                        trackFilterFlags('succeeded', { filterKey: 'tag' });
                        navigate(
                            `/search?tag=${encodeURIComponent(`INCLUDE:${tag}`)}`,
                        );
                    },
                    (type) => {
                        trackFilterFlags('succeeded', { filterKey: 'type' });
                        navigate(
                            `/search?type=${encodeURIComponent(`IS:${type}`)}`,
                        );
                    },
                    onFavorite,
                    onFlagClick,
                ),
                meta: { width: '100%', align: 'left' },
            }),
            columnHelper.accessor('lifecycle', {
                id: 'lifecycle',
                header: 'Lifecycle',
                cell: ({ row: { original } }) => (
                    <FeatureLifecycleCell
                        feature={original}
                        expanded
                        data-loading
                    />
                ),
                meta: { width: '1%' },
            }),
            ...(isOss()
                ? []
                : [
                      columnHelper.accessor('environments', {
                          id: 'status',
                          header: 'Status',
                          cell: ({ row: { original } }) => (
                              <StatusCell {...original} />
                          ),
                          size: 350,
                      }),
                  ]),
            columnHelper.accessor('project', {
                header: 'Project',
                cell: ({ getValue }) => {
                    const projectId = getValue();
                    const projectName = projects.find(
                        (project) => project.id === projectId,
                    )?.name;

                    return (
                        <ProjectCell>
                            <LinkCell
                                title={projectName || projectId}
                                to={`/projects/${projectId}`}
                            />
                        </ProjectCell>
                    );
                },
            }),
            columnHelper.accessor('userLastUpdatedAt', {
                header: () => (
                    <LastChangeHeader>{LAST_CHANGE_HEADER}</LastChangeHeader>
                ),
                cell: ({ getValue }) => (
                    <TimeAgoCell
                        value={getValue()}
                        title={lastChangeTooltip}
                        dateFormat={formatDateYMDHMS}
                    />
                ),
                meta: { width: '1%' },
            }),
        ],
        [projects, isOss, onFavorite, onFlagClick, navigate, trackFilterFlags],
    );

    const data = useMemo(
        () =>
            flags.state === 'loading'
                ? placeholder
                : flags.state === 'success'
                  ? flags.data
                  : [],
        [flags],
    );

    const table = useReactTable({
        columns,
        data,
        getCoreRowModel: getCoreRowModel(),
        enableSorting: false,
        state: { sorting },
    });

    return (
        <Panel aria-labelledby='recent-flags-panel-header'>
            <PanelHeader>
                <PanelTitle id='recent-flags-panel-header'>
                    Recent feature flags
                </PanelTitle>
                <HelpIcon tooltip='Flags you recently created or changed, sorted by your latest change.' />
            </PanelHeader>
            <div ref={loadingRef}>
                <PaginatedTable tableInstance={table} />
            </div>
            {flags.state === 'error' && (
                <PanelMessage>
                    We couldn't load your feature flags.
                </PanelMessage>
            )}
            {flags.state === 'success' && flags.data.length === 0 ? (
                <PanelMessage>You don’t have any flags here yet.</PanelMessage>
            ) : (
                <PanelFooter>
                    <AllFlagsLink
                        to='/search'
                        onClick={() =>
                            trackOpenFullList('succeeded', {
                                list: 'flags',
                                method: 'more-link',
                            })
                        }
                    >
                        View all flags
                    </AllFlagsLink>
                </PanelFooter>
            )}
        </Panel>
    );
};

export const RecentFlagsPanel = () => {
    const { flags, loading, error, refetch } = useUserRecentFlags({
        limit: `${RECENT_FLAGS_LIMIT}`,
    });
    const { favorite, unfavorite } = useFavoriteFeaturesApi();
    const { setToastApiError } = useToast();
    const { trackEvent } = useEventTracker();

    const onFavorite = useCallback(
        async (feature: FeatureSchema) => {
            try {
                if (feature.favorite) {
                    await unfavorite(feature.project!, feature.name);
                } else {
                    await favorite(feature.project!, feature.name);
                }
                refetch();
            } catch (_error) {
                setToastApiError(
                    'Something went wrong, could not update favorite',
                );
            }
        },
        [favorite, unfavorite, refetch, setToastApiError],
    );

    const remoteFlags: RemoteData<UserRecentFlagSchema[]> = error
        ? { state: 'error', error }
        : loading
          ? { state: 'loading' }
          : { state: 'success', data: flags ?? [] };

    const onFlagClick = useCallback(
        () =>
            trackEvent('personal-dashboard', {
                props: {
                    eventType: 'Go to flag from list',
                    dashboardVersion: 'v2',
                },
            }),
        [trackEvent],
    );

    return (
        <RecentFlagsPanelView
            flags={remoteFlags}
            onFavorite={onFavorite}
            onFlagClick={onFlagClick}
        />
    );
};
