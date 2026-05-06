import type { Table as TableType, ColumnDef } from '@tanstack/react-table';
import { TablePlaceholder } from 'component/common/Table';
import { VirtualizedTable } from 'component/common/Table/VirtualizedTable/VirtualizedTable';
import { Box, useMediaQuery, Link, styled, Typography } from '@mui/material';
import { SearchHighlightProvider } from 'component/common/Table/SearchHighlightContext/SearchHighlightContext';
import { ApiTokenDocs } from 'component/admin/apiToken/ApiTokenDocs/ApiTokenDocs';

import theme from 'themes/theme';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';

import { useConditionallyHiddenColumns } from 'hooks/useConditionallyHiddenColumns';
import { ApiUrls } from 'component/admin/apiToken/ApiUrls/ApiUrls';
import type { IApiToken } from 'hooks/api/getters/useApiTokens/useApiTokens';

const hiddenColumnsNotExtraLarge = ['Icon', 'createdAt', 'seenAt'];
const hiddenColumnsCompact = ['Icon', 'project', 'seenAt'];

interface IApiTokenTableProps {
    compact?: boolean;
    loading: boolean;
    table: TableType<IApiToken>;
    columns: ColumnDef<IApiToken, unknown>[];
    globalFilter: string;
}

const StyledTitle = styled(Typography)(({ theme }) => ({
    margin: 0,
    marginBottom: theme.spacing(1.5),
    fontSize: theme.fontSizes.smallBody,
    color: theme.palette.text.primary,
}));

export const ApiTokenTable = ({
    compact = false,
    table,
    columns,
    loading,
    globalFilter,
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
        table.setColumnVisibility,
        columns,
    );

    const rowCount = table.getRowModel().rows.length;

    return (
        <>
            <ConditionallyRender
                condition={rowCount > 0}
                show={
                    <Box sx={{ mb: 4 }}>
                        <ApiTokenDocs />
                        <Box sx={{ marginBlock: 4 }}>
                            <StyledTitle variant='h2'>API URLs</StyledTitle>
                            <ApiUrls compact={compact} />
                        </Box>
                    </Box>
                }
            />
            <Box sx={{ overflowX: 'auto' }}>
                <StyledTitle variant='h2'>API Tokens</StyledTitle>
                <SearchHighlightProvider value={globalFilter}>
                    <VirtualizedTable tableInstance={table} />
                </SearchHighlightProvider>
            </Box>
            <ConditionallyRender
                condition={rowCount === 0 && !loading}
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
                                        href='https://docs.getunleash.io/api'
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
