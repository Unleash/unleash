import Delete from '@mui/icons-material/Delete';
import {
    Button,
    IconButton,
    styled,
    Tooltip,
    Typography,
    useMediaQuery,
    useTheme,
} from '@mui/material';
import { Search } from 'component/common/Search/Search';
import { TablePlaceholder, VirtualizedTable } from 'component/common/Table';
import { ActionCell } from 'component/common/Table/cells/ActionCell/ActionCell';
import { DateCell } from 'component/common/Table/cells/DateCell/DateCell';
import { HighlightCell } from 'component/common/Table/cells/HighlightCell/HighlightCell';
import { SearchHighlightProvider } from 'component/common/Table/SearchHighlightContext/SearchHighlightContext';
import { PAT_LIMIT } from '@server/util/constants';
import { useSignalEndpointTokens } from 'hooks/api/getters/useSignalEndpointTokens/useSignalEndpointTokens';
import { useSearch } from 'hooks/useSearch';
import { useMemo, useState } from 'react';
import {
    useTable,
    type SortingRule,
    useSortBy,
    useFlexLayout,
} from 'react-table';
import { sortTypes } from 'utils/sortTypes';
import { SignalEndpointsTokensCreateDialog } from './SignalEndpointsTokensCreateDialog.tsx';
import { SignalEndpointsTokensDialog } from './SignalEndpointsTokensDialog.tsx';
import { useConditionallyHiddenColumns } from 'hooks/useConditionallyHiddenColumns';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { Dialogue } from 'component/common/Dialogue/Dialogue';
import {
    type SignalEndpointTokenPayload,
    useSignalEndpointTokensApi,
} from 'hooks/api/actions/useSignalEndpointTokensApi/useSignalEndpointTokensApi';
import useToast from 'hooks/useToast';
import { formatUnknownError } from 'utils/formatUnknownError';
import type { ISignalEndpoint, ISignalEndpointToken } from 'interfaces/signal';
import { useSignalEndpoints } from 'hooks/api/getters/useSignalEndpoints/useSignalEndpoints';

const StyledHeader = styled('div')(({ theme }) => ({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing(2),
    gap: theme.spacing(2),
    '& > div': {
        [theme.breakpoints.down('md')]: {
            marginTop: 0,
        },
    },
}));

const StyledTablePlaceholder = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: theme.spacing(3),
}));

const StyledPlaceholderTitle = styled(Typography)(({ theme }) => ({
    fontSize: theme.fontSizes.bodySize,
    marginBottom: theme.spacing(0.5),
}));

const StyledPlaceholderSubtitle = styled(Typography)(({ theme }) => ({
    fontSize: theme.fontSizes.smallBody,
    color: theme.palette.text.secondary,
    marginBottom: theme.spacing(1.5),
}));

export type PageQueryType = Partial<
    Record<'sort' | 'order' | 'search', string>
>;

const defaultSort: SortingRule<string> = { id: 'createdAt', desc: true };

interface ISignalEndpointsTokensProps {
    signalEndpoint: ISignalEndpoint;
}

