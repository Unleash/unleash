import { Delete } from '@mui/icons-material';
import {
    Alert,
    Button,
    IconButton,
    styled,
    Tooltip,
    Typography,
    useMediaQuery,
    useTheme,
} from '@mui/material';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { PageContent } from 'component/common/PageContent/PageContent';
import { PageHeader } from 'component/common/PageHeader/PageHeader';
import { Search } from 'component/common/Search/Search';
import { TablePlaceholder, VirtualizedTable } from 'component/common/Table';
import { ActionCell } from 'component/common/Table/cells/ActionCell/ActionCell';
import { DateCell } from 'component/common/Table/cells/DateCell/DateCell';
import { HighlightCell } from 'component/common/Table/cells/HighlightCell/HighlightCell';
import { SearchHighlightProvider } from 'component/common/Table/SearchHighlightContext/SearchHighlightContext';
import { usePersonalAPITokens } from 'hooks/api/getters/usePersonalAPITokens/usePersonalAPITokens';
import { useSearch } from 'hooks/useSearch';
import {
    INewPersonalAPIToken,
    IPersonalAPIToken,
} from 'interfaces/personalAPIToken';
import { IUser } from 'interfaces/user';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTable, SortingRule, useSortBy, useFlexLayout } from 'react-table';
import { createLocalStorage } from 'utils/createLocalStorage';
import { sortTypes } from 'utils/sortTypes';
import { CreatePersonalAPIToken } from './CreatePersonalAPIToken/CreatePersonalAPIToken';
import { DeletePersonalAPIToken } from './DeletePersonalAPIToken/DeletePersonalAPIToken';
import { PersonalAPITokenDialog } from './PersonalAPITokenDialog/PersonalAPITokenDialog';

const StyledAlert = styled(Alert)(({ theme }) => ({
    marginBottom: theme.spacing(3),
}));

const StyledTablePlaceholder = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: theme.spacing(10, 2),
}));

const StyledPlaceholderTitle = styled(Typography)(({ theme }) => ({
    fontSize: theme.fontSizes.mainHeader,
    marginBottom: theme.spacing(1.5),
}));

const StyledPlaceholderSubtitle = styled(Typography)(({ theme }) => ({
    color: theme.palette.text.secondary,
    marginBottom: theme.spacing(4.5),
}));

export const tokensPlaceholder: IPersonalAPIToken[] = Array(15).fill({
    description: 'Short description of the feature',
    type: '-',
    createdAt: new Date(2022, 1, 1),
    project: 'projectID',
});

export type PageQueryType = Partial<
    Record<'sort' | 'order' | 'search', string>
>;

const defaultSort: SortingRule<string> = { id: 'createdAt' };

const { value: storedParams, setValue: setStoredParams } = createLocalStorage(
    'PersonalAPITokensTable:v1',
    defaultSort
);

interface IPersonalAPITokensTabProps {
    user: IUser;
}

