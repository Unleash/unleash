import { ReactNode, useMemo } from 'react';
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
import { FeatureChart } from './FeedbackChart';
import { Box, Paper, Typography } from '@mui/material';
import { DateCell } from 'component/common/Table/cells/DateCell/DateCell';

const InfoCard = ({
    title,
    value,
    color,
}: {
    title: ReactNode;
    value: ReactNode;
    color?: 'success' | 'info' | 'grey';
}) => (
    <Paper
        elevation={0}
        sx={theme => ({
            p: 3,
            borderRadius: `${theme.shape.borderRadiusLarge}px`,
            background:
                color === 'success'
                    ? theme.palette.success.light
                    : theme.palette.neutral.light,
        })}
    >
        <Typography component="div" sx={{ fontWeight: 'bold', fontSize: 28 }}>
            {value}
        </Typography>
        <Typography component="div">{title}</Typography>
    </Paper>
);

export const FeatureFeedback = () => {
    const featureId = useRequiredPathParam('featureId');
    const { feedback } = useFeedbackForFeature(featureId);

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
                Header: 'Date',
                accessor: 'createdAt',
                Cell: DateCell,
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
                columns: columns as any[],
                data: feedback,
                disableSortRemove: true,
            },
            useSortBy
        );

    return (
        <PageContent>
            <Box sx={{ display: 'flex', gap: 2 }}>
                <InfoCard
                    title="Total feedback"
                    value={feedback.length}
                    color="success"
                />
                <InfoCard
                    title="Average score"
                    value={
                        (
                            feedback.reduce(
                                (acc, curr) => acc + parseInt(curr.payload, 10),
                                0
                            ) / feedback.length
                        ).toFixed(2) || 0
                    }
                />
            </Box>
            <Box sx={theme => ({ marginBottom: theme.spacing(6) })}>
                <FeatureChart feedback={feedback} />
            </Box>
            <Typography variant="h2" sx={{ my: 2 }}>
                Feedback
            </Typography>
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
