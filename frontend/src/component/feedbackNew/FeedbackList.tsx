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
import { useMediaQuery } from '@mui/material';
import { SearchHighlightProvider } from 'component/common/Table/SearchHighlightContext/SearchHighlightContext';
import { useSearch } from 'hooks/useSearch';
import theme from 'themes/theme';
import { useState } from 'react';
import type { FeedbackSchema } from 'openapi';

interface IFeedbackSchemaCellProps {
    value?: string | null; // FIXME: proper type
    row: { original: FeedbackSchema };
}

export const FeedbackList = () => {
    const { feedback } = useFeedbackPosted();

    const [searchValue, setSearchValue] = useState('');

    const columns = [
        {
            Header: 'Category',
            accessor: 'category',
            Cell: ({
                row: { original: feedback },
            }: IFeedbackSchemaCellProps) => (
                <TextCell>{feedback.category}</TextCell>
            ),
            searchable: true,
        },
        {
            Header: 'UserType',
            accessor: 'userType',
            Cell: ({
                row: { original: feedback },
            }: IFeedbackSchemaCellProps) => (
                <TextCell>{feedback.userType}</TextCell>
            ),
            searchable: true,
        },
        {
            Header: 'DifficultyScore',
            accessor: 'difficultyScore',
            Cell: ({
                row: { original: feedback },
            }: IFeedbackSchemaCellProps) => (
                <TextCell>{feedback.difficultyScore}</TextCell>
            ),
        },
        {
            Header: 'Positive',
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
            Header: 'Areas for improvement',
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
            Header: 'Created at',
            accessor: 'createdAt',
            Cell: DateCell,
        },
    ];

    const { data, getSearchText } = useSearch(columns, searchValue, feedback);

    const { headerGroups, rows, prepareRow } = useTable(
        {
            columns: columns as any,
            data,
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
                    title={`Feedbacks posted (${rows.length})`}
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
