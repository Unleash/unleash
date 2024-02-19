import {
    Row,
    TablePropGetter,
    TableProps,
    TableBodyPropGetter,
    TableBodyProps,
    HeaderGroup,
} from 'react-table';
import {
    SortableTableHeader,
    TableCell,
    TablePlaceholder,
} from 'component/common/Table';
import {
    Box,
    Table,
    TableBody,
    TableRow,
    useMediaQuery,
    Link,
} from '@mui/material';
import { SearchHighlightProvider } from 'component/common/Table/SearchHighlightContext/SearchHighlightContext';
import { ApiTokenDocs } from 'component/admin/apiToken/ApiTokenDocs/ApiTokenDocs';

import theme from 'themes/theme';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';

import { useConditionallyHiddenColumns } from 'hooks/useConditionallyHiddenColumns';

const hiddenColumnsSmall = ['Icon', 'createdAt'];
const hiddenColumnsCompact = ['Icon', 'project', 'seenAt'];

type ConnectedInstancesTableProps = {
    compact?: boolean;
    loading: boolean;
    setHiddenColumns: (param: any) => void;
    columns: any[];
    rows: Row<object>[];
    prepareRow: (row: Row<object>) => void;
    getTableProps: (
        propGetter?: TablePropGetter<object> | undefined,
    ) => TableProps;
    getTableBodyProps: (
        propGetter?: TableBodyPropGetter<object> | undefined,
    ) => TableBodyProps;
    headerGroups: HeaderGroup<object>[];
    globalFilter: any;
};
export const ConnectedInstancesTable = ({
    compact = false,
    setHiddenColumns,
    columns,
    loading,
    rows,
    getTableProps,
    getTableBodyProps,
    headerGroups,
    globalFilter,
    prepareRow,
}: ConnectedInstancesTableProps) => {
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));

    useConditionallyHiddenColumns(
        [
            {
                condition: isSmallScreen,
                columns: hiddenColumnsSmall,
            },
            {
                condition: compact,
                columns: hiddenColumnsCompact,
            },
        ],
        setHiddenColumns,
        columns,
    );

    return (
        <>
            <Box sx={{ overflowX: 'auto' }}>
                <Table {...getTableProps()}>
                    <SortableTableHeader headerGroups={headerGroups as any} />
                    <TableBody {...getTableBodyProps()}>
                        {rows.map((row) => {
                            prepareRow(row);
                            return (
                                <TableRow hover {...row.getRowProps()}>
                                    {row.cells.map((cell) => (
                                        <TableCell {...cell.getCellProps()}>
                                            {cell.render('Cell')}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </Box>
            <ConditionallyRender
                condition={rows.length === 0 && !loading}
                show={
                    <TablePlaceholder>
                        <span>
                            {'No tokens available. Read '}
                            <Link
                                href='https://docs.getunleash.io/how-to/api'
                                target='_blank'
                                rel='noreferrer'
                            >
                                API How-to guides
                            </Link>{' '}
                            {' to learn more.'}
                        </span>
                    </TablePlaceholder>
                }
            />
        </>
    );
};
