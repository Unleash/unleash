import { VirtualizedTableV8 } from 'component/common/Table/VirtualizedTable/VirtualizedTableV8';
import { HighlightCell } from 'component/common/Table/cells/HighlightCell/HighlightCell';
import { TextCell } from 'component/common/Table/cells/TextCell/TextCell';
import { TimeAgoCell } from 'component/common/Table/cells/TimeAgoCell/TimeAgoCell';
import { ProjectOwners } from 'component/project/ProjectCard/ProjectCardFooter/ProjectOwners/ProjectOwners';
import { useFavoriteProjectsApi } from 'hooks/api/actions/useFavoriteProjectsApi/useFavoriteProjectsApi';
import useProjects from 'hooks/api/getters/useProjects/useProjects';
import type { ProjectSchema, ProjectSchemaOwners } from 'openapi';
import { useCallback, useMemo } from 'react';
import {
    type ColumnDef,
    getCoreRowModel,
    useReactTable,
} from '@tanstack/react-table';
import { formatDateYMDHMS } from 'utils/formatDate';
import { ProjectsListTableNameCell } from './ProjectsListTableNameCell.tsx';
import { useMediaQuery } from '@mui/material';
import theme from 'themes/theme.ts';
import { ProjectListTableLastSeenCell } from './ProjectListTableLastSeenCell.tsx';

type ProjectsListTableProps = {
    projects: ProjectSchema[];
};

export const ProjectsListTable = ({ projects }: ProjectsListTableProps) => {
    const { refetch } = useProjects();
    const { favorite, unfavorite } = useFavoriteProjectsApi();
    const isMediumScreen = useMediaQuery(theme.breakpoints.down('lg'));

    const onFavorite = useCallback(
        async (project: ProjectSchema) => {
            if (project?.favorite) {
                await unfavorite(project.id);
            } else {
                await favorite(project.id);
            }
            refetch();
        },
        [refetch, favorite, unfavorite],
    );

    const columns = useMemo<ColumnDef<ProjectSchema, unknown>[]>(
        () => [
            {
                id: 'name',
                header: 'Project name',
                accessorKey: 'name',
                cell: ({ row }) => (
                    <ProjectsListTableNameCell
                        row={row}
                        isFavorite={Boolean(row.original.favorite)}
                        onFavorite={() => onFavorite(row.original)}
                    />
                ),
                meta: { minWidth: 200, searchable: true },
            },
            {
                id: 'lastUpdatedAt',
                header: 'Last updated',
                accessorFn: (row) => row.lastUpdatedAt || row.createdAt,
                cell: ({ getValue, column }) => (
                    <TimeAgoCell
                        value={String(getValue() ?? '')}
                        column={column}
                        dateFormat={formatDateYMDHMS}
                    />
                ),
                meta: { width: 150 },
            },
            {
                id: 'featureCount',
                header: 'Flags',
                accessorKey: 'featureCount',
                cell: ({ getValue }) => {
                    const value = getValue() as number;
                    return (
                        <TextCell>
                            {value} flag{value === 1 ? '' : 's'}
                        </TextCell>
                    );
                },
                meta: { width: 90 },
            },
            {
                id: 'technicalDebt',
                header: 'Technical debt',
                accessorKey: 'technicalDebt',
                cell: ({ getValue }) => (
                    <TextCell>{`${getValue() as number}%`}</TextCell>
                ),
                meta: { width: 130 },
            },
            {
                id: 'lastReportedFlagUsage',
                header: 'Last seen',
                accessorKey: 'lastReportedFlagUsage',
                cell: ({ getValue }) => (
                    <ProjectListTableLastSeenCell
                        value={getValue() as Date | undefined}
                        hideLabel={isMediumScreen}
                    />
                ),
                meta: { width: isMediumScreen ? 100 : 140 },
            },
            {
                id: 'owners',
                header: 'Owner',
                accessorKey: 'owners',
                cell: ({ getValue }) => {
                    const value = getValue() as ProjectSchemaOwners | undefined;
                    return (
                        <TextCell>
                            <ProjectOwners
                                owners={value?.filter(
                                    (owner) => owner.ownerType !== 'system',
                                )}
                            />
                        </TextCell>
                    );
                },
            },
            {
                id: 'memberCount',
                header: 'Members',
                accessorKey: 'memberCount',
                cell: ({ getValue }) => (
                    <TextCell>{`${getValue() as number} members`}</TextCell>
                ),
                meta: { width: 120 },
            },
        ],
        [onFavorite, isMediumScreen],
    );

    const table = useReactTable({
        columns,
        data: projects,
        defaultColumn: {
            cell: ({ getValue }) => (
                <HighlightCell value={String(getValue() ?? '')} />
            ),
        },
        getCoreRowModel: getCoreRowModel(),
        autoResetAll: false,
        enableSortingRemoval: false,
        enableMultiSort: false,
    });

    return <VirtualizedTableV8 tableInstance={table} />;
};
