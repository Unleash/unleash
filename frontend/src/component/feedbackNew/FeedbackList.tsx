import useFeedbackPosted from 'hooks/api/getters/useFeedbackPosted/useFeedbackPosted';
import { VirtualizedTableV8 } from 'component/common/Table/VirtualizedTable/VirtualizedTableV8';
import { DateCell } from 'component/common/Table/cells/DateCell/DateCell';
import {
    type ColumnDef,
    getCoreRowModel,
    getSortedRowModel,
    useReactTable,
} from '@tanstack/react-table';
import { TextCell } from 'component/common/Table/cells/TextCell/TextCell';
import { PageContent } from 'component/common/PageContent/PageContent';
import { PageHeader } from 'component/common/PageHeader/PageHeader';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { Search } from 'component/common/Search/Search';
import { Box, styled, Typography, useMediaQuery } from '@mui/material';
import { SearchHighlightProvider } from 'component/common/Table/SearchHighlightContext/SearchHighlightContext';
import { useSearch } from 'hooks/useSearch';
import theme from 'themes/theme';
import { useState, useMemo } from 'react';
import type { FeedbackSchema } from 'openapi';
import { getActiveExperiments } from './activeExperiments.ts';

const StyledSectionHeader = styled(Typography)(({ theme }) => ({
    fontWeight: theme.fontWeight.bold,
    marginBottom: theme.spacing(1),
}));

const AverageScore = styled('div')(({ theme }) => ({
    fontSize: theme.fontSizes.mediumHeader,
}));

const ActiveExperiments = styled('div')(({ theme }) => ({
    display: 'flex',
    gap: theme.spacing(2),
    flexWrap: 'wrap',
    marginBottom: theme.spacing(4),
}));

const ActiveExperimentCard = styled('div')(({ theme }) => ({
    backgroundColor: theme.palette.secondary.light,
    borderRadius: `${theme.shape.borderRadiusLarge}px`,
    padding: theme.spacing(3),
    display: 'flex',
    alignItems: 'flex-start',
    gap: theme.spacing(10),
}));

export const FeedbackList = () => {
    const { feedback } = useFeedbackPosted();

    const [searchValue, setSearchValue] = useState('');

    const columns = useMemo<ColumnDef<FeedbackSchema, unknown>[]>(
        () => [
            {
                id: 'category',
                header: 'Feature',
                accessorKey: 'category',
                cell: ({ row: { original } }) => (
                    <TextCell>{original.category}</TextCell>
                ),
                meta: { minWidth: 100, searchable: true },
            },
            {
                id: 'userType',
                header: 'User Type',
                accessorKey: 'userType',
                cell: ({ row: { original } }) => (
                    <TextCell>{original.userType}</TextCell>
                ),
                meta: { searchable: true },
            },
            {
                id: 'difficultyScore',
                header: 'Score',
                accessorKey: 'difficultyScore',
                cell: ({ row: { original } }) => (
                    <TextCell>
                        {original.difficultyScore?.toString() ?? ''}
                    </TextCell>
                ),
                meta: { maxWidth: 90 },
            },
            {
                id: 'positive',
                header: 'What do you like most?',
                accessorKey: 'positive',
                cell: ({ row: { original } }) => (
                    <TextCell>{original.positive}</TextCell>
                ),
                enableSorting: false,
                meta: { minWidth: 100, searchable: true },
            },
            {
                id: 'areasForImprovement',
                header: 'What should be improved?',
                accessorKey: 'areasForImprovement',
                cell: ({ row: { original } }) => (
                    <TextCell>{original.areasForImprovement}</TextCell>
                ),
                enableSorting: false,
                meta: { minWidth: 100, searchable: true },
            },
            {
                id: 'createdAt',
                header: 'Date',
                accessorKey: 'createdAt',
                cell: DateCell,
            },
        ],
        [],
    );

    const { data, getSearchText } = useSearch(columns, searchValue, feedback);

    const activeExperiments = useMemo(() => getActiveExperiments(data), [data]);

    const table = useReactTable({
        columns,
        data,
        initialState: {
            sorting: [{ id: 'createdAt', desc: true }],
        },
        defaultColumn: {
            cell: ({ getValue }) => (
                <TextCell value={String(getValue() ?? '')} />
            ),
        },
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        autoResetAll: false,
        enableSortingRemoval: false,
        enableMultiSort: false,
    });

    const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));
    const rowCount = table.getRowModel().rows.length;

    return (
        <PageContent
            header={
                <PageHeader
                    title={'Feedback'}
                    actions={
                        <>
                            <ConditionallyRender
                                condition={!isSmallScreen}
                                show={
                                    <>
                                        <Search
                                            initialValue={searchValue}
                                            onChange={setSearchValue}
                                        />
                                        <PageHeader.Divider />
                                    </>
                                }
                            />
                        </>
                    }
                >
                    <ConditionallyRender
                        condition={isSmallScreen}
                        show={
                            <Search
                                initialValue={searchValue}
                                onChange={setSearchValue}
                            />
                        }
                    />
                </PageHeader>
            }
        >
            <StyledSectionHeader>Active experiments</StyledSectionHeader>
            <ActiveExperiments>
                {activeExperiments.length > 0 ? (
                    activeExperiments.map((experiment) => (
                        <ActiveExperimentCard key={experiment.category}>
                            <Box>
                                <StyledSectionHeader>
                                    {experiment.category}
                                </StyledSectionHeader>
                                <Box>{experiment.commentCount} comments</Box>
                            </Box>
                            <AverageScore>
                                {/* biome-ignore lint/suspicious/noGlobalIsNan: using isNaN to check if averageScore is not a number */}
                                {isNaN(Number(experiment.averageScore))
                                    ? 'N/A'
                                    : `${experiment.averageScore}/7`}
                            </AverageScore>
                        </ActiveExperimentCard>
                    ))
                ) : (
                    <Box sx={{ py: 2 }}>
                        No feedback data from the last three months
                    </Box>
                )}
            </ActiveExperiments>
            <StyledSectionHeader>
                All feedback ({rowCount})
            </StyledSectionHeader>
            <SearchHighlightProvider value={getSearchText(searchValue)}>
                <VirtualizedTableV8 tableInstance={table} />
            </SearchHighlightProvider>
        </PageContent>
    );
};
