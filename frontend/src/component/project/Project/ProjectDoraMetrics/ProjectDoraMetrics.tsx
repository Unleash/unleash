import {
    Alert,
    Box,
    Button,
    Divider,
    List,
    ListItem,
    Typography,
} from '@mui/material';
import { useProjectDoraMetrics } from 'hooks/api/getters/useProjectDoraMetrics/useProjectDoraMetrics';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import { useMemo } from 'react';
import { useTable, useGlobalFilter, useSortBy } from 'react-table';
import {
    Table,
    SortableTableHeader,
    TableBody,
    TableCell,
    TableRow,
    TablePlaceholder,
} from 'component/common/Table';
import { PageContent } from 'component/common/PageContent/PageContent';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { PageHeader } from 'component/common/PageHeader/PageHeader';
import { Badge } from 'component/common/Badge/Badge';
import { usePlausibleTracker } from 'hooks/usePlausibleTracker';
import { ChatBubble, PermMedia, Send } from '@mui/icons-material';
import { Separator } from 'component/changeRequest/ChangeRequestSidebar/ChangeRequestSidebar';

const resolveDoraMetrics = (input: number) => {
    const ONE_MONTH = 30;
    const ONE_WEEK = 7;

    if (input >= ONE_MONTH) {
        return <Badge color="error">Low</Badge>;
    }

    if (input <= ONE_MONTH && input >= ONE_WEEK + 1) {
        return <Badge>Medium</Badge>;
    }

    if (input <= ONE_WEEK) {
        return <Badge color="success">High</Badge>;
    }
};

export const ProjectDoraMetrics = () => {
    const projectId = useRequiredPathParam('projectId');
    const { trackEvent } = usePlausibleTracker();

    const { dora, loading } = useProjectDoraMetrics(projectId);

    const data = useMemo(() => {
        if (loading) {
            return Array(5).fill({
                name: 'Featurename',
                timeToProduction: 'Data for production',
            });
        }

        return dora.features;
    }, [dora, loading]);

    const columns = useMemo(
        () => [
            {
                Header: 'Name',
                accessor: 'name',
                width: '50%',
                Cell: ({
                    row: {
                        original: { name },
                    },
                }: any) => {
                    return (
                        <Box
                            data-loading
                            sx={{
                                pl: 2,
                                pr: 1,
                                paddingTop: 2,
                                paddingBottom: 2,
                                display: 'flex',
                                alignItems: 'center',
                            }}
                        >
                            {name}
                        </Box>
                    );
                },
                sortType: 'alphanumeric',
            },
            {
                Header: 'Time to production',
                id: 'Time to production',
                align: 'center',
                Cell: ({ row: { original } }: any) => (
                    <Box
                        sx={{ display: 'flex', justifyContent: 'center' }}
                        data-loading
                    >
                        {original.timeToProduction} days
                    </Box>
                ),
                width: 150,
                disableGlobalFilter: true,
                disableSortBy: true,
            },
            {
                Header: 'DORA',
                id: 'dora',
                align: 'center',
                Cell: ({ row: { original } }: any) => (
                    <Box
                        sx={{ display: 'flex', justifyContent: 'center' }}
                        data-loading
                    >
                        {resolveDoraMetrics(original.timeToProduction)}
                    </Box>
                ),
                width: 200,
                disableGlobalFilter: true,
                disableSortBy: true,
            },
        ],
        [JSON.stringify(dora.features), loading]
    );

    const initialState = useMemo(
        () => ({
            sortBy: [{ id: 'name', desc: false }],
            hiddenColumns: ['description'],
        }),
        []
    );

    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        rows,
        prepareRow,
        state: { globalFilter },
    } = useTable(
        {
            columns: columns as any[], // TODO: fix after `react-table` v8 update
            data,
            initialState,
            autoResetGlobalFilter: false,
            autoResetSortBy: false,
            disableSortRemove: true,
        },
        useGlobalFilter,
        useSortBy
    );

    return (
        <>
            <Box
                sx={theme => ({
                    backgroundColor: theme.palette.background.paper,
                    padding: theme.spacing(2, 4),
                    borderRadius: theme.shape.borderRadius,
                    marginBottom: theme.spacing(2),
                })}
            >
                <h3>We are trying something experimental!</h3>
                <Typography>
                    {' '}
                    We are considering adding project metrics to see how a
                    project performs. As a first step, we have added a lead time
                    for changes indicator that is calculated per feature toggle
                    based on the creation of the feature toggle and when it was
                    first turned on in an environment of type production. Is
                    this useful to you?
                </Typography>

                <Box sx={{ marginTop: '1rem' }}>
                    <Button
                        sx={{ marginRight: '0.5rem' }}
                        variant="contained"
                        color="primary"
                    >
                        Yes, I like the direction
                    </Button>
                    <Button variant="outlined" color="primary">
                        No, I don't see value in this
                    </Button>
                </Box>

                <Divider sx={theme => ({ marginTop: theme.spacing(2.5) })} />
                <Box sx={{ display: 'flex' }}>
                    <Box
                        sx={theme => ({
                            display: 'flex',
                            alignItems: 'center',
                            marginTop: theme.spacing(2),
                            marginRight: theme.spacing(3),
                        })}
                    >
                        <PermMedia
                            color="primary"
                            sx={theme => ({ marginRight: theme.spacing(1) })}
                        />{' '}
                        <a>View sketches</a>
                    </Box>

                    <Box
                        sx={theme => ({
                            display: 'flex',
                            alignItems: 'center',
                            marginTop: theme.spacing(2),
                            marginRight: theme.spacing(3),
                        })}
                    >
                        <ChatBubble
                            color="primary"
                            sx={theme => ({ marginRight: theme.spacing(1) })}
                        />{' '}
                        <a>Leave comment</a>
                    </Box>

                    <Box
                        sx={theme => ({
                            display: 'flex',
                            alignItems: 'center',
                            marginTop: theme.spacing(2),
                        })}
                    >
                        <Send
                            color="primary"
                            sx={theme => ({ marginRight: theme.spacing(1) })}
                        />{' '}
                        <a>Get involved with our UX team</a>
                    </Box>
                </Box>
            </Box>

            <PageContent
                isLoading={loading}
                header={
                    <PageHeader
                        title={`Lead time for changes (per feature toggle)`}
                    />
                }
            >
                <Table {...getTableProps()}>
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
                <ConditionallyRender
                    condition={rows.length === 0}
                    show={
                        <ConditionallyRender
                            condition={globalFilter?.length > 0}
                            show={
                                <TablePlaceholder>
                                    No features with data found &ldquo;
                                    {globalFilter}
                                    &rdquo;
                                </TablePlaceholder>
                            }
                        />
                    }
                />
            </PageContent>
        </>
    );
};
