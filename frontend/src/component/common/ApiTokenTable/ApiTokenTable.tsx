import type { Row, HeaderGroup } from 'react-table';
import { TablePlaceholder, VirtualizedTable } from 'component/common/Table';
import { Box, useMediaQuery, Link } from '@mui/material';
import { SearchHighlightProvider } from 'component/common/Table/SearchHighlightContext/SearchHighlightContext';
import { ApiTokenDocs } from 'component/admin/apiToken/ApiTokenDocs/ApiTokenDocs';

import theme from 'themes/theme';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';

import { useConditionallyHiddenColumns } from 'hooks/useConditionallyHiddenColumns';

const hiddenColumnsNotExtraLarge = ['Icon', 'createdAt', 'seenAt'];
const hiddenColumnsCompact = ['Icon', 'project', 'seenAt'];

interface IApiTokenTableProps {
    compact?: boolean;
    loading: boolean;
    setHiddenColumns: (param: any) => void;
    columns: any[];
    rows: Row<object>[];
    prepareRow: (row: Row<object>) => void;
    headerGroups: HeaderGroup<object>[];
    globalFilter: any;
}

export const ApiTokenTable = ({
    compact = false,
    setHiddenColumns,
    columns,
    loading,
    rows,
    headerGroups,
    globalFilter,
    prepareRow,
}: IApiTokenTableProps) => {
    const isNotExtraLarge = useMediaQuery(theme.breakpoints.down('xl'));

    useConditionallyHiddenColumns(
        [
            {
                condition: isNotExtraLarge,
                columns: hiddenColumnsNotExtraLarge,
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
            <ConditionallyRender
                condition={rows.length > 0}
                show={
                    <Box sx={{ mb: 4 }}>
                        <ApiTokenDocs />
                    </Box>
                }
            />
            <Box sx={{ overflowX: 'auto' }}>
                <SearchHighlightProvider value={globalFilter}>
                    <VirtualizedTable
                        rows={rows}
                        headerGroups={headerGroups}
                        prepareRow={prepareRow}
                    />
                </SearchHighlightProvider>
            </Box>
            <ConditionallyRender
                condition={rows.length === 0 && !loading}
                show={
                    <ConditionallyRender
                        condition={globalFilter?.length > 0}
                        show={
                            <TablePlaceholder>
                                No tokens found matching &ldquo;
                                {globalFilter}
                                &rdquo;
                            </TablePlaceholder>
                        }
                        elseShow={
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
                }
            />
        </>
    );
};
