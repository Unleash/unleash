import { useMemo } from 'react';
import { useSortBy, useTable } from 'react-table';
import {
    SortableTableHeader,
    Table,
    TableBody,
    TableCell,
    TableRow,
} from 'component/common/Table';
import { usePageTitle } from 'hooks/usePageTitle';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import { GetFeatureFeedbackSchema } from 'openapi';
import { PageContent } from 'component/common/PageContent/PageContent';
import { TextCell } from 'component/common/Table/cells/TextCell/TextCell';

const mock: GetFeatureFeedbackSchema[] = [
    {
        id: 1,
        featureName: 'Feature 1',
        payload: '3',
        createdAt: '2021-09-01T00:00:00.000Z',
    },
    {
        id: 2,
        featureName: 'Feature 2',
        payload: '2',
        createdAt: '2021-09-01T00:00:00.000Z',
    },
    {
        id: 3,
        featureName: 'Feature 3',
        payload: '4',
        createdAt: '2021-09-01T00:00:00.000Z',
    },
];

export const FeatureFeedback = () => {
    const featureId = useRequiredPathParam('featureId');
    usePageTitle('Feature Feedback');
    const columns = useMemo(
        () => [
            {
                Header: 'ID',
                accessor: (row: GetFeatureFeedbackSchema) =>
                    row.contextHash || row.id,
                Cell: ({ value }: { value: string }) => (
                    <TextCell>{value}</TextCell>
                ),
            },
            {
                Header: 'Payload',
                accessor: 'payload',
                Cell: ({ value }: { value: string }) => (
                    <TextCell>{value}</TextCell>
                ),
            },
        ],
        []
    );
    const { headerGroups, rows, prepareRow, getTableProps, getTableBodyProps } =
        useTable(
            {
                columns: columns as any[], // TODO: fix after `react-table` v8 update
                data: mock,
                disableSortRemove: true,
            },
            useSortBy
        );

    return (
        <PageContent>
            <Table {...getTableProps()}>
                <SortableTableHeader headerGroups={headerGroups as any} />
                <TableBody {...getTableBodyProps()}>
                    {rows.map(row => {
                        prepareRow(row);
                        return (
                            <TableRow key={row.id}>
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
