import { useMemo } from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import { useSortBy, useTable } from 'react-table';
import { sortTypes } from 'utils/sortTypes';
import { PageContent } from 'component/common/PageContent/PageContent';
import useFeatureTypes from 'hooks/api/getters/useFeatureTypes/useFeatureTypes';
import { PageHeader } from 'component/common/PageHeader/PageHeader';
import { Box, Typography, useMediaQuery, useTheme } from '@mui/material';
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
import { useConditionallyHiddenColumns } from 'hooks/useConditionallyHiddenColumns';
import { SidebarModal } from 'component/common/SidebarModal/SidebarModal';
import { FeatureTypeForm } from './FeatureTypeForm/FeatureTypeForm';

const basePath = '/feature-toggle-type';

export const FeatureTypesList = () => {
    const { featureTypes, loading } = useFeatureTypes();
    const theme = useTheme();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));
    const navigate = useNavigate();

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
                width: 50,
                disableSortBy: true,
            },
            {
                Header: 'Name',
                accessor: 'name',
                minWidth: 125,
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
                                onClick={() =>
                                    navigate(
                                        `/feature-toggle-type/edit/${featureType.id}`
                                    )
                                }
                                permission={ADMIN}
                                tooltipProps={{
                                    title: `Edit ${featureType.name} feature toggle type`,
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
        [navigate]
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

    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        rows,
        prepareRow,
        setHiddenColumns,
    } = useTable(
        {
            columns: columns as any[],
            data,
            sortTypes,
            autoResetSortBy: false,
            disableSortRemove: true,
        },
        useSortBy
    );

    useConditionallyHiddenColumns(
        [
            {
                condition: isSmallScreen,
                columns: ['description'],
            },
        ],
        setHiddenColumns,
        columns
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
            <Routes>
                <Route
                    path="edit/:featureTypeId"
                    element={
                        <SidebarModal
                            label="Edit feature toggle type"
                            onClose={() => navigate(basePath)}
                            open
                        >
                            <FeatureTypeForm
                                featureTypes={featureTypes}
                                loading={loading}
                            />
                        </SidebarModal>
                    }
                />
            </Routes>
        </PageContent>
    );
};
