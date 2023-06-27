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
import { useFeedbackForFeature } from 'hooks/api/getters/useFeatureFeedback/useFeedbackForFeature';

export const FeatureFeedback = () => {
    const featureId = useRequiredPathParam('featureId');
    const { feedback } = useFeedbackForFeature(featureId);

    console.log({ feedback });

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
                data: feedback,
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