export const SignalEndpointsTokens = ({
    signalEndpoint,
}: ISignalEndpointsTokensProps) => {
    const theme = useTheme();
    const { setToastData, setToastApiError } = useToast();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));
    const { signalEndpointTokens, refetch: refetchTokens } =
        useSignalEndpointTokens(signalEndpoint.id);
    const { refetch } = useSignalEndpoints();
    const { addSignalEndpointToken, removeSignalEndpointToken } =
        useSignalEndpointTokensApi();

    const [initialState] = useState(() => ({
        sortBy: [defaultSort],
    }));

    const [searchValue, setSearchValue] = useState('');
    const [createOpen, setCreateOpen] = useState(false);
    const [tokenOpen, setTokenOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [newToken, setNewToken] = useState('');
    const [selectedToken, setSelectedToken] = useState<ISignalEndpointToken>();

    const onCreateClick = async (newToken: SignalEndpointTokenPayload) => {
        try {
            const { token } = await addSignalEndpointToken(
                signalEndpoint.id,
                newToken,
            );
            refetch();
            refetchTokens();
            setCreateOpen(false);
            setNewToken(token);
            setTokenOpen(true);
            setToastData({
                text: 'Token created',
                type: 'success',
            });
        } catch (error: unknown) {
            setToastApiError(formatUnknownError(error));
        }
    };

    const onDeleteClick = async () => {
        if (selectedToken) {
            try {
                await removeSignalEndpointToken(
                    signalEndpoint.id,
                    selectedToken.id,
                );
                refetch();
                refetchTokens();
                setDeleteOpen(false);
                setToastData({
                    text: 'Token deleted',
                    type: 'success',
                });
            } catch (error: unknown) {
                setToastApiError(formatUnknownError(error));
            }
        }
    };

    const columns = useMemo(
        () => [
            {
                Header: 'Name',
                accessor: 'name',
                Cell: HighlightCell,
                minWidth: 100,
                searchable: true,
            },
            {
                Header: 'Created',
                accessor: 'createdAt',
                Cell: DateCell,
                maxWidth: 150,
            },
            {
                Header: 'Actions',
                id: 'Actions',
                align: 'center',
                Cell: ({ row: { original: rowToken } }: any) => (
                    <ActionCell>
                        <Tooltip title='Delete token' arrow describeChild>
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
        [setSelectedToken, setDeleteOpen],
    );

    const { data, getSearchText, getSearchContext } = useSearch(
        columns,
        searchValue,
        signalEndpointTokens,
    );

    const { headerGroups, rows, prepareRow, setHiddenColumns } = useTable(
        {
            columns: columns as any[],
            data,
            initialState,
            sortTypes,
            autoResetHiddenColumns: false,
            autoResetSortBy: false,
            disableSortRemove: true,
            disableMultiSort: true,
        },
        useSortBy,
        useFlexLayout,
    );

    useConditionallyHiddenColumns(
        [
            {
                condition: isSmallScreen,
                columns: ['createdAt'],
            },
        ],
        setHiddenColumns,
        columns,
    );

    return (
        <>
            <StyledHeader>
                <Search
                    initialValue={searchValue}
                    onChange={setSearchValue}
                    getSearchContext={getSearchContext}
                />
                <Button
                    variant='contained'
                    color='primary'
                    disabled={signalEndpointTokens.length >= PAT_LIMIT}
                    onClick={() => setCreateOpen(true)}
                >
                    New token
                </Button>
            </StyledHeader>
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
                                    You have no tokens for this signal endpoint
                                    yet.
                                </StyledPlaceholderTitle>
                                <StyledPlaceholderSubtitle>
                                    Create a token to start using this signal
                                    endpoint.
                                </StyledPlaceholderSubtitle>
                                <Button
                                    variant='outlined'
                                    onClick={() => setCreateOpen(true)}
                                >
                                    Create new signal endpoint token
                                </Button>
                            </StyledTablePlaceholder>
                        }
                    />
                }
            />
            <SignalEndpointsTokensCreateDialog
                open={createOpen}
                setOpen={setCreateOpen}
                tokens={signalEndpointTokens}
                onCreateClick={onCreateClick}
            />
            <SignalEndpointsTokensDialog
                open={tokenOpen}
                setOpen={setTokenOpen}
                token={newToken}
                signalEndpoint={signalEndpoint}
            />
            <Dialogue
                open={deleteOpen}
                primaryButtonText='Delete token'
                secondaryButtonText='Cancel'
                onClick={onDeleteClick}
                onClose={() => {
                    setDeleteOpen(false);
                }}
                title='Delete token?'
            >
                <Typography>
                    Any applications or scripts using this token "
                    <strong>{selectedToken?.name}</strong>" will no longer be
                    able to make requests to this signal endpoint. You cannot
                    undo this action.
                </Typography>
            </Dialogue>
        </>
    );
};