export const PersonalAPITokensTab = ({ user }: IPersonalAPITokensTabProps) => {
    const theme = useTheme();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));
    const isExtraSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
    const { tokens = [], loading } = usePersonalAPITokens();

    const [searchParams, setSearchParams] = useSearchParams();

    const [initialState] = useState(() => ({
        sortBy: [
            {
                id: searchParams.get('sort') || storedParams.id,
                desc: searchParams.has('order')
                    ? searchParams.get('order') === 'desc'
                    : storedParams.desc,
            },
        ],
        globalFilter: searchParams.get('search') || '',
    }));

    const [searchValue, setSearchValue] = useState(initialState.globalFilter);
    const [createOpen, setCreateOpen] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [newToken, setNewToken] = useState<INewPersonalAPIToken>();
    const [selectedToken, setSelectedToken] = useState<IPersonalAPIToken>();

    const columns = useMemo(
        () => [
            {
                Header: 'Description',
                accessor: 'description',
                Cell: HighlightCell,
                minWidth: 100,
                searchable: true,
            },
            {
                Header: 'Expires',
                accessor: 'expiresAt',
                Cell: DateCell,
                sortType: 'date',
                maxWidth: 150,
            },
            {
                Header: 'Created',
                accessor: 'createdAt',
                Cell: DateCell,
                sortType: 'date',
                maxWidth: 150,
            },
            {
                Header: 'Actions',
                id: 'Actions',
                align: 'center',
                Cell: ({ row: { original: rowToken } }: any) => (
                    <ActionCell>
                        <Tooltip title="Delete token" arrow describeChild>
                            <span>
                                <IconButton
                                    onClick={() => {
                                        setSelectedToken(rowToken);
                                        setDeleteOpen(true);
                                    }}
                                >
                                    <Delete />
                                </IconButton>
                            </span>
                        </Tooltip>
                    </ActionCell>
                ),
                maxWidth: 100,
                disableSortBy: true,
            },
        ],
        [setSelectedToken, setDeleteOpen]
    );

    const {
        data: searchedData,
        getSearchText,
        getSearchContext,
    } = useSearch(columns, searchValue, tokens);

    const data = useMemo(
        () =>
            searchedData?.length === 0 && loading
                ? tokensPlaceholder
                : searchedData,
        [searchedData, loading]
    );

    const {
        headerGroups,
        rows,
        prepareRow,
        state: { sortBy },
        setHiddenColumns,
    } = useTable(
        {
            columns,
            data,
            initialState,
            sortTypes,
            autoResetSortBy: false,
            disableSortRemove: true,
            disableMultiSort: true,
        },
        useSortBy,
        useFlexLayout
    );

    useEffect(() => {
        const hiddenColumns = [];
        if (isSmallScreen) {
            hiddenColumns.push('createdAt');
        }
        if (isExtraSmallScreen) {
            hiddenColumns.push('expiresAt');
        }
        setHiddenColumns(hiddenColumns);
    }, [setHiddenColumns, isSmallScreen, isExtraSmallScreen]);

    useEffect(() => {
        const tableState: PageQueryType = {};
        tableState.sort = sortBy[0].id;
        if (sortBy[0].desc) {
            tableState.order = 'desc';
        }
        if (searchValue) {
            tableState.search = searchValue;
        }

        setSearchParams(tableState, {
            replace: true,
        });
        setStoredParams({ id: sortBy[0].id, desc: sortBy[0].desc || false });
    }, [sortBy, searchValue, setSearchParams]);

    return (
        <PageContent
            isLoading={loading}
            header={
                <PageHeader
                    title={`Personal API tokens (${
                        rows.length < data.length
                            ? `${rows.length} of ${data.length}`
                            : data.length
                    })`}
                    actions={
                        <>
                            <ConditionallyRender
                                condition={!isSmallScreen}
                                show={
                                    <>
                                        <Search
                                            initialValue={searchValue}
                                            onChange={setSearchValue}
                                            getSearchContext={getSearchContext}
                                        />
                                        <PageHeader.Divider />
                                    </>
                                }
                            />
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={() => setCreateOpen(true)}
                            >
                                New token
                            </Button>
                        </>
                    }
                >
                    <ConditionallyRender
                        condition={isSmallScreen}
                        show={
                            <Search
                                initialValue={searchValue}
                                onChange={setSearchValue}
                                hasFilters
                                getSearchContext={getSearchContext}
                            />
                        }
                    />
                </PageHeader>
            }
        >
            <StyledAlert severity="info">
                Use personal API tokens to authenticate to the Unleash API as
                yourself. A personal API token has the same access privileges as
                your user.
            </StyledAlert>
            <SearchHighlightProvider value={getSearchText(searchValue)}>
                <VirtualizedTable
                    rows={rows}
                    headerGroups={headerGroups}
                    prepareRow={prepareRow}
                />
            </SearchHighlightProvider>
            <ConditionallyRender
                condition={rows.length === 0}
                show={
                    <ConditionallyRender
                        condition={searchValue?.length > 0}
                        show={
                            <TablePlaceholder>
                                No tokens found matching &ldquo;
                                {searchValue}
                                &rdquo;
                            </TablePlaceholder>
                        }
                        elseShow={
                            <StyledTablePlaceholder>
                                <StyledPlaceholderTitle>
                                    You have no personal API tokens yet.
                                </StyledPlaceholderTitle>
                                <StyledPlaceholderSubtitle variant="body2">
                                    Need an API token for scripts or testing?
                                    Create a personal API token for quick access
                                    to the Unleash API.
                                </StyledPlaceholderSubtitle>
                                <Button
                                    variant="outlined"
                                    onClick={() => setCreateOpen(true)}
                                >
                                    Create your first token
                                </Button>
                            </StyledTablePlaceholder>
                        }
                    />
                }
            />
            <CreatePersonalAPIToken
                open={createOpen}
                setOpen={setCreateOpen}
                newToken={(token: INewPersonalAPIToken) => {
                    setNewToken(token);
                    setDialogOpen(true);
                }}
            />
            <PersonalAPITokenDialog
                open={dialogOpen}
                setOpen={setDialogOpen}
                token={newToken}
            />
            <DeletePersonalAPIToken
                open={deleteOpen}
                setOpen={setDeleteOpen}
                token={selectedToken}
            />
        </PageContent>
    );
};
