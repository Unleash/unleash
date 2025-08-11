import { VirtualizedTable } from 'component/common/Table';
import { FavoriteIconCell } from 'component/common/Table/cells/FavoriteIconCell/FavoriteIconCell';
import { HighlightCell } from 'component/common/Table/cells/HighlightCell/HighlightCell';
import { TextCell } from 'component/common/Table/cells/TextCell/TextCell';
import { TimeAgoCell } from 'component/common/Table/cells/TimeAgoCell/TimeAgoCell';
import { ProjectOwners } from 'component/project/ProjectCard/ProjectCardFooter/ProjectOwners/ProjectOwners';
import { useFavoriteProjectsApi } from 'hooks/api/actions/useFavoriteProjectsApi/useFavoriteProjectsApi';
import useProjects from 'hooks/api/getters/useProjects/useProjects';
import type { ProjectSchema, ProjectSchemaOwners } from 'openapi';
import { useCallback, useMemo } from 'react';
import { useFlexLayout, useTable } from 'react-table';
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
                Cell: ProjectsListTableNameCell,
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
                width: 150,
            },
            {
                Header: 'Flags',
                accessor: 'featureCount',
                Cell: ({ value }: { value: number }) => (
                    <TextCell>
                        {value} flag{value === 1 ? '' : 's'}
                    </TextCell>
                ),
                width: 90,
            },
            {
                Header: 'Technical debt',
                accessor: 'technicalDebt',
                Cell: ({ value }: { value: number }) => (
                    <TextCell>{value}%</TextCell>
                ),
                width: 130,
            },
            {
                Header: 'Last seen',
                accessor: 'lastReportedFlagUsage',
                Cell: ({ value }: { value: Date }) => (
                    <ProjectListTableLastSeenCell
                        value={value}
                        hideLabel={isMediumScreen}
                    />
                ),
                width: isMediumScreen ? 100 : 140,
            },
            {
                Header: 'Owner',
                accessor: 'owners',
                Cell: ({ value }: { value: ProjectSchemaOwners }) => (
                    <TextCell>
                        <ProjectOwners
                            owners={value?.filter(
                                (owner) => owner.ownerType !== 'system',
                            )}
                        />
                    </TextCell>
                ),
            },
            {
                Header: 'Members',
                accessor: 'memberCount',
                Cell: ({ value }: { value: number }) => (
                    <TextCell>{value} members</TextCell>
                ),
                width: 120,
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
