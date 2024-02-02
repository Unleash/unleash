import useFeedbackPosted from '../../hooks/api/getters/useFeedbackPosted/useFeedbackPosted';
import { VirtualizedTable } from '../common/Table';
import { DateCell } from '../common/Table/cells/DateCell/DateCell';
import { useFlexLayout, useSortBy, useTable } from 'react-table';
import { sortTypes } from '../../utils/sortTypes';
import { TextCell } from '../common/Table/cells/TextCell/TextCell';
import { PageContent } from '../common/PageContent/PageContent';
import { PageHeader } from '../common/PageHeader/PageHeader';
import { ConditionallyRender } from '../common/ConditionallyRender/ConditionallyRender';
import { Search } from '../common/Search/Search';
import { useMediaQuery } from '@mui/material';
import { SearchHighlightProvider } from '../common/Table/SearchHighlightContext/SearchHighlightContext';
import { useSearch } from '../../hooks/useSearch';
import theme from 'themes/theme';
import { useState } from 'react';

export const FeedbackList = () => {
    const { feedback } = useFeedbackPosted();

    const [searchValue, setSearchValue] = useState('');

    const columns = [
        {
            Header: 'Category',
            accessor: 'category',
            Cell: ({ row: { original: feedback } }: any) => (
                <TextCell>{feedback.category}</TextCell>
            ),
            searchable: true,
        },
        {
            Header: 'UserType',
            accessor: 'userType',
            Cell: ({ row: { original: feedback } }: any) => (
                <TextCell>{feedback.userType}</TextCell>
            ),
            searchable: true,
        },
        {
            Header: 'DifficultyScore',
            accessor: 'difficultyScore',
            Cell: ({ row: { original: feedback } }: any) => (
                <TextCell>{feedback.difficultyScore}</TextCell>
            ),
        },
        {
            Header: 'Positive',
            accessor: 'positive',
            minWidth: 100,
            Cell: ({ row: { original: feedback } }: any) => (
                <TextCell>{feedback.positive}</TextCell>
            ),
            disableSortBy: true,
            searchable: true,
        },
        {
            Header: 'Areas for improvement',
            accessor: 'areasForImprovement',
            minWidth: 100,
            Cell: ({ row: { original: feedback } }: any) => (
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
