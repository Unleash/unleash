import type { Row, HeaderGroup } from 'react-table';
import { TablePlaceholder, VirtualizedTable } from 'component/common/Table';
import { Box, useMediaQuery, Link, styled, Typography } from '@mui/material';
import { SearchHighlightProvider } from 'component/common/Table/SearchHighlightContext/SearchHighlightContext';
import { ApiTokenDocs } from 'component/admin/apiToken/ApiTokenDocs/ApiTokenDocs';

import theme from 'themes/theme';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';

import { useConditionallyHiddenColumns } from 'hooks/useConditionallyHiddenColumns';
import { ApiUrls } from 'component/admin/apiToken/ApiUrls/ApiUrls';

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

const StyledTitle = styled(Typography)(({ theme }) => ({
    margin: 0,
    marginBottom: theme.spacing(1.5),
    fontSize: theme.fontSizes.smallBody,
    // fontWeight: theme.fontWeight.thin,
    color: theme.palette.text.primary,
}));

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
                                        href='https://docs.getunleash.io/api-overview'
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
