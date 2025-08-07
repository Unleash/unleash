import { VirtualizedTable } from 'component/common/Table';
import { FavoriteIconCell } from 'component/common/Table/cells/FavoriteIconCell/FavoriteIconCell';
import { HighlightCell } from 'component/common/Table/cells/HighlightCell/HighlightCell';
import { TextCell } from 'component/common/Table/cells/TextCell/TextCell';
import { TimeAgoCell } from 'component/common/Table/cells/TimeAgoCell/TimeAgoCell';
import { ProjectOwners } from 'component/project/ProjectCard/ProjectCardFooter/ProjectOwners/ProjectOwners';
import { ProjectLastSeen } from 'component/project/ProjectCard/ProjectLastSeen/ProjectLastSeen';
import { useFavoriteProjectsApi } from 'hooks/api/actions/useFavoriteProjectsApi/useFavoriteProjectsApi';
import useProjects from 'hooks/api/getters/useProjects/useProjects';
import type { ProjectSchema, ProjectSchemaOwners } from 'openapi';
import { useCallback, useMemo } from 'react';
import { useFlexLayout, useTable } from 'react-table';
import { formatDateYMDHMS } from 'utils/formatDate';
import { ProjectsListTableProjectName } from './ProjectsListTableProjectName.tsx';

type ProjectsListTableProps = {
    projects: ProjectSchema[];
};

export const ProjectsListTable = ({ projects }: ProjectsListTableProps) => {
    const { refetch } = useProjects();
    const { favorite, unfavorite } = useFavoriteProjectsApi();

    const onFavorite = useCallback(
        async (project: ProjectSchema) => {
            if (project?.favorite) {
                await unfavorite(project.id);
            } else {
                await favorite(project.id);
            }
            refetch();
        },
        [refetch],
    );

    const columns = useMemo(
        () => [
            {
                Header: '',
                accessor: 'favorite',
                Cell: ({ row }: { row: { original: ProjectSchema } }) => (
                    <FavoriteIconCell
                        value={row.original.favorite}
                        onClick={() => onFavorite(row.original)}
                    />
                ),
                width: 40,
            },
            {
                Header: 'Project name',
                accessor: 'name',
                minWidth: 200,
                searchable: true,
                Cell: ProjectsListTableProjectName,
            },
            {
                Header: 'Last updated',
                accessor: (row: ProjectSchema) =>
                    row.lastUpdatedAt || row.createdAt,
                Cell: ({ value, column }) => (
                    <TimeAgoCell
                        value={value}
                        column={column}
                        dateFormat={formatDateYMDHMS}
                    />
                ),
            },
            {
                Header: 'Number of flags',
                accessor: 'featureCount',
                Cell: ({ value }: { value: number }) => (
                    <TextCell>
                        {value} flag{value === 1 ? '' : 's'}
                    </TextCell>
                ),
            },
            {
                Header: 'Health',
                accessor: 'health',
                Cell: ({ value }: { value: number }) => (
                    <TextCell>{value}%</TextCell>
                ),
                width: 100,
            },
            {
                Header: 'Last seen',
                accessor: 'lastReportedFlagUsage',
                Cell: ({ value }: { value: Date }) => (
                    <ProjectLastSeen date={value} />
                ),
            },
            {
                Header: 'Owner',
                accessor: 'owners',
                Cell: ({ value }: { value: ProjectSchemaOwners }) => (
                    <ProjectOwners
                        owners={value?.filter(
                            (owner) => owner.ownerType !== 'system',
                        )}
                    />
                ),
            },
            {
                Header: 'Members',
                accessor: 'memberCount',
                Cell: ({ value }: { value: number }) => (
                    <TextCell>{value} members</TextCell>
                ),
            },
        ],
        [onFavorite],
    );

    const { headerGroups, rows, prepareRow } = useTable(
        {
            columns: columns as any,
            data: projects,
            autoResetHiddenColumns: false,
            autoResetSortBy: false,
            disableSortRemove: true,
            disableMultiSort: true,
            defaultColumn: {
                Cell: HighlightCell,
            },
        },
        useFlexLayout,
    );

    return (
        <VirtualizedTable
            rows={rows}
            headerGroups={headerGroups}
            prepareRow={prepareRow}
        />
    );
};
