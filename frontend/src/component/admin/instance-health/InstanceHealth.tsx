import { VFC, useMemo } from 'react';
import { useSortBy, useTable } from 'react-table';
import { styled, Typography, Box } from '@mui/material';
import { PageContent } from 'component/common/PageContent/PageContent';
import { PageHeader } from 'component/common/PageHeader/PageHeader';
import { useInstanceStats } from 'hooks/api/getters/useInstanceStats/useInstanceStats';
import useProjects from 'hooks/api/getters/useProjects/useProjects';
import { sortTypes } from 'utils/sortTypes';
import {
    SortableTableHeader,
    Table,
    TableBody,
    TableRow,
    TableCell,
} from 'component/common/Table';
import { TextCell } from 'component/common/Table/cells/TextCell/TextCell';
import { HelpPopper } from 'component/project/Project/ProjectStats/HelpPopper';
import { StatusBox } from 'component/project/Project/ProjectStats/StatusBox';
import { DateCell } from 'component/common/Table/cells/DateCell/DateCell';

interface IInstanceHealthProps {}

const CardsGrid = styled('div')(({ theme }) => ({
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: theme.spacing(2),
    paddingBottom: theme.spacing(2),
}));

const Card = styled('div')(({ theme }) => ({
    padding: theme.spacing(2.5),
    borderRadius: `${theme.shape.borderRadiusLarge}px`,
    backgroundColor: `${theme.palette.background.paper}`,
    border: `1px solid ${theme.palette.divider}`,
    // boxShadow: theme.boxShadows.card,
    display: 'flex',
    flexDirection: 'column',
}));

/**
 * @deprecated unify with project widget
 */
const StyledWidget = styled(Box)(({ theme }) => ({
    position: 'relative',
    padding: theme.spacing(3),
    backgroundColor: theme.palette.background.paper,
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: `${theme.shape.borderRadiusLarge}px`,
    [theme.breakpoints.down('lg')]: {
        padding: theme.spacing(2),
    },
}));

export const InstanceHealth: VFC<IInstanceHealthProps> = () => {
    const { stats } = useInstanceStats();
    const { projects } = useProjects();
    // FIXME: loading state

    const initialState = useMemo(
        () => ({
            hiddenColumns: [],
            sortBy: [{ id: 'createdAt' }],
        }),
        []
    );

    const data = useMemo(() => projects, [projects]);

    const dormantUsersPercentage =
        (1 - stats?.activeUsers?.last90! / stats?.users!) * 100;

    const dormantUsersColor =
        dormantUsersPercentage < 30
            ? 'success.main'
            : dormantUsersPercentage < 50
            ? 'warning.main'
            : 'error.main';

    const COLUMNS = useMemo(
        () => [
            {
                accessor: 'name',
                Header: 'Project name',
                Cell: TextCell,
                width: '80%',
            },
            {
                Header: 'Feature toggles',
                accessor: 'featureCount',
                Cell: TextCell,
            },
            {
                Header: 'Created at',
                accessor: 'createdAt',
                Cell: DateCell,
            },
            {
                Header: 'Members',
                accessor: 'memberCount',
                Cell: TextCell,
            },
            {
                Header: 'Health',
                accessor: 'health',
                Cell: ({ value }: { value: number }) => {
                    const healthRatingColor =
                        value < 50
                            ? 'error.main'
                            : value < 75
                            ? 'warning.main'
                            : 'success.main';
                    return (
                        <TextCell>
                            <Typography
                                component="span"
                                sx={{ color: healthRatingColor }}
                            >
                                {value}%
                            </Typography>
                        </TextCell>
                    );
                },
            },
        ],
        []
    );

    const { headerGroups, rows, prepareRow, getTableProps, getTableBodyProps } =
        useTable(
            {
                columns: COLUMNS as any,
                data: data as any,
                initialState,
                sortTypes,
                autoResetGlobalFilter: false,
                autoResetHiddenColumns: false,
                autoResetSortBy: false,
                disableSortRemove: true,
            },
            useSortBy
        );

    return (
        <>
            <CardsGrid>
                <Card>
                    <StatusBox
                        title="User accounts"
                        boxText={String(stats?.users)}
                        customChangeElement={<></>}
                    >
                        {/* <HelpPopper id="user-accounts">
                            Sum of all configuration and state modifications in
                            the project.
                        </HelpPopper> */}
                        {/* FIXME: tooltip */}
                    </StatusBox>
                </Card>
                <Card>
                    <StatusBox
                        title="Dormant users"
                        boxText={String(
                            stats?.users! - stats?.activeUsers?.last90!
                        )}
                        customChangeElement={
                            <Typography
                                component="span"
                                sx={{ color: dormantUsersColor }}
                            >
                                ({dormantUsersPercentage.toFixed(1)}%)
                            </Typography>
                        }
                    >
                        {/* <HelpPopper id="dormant-users">
                            Sum of all configuration and state modifications in
                            the project.
                        </HelpPopper> */}
                    </StatusBox>
                </Card>
                <Card>
                    <StatusBox
                        title="Number of projects"
                        boxText={String(projects?.length)}
                        customChangeElement={<></>}
                    ></StatusBox>
                </Card>
                <Card>
                    <StatusBox
                        title="Number of feature toggles"
                        boxText={String(stats?.featureToggles)}
                        customChangeElement={<></>}
                    ></StatusBox>
                </Card>
            </CardsGrid>
            <PageContent header={<PageHeader title="Health per project" />}>
                <Table {...getTableProps()} rowHeight="standard">
                    <SortableTableHeader headerGroups={headerGroups} />
                    <TableBody {...getTableBodyProps()}>
                        {rows.map(row => {
                            prepareRow(row);
                            return (
                                <TableRow hover {...row.getRowProps()}>
                                    {row.cells.map(cell => (
                                        <TableCell {...cell.getCellProps()}>
                                            {cell.render('Cell')}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </PageContent>
        </>
    );
};
