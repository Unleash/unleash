import useFeedbackPosted from 'hooks/api/getters/useFeedbackPosted/useFeedbackPosted';
import { VirtualizedTable } from 'component/common/Table';
import { DateCell } from 'component/common/Table/cells/DateCell/DateCell';
import { useFlexLayout, useSortBy, useTable } from 'react-table';
import { sortTypes } from 'utils/sortTypes';
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

interface IFeedbackSchemaCellProps {
    value?: string | null; // FIXME: proper type
    row: { original: FeedbackSchema };
}

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

    const columns = [
        {
            Header: 'Feature',
            accessor: 'category',
            minWidth: 100,
            Cell: ({
                row: { original: feedback },
            }: IFeedbackSchemaCellProps) => (
                <TextCell>{feedback.category}</TextCell>
            ),
            searchable: true,
        },
        {
            Header: 'User Type',
            accessor: 'userType',
            Cell: ({
                row: { original: feedback },
            }: IFeedbackSchemaCellProps) => (
                <TextCell>{feedback.userType}</TextCell>
            ),
            searchable: true,
        },
        {
            Header: 'Score',
            accessor: 'difficultyScore',
            maxWidth: 90,
            Cell: ({
                row: { original: feedback },
            }: IFeedbackSchemaCellProps) => (
                <TextCell>{feedback.difficultyScore}</TextCell>
            ),
        },
        {
            Header: 'What do you like most?',
            accessor: 'positive',
            minWidth: 100,
            Cell: ({
                row: { original: feedback },
            }: IFeedbackSchemaCellProps) => (
                <TextCell>{feedback.positive}</TextCell>
            ),
            disableSortBy: true,
            searchable: true,
        },
        {
            Header: 'What should be improved?',
            accessor: 'areasForImprovement',
            minWidth: 100,
            Cell: ({
                row: { original: feedback },
            }: IFeedbackSchemaCellProps) => (
                <TextCell>{feedback.areasForImprovement}</TextCell>
            ),
            disableSortBy: true,
            searchable: true,
        },
        {
            Header: 'Date',
            accessor: 'createdAt',
            Cell: DateCell,
        },
    ];

    const { data, getSearchText } = useSearch(columns, searchValue, feedback);

    const activeExperiments = useMemo(() => getActiveExperiments(data), [data]);

    const { headerGroups, rows, prepareRow } = useTable(
        {
            columns: columns as any,
            data: data as object[],
            initialState: {
                sortBy: [
                    {
                        id: 'createdAt',
                        desc: true,
                    },
                ],
            },
            sortTypes,
            autoResetHiddenColumns: false,
            autoResetSortBy: false,
            disableSortRemove: true,
            disableMultiSort: true,
            defaultColumn: {
                Cell: TextCell,
            },
        },
        useSortBy,
        useFlexLayout,
    );

    const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));

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
                All feedback ({rows.length})
            </StyledSectionHeader>
            <SearchHighlightProvider value={getSearchText(searchValue)}>
                <VirtualizedTable
                    rows={rows}
                    headerGroups={headerGroups}
                    prepareRow={prepareRow}
                />
            </SearchHighlightProvider>
        </PageContent>
    );
};
