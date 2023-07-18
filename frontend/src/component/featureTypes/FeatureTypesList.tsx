import { useMemo } from 'react';
import { useSortBy, useTable } from 'react-table';
import { sortTypes } from 'utils/sortTypes';
import { PageContent } from 'component/common/PageContent/PageContent';
import useFeatureTypes from 'hooks/api/getters/useFeatureTypes/useFeatureTypes';
import { PageHeader } from 'component/common/PageHeader/PageHeader';
import { Box, Typography } from '@mui/material';
import {
    Table,
    TableBody,
    TableCell,
    TableRow,
    SortableTableHeader,
} from 'component/common/Table';
import { TextCell } from 'component/common/Table/cells/TextCell/TextCell';
import { getFeatureTypeIcons } from 'utils/getFeatureTypeIcons';
import { IconCell } from 'component/common/Table/cells/IconCell/IconCell';
import { ActionCell } from 'component/common/Table/cells/ActionCell/ActionCell';
import PermissionIconButton from 'component/common/PermissionIconButton/PermissionIconButton';
import { ADMIN } from 'component/providers/AccessProvider/permissions';
import { Edit } from '@mui/icons-material';

export const FeatureTypesList = () => {
    const { featureTypes, error, loading } = useFeatureTypes();

    // FIXME: hide description on small screens?
    const columns = useMemo(
        () => [
            {
                accessor: 'id',
                Cell: ({ value }: { value: string }) => {
                    const IconComponent = getFeatureTypeIcons(value);
                    return (
                        <IconCell
                            icon={
                                <IconComponent
                                    data-loading="true"
                                    color="action"
                                />
                            }
                        />
                    );
                },
                disableSortBy: true,
            },
            {
                Header: 'Name',
                accessor: 'name',
                minWidth: 150,
                Cell: TextCell,
            },
            {
                Header: 'Description',
                accessor: 'description',
                width: '80%',
                Cell: ({ value }: { value: string }) => (
                    <Typography
                        component="div"
                        variant="body2"
                        color="text.secondary"
                        lineHeight={2}
                    >
                        <TextCell lineClamp={1}>{value}</TextCell>
                    </Typography>
                ),
                disableSortBy: true,
            },
            {
                Header: 'Lifetime',
                accessor: 'lifetimeDays',
                Cell: ({ value }: { value: number }) => {
                    if (value) {
                        return (
                            <TextCell>
                                {value === 1 ? '1 day' : `${value} days`}
                            </TextCell>
                        );
                    }

                    return <TextCell>doesn't expire</TextCell>;
                },
                sortInverted: true,
                minWidth: 150,
            },
            {
                Header: 'Actions',
                Cell: ({ row: { original: featureType } }: any) => (
                    <Box sx={theme => ({ padding: theme.spacing(0.5, 0) })}>
                        <ActionCell>
                            <PermissionIconButton
                                disabled={!featureType.id}
                                data-loading="true"
                                onClick={() => {}}
                                permission={ADMIN}
                                tooltipProps={{
                                    title: 'Edit feature toggle type',
                                }}
                            >
                                <Edit />
                            </PermissionIconButton>
                        </ActionCell>
                    </Box>
                ),
                disableSortBy: true,
            },
        ],
        []
    );

    const data = useMemo(
        () =>
            loading
                ? Array(5).fill({
                      id: '',
                      name: 'Loading...',
                      description: 'Loading...',
                      lifetimeDays: 1,
                  })
                : featureTypes,
        [loading, featureTypes]
    );

    const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
        useTable(
            {
                columns: columns as any[],
                data,
                sortTypes,
                autoResetSortBy: false,
                disableSortRemove: true,
            },
            useSortBy
        );

    return (
        <PageContent
            isLoading={loading}
            header={
                <PageHeader>
                    <Typography
                        component="h2"
                        sx={theme => ({
                            fontSize: theme.fontSizes.mainHeader,
                        })}
                    >
                        Feature toggle types
                    </Typography>
                </PageHeader>
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
        </PageContent>
    );
};
