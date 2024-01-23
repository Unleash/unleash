import { Delete } from '@mui/icons-material';
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
import { useIncomingWebhookTokens } from 'hooks/api/getters/useIncomingWebhookTokens/useIncomingWebhookTokens';
import { useSearch } from 'hooks/useSearch';
import { useMemo, useState } from 'react';
import { useTable, SortingRule, useSortBy, useFlexLayout } from 'react-table';
import { sortTypes } from 'utils/sortTypes';
import { IncomingWebhooksTokensCreateDialog } from './IncomingWebhooksTokensCreateDialog';
import { IncomingWebhooksTokensDialog } from './IncomingWebhooksTokensDialog';
import { useConditionallyHiddenColumns } from 'hooks/useConditionallyHiddenColumns';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { Dialogue } from 'component/common/Dialogue/Dialogue';
import {
    IncomingWebhookTokenPayload,
    useIncomingWebhookTokensApi,
} from 'hooks/api/actions/useIncomingWebhookTokensApi/useIncomingWebhookTokensApi';
import useToast from 'hooks/useToast';
import { formatUnknownError } from 'utils/formatUnknownError';
import {
    IIncomingWebhook,
    IIncomingWebhookToken,
} from 'interfaces/incomingWebhook';
import { useIncomingWebhooks } from 'hooks/api/getters/useIncomingWebhooks/useIncomingWebhooks';

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

interface IIncomingWebhooksTokensProps {
    incomingWebhook: IIncomingWebhook;
}

export const IncomingWebhooksTokens = ({
    incomingWebhook,
}: IIncomingWebhooksTokensProps) => {
    const theme = useTheme();
    const { setToastData, setToastApiError } = useToast();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));
    const { incomingWebhookTokens, refetch: refetchTokens } =
        useIncomingWebhookTokens(incomingWebhook.id);
    const { refetch } = useIncomingWebhooks();
    const { addIncomingWebhookToken, removeIncomingWebhookToken } =
        useIncomingWebhookTokensApi();

    const [initialState] = useState(() => ({
        sortBy: [defaultSort],
    }));

    const [searchValue, setSearchValue] = useState('');
    const [createOpen, setCreateOpen] = useState(false);
    const [tokenOpen, setTokenOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [newToken, setNewToken] = useState('');
    const [selectedToken, setSelectedToken] = useState<IIncomingWebhookToken>();

    const onCreateClick = async (newToken: IncomingWebhookTokenPayload) => {
        try {
            const { token } = await addIncomingWebhookToken(
                incomingWebhook.id,
                newToken,
            );
            refetch();
            refetchTokens();
            setCreateOpen(false);
            setNewToken(token);
            setTokenOpen(true);
            setToastData({
                title: 'Token created successfully',
                type: 'success',
            });
        } catch (error: unknown) {
            setToastApiError(formatUnknownError(error));
        }
    };

    const onDeleteClick = async () => {
        if (selectedToken) {
            try {
                await removeIncomingWebhookToken(
                    incomingWebhook.id,
                    selectedToken.id,
                );
                refetch();
                refetchTokens();
                setDeleteOpen(false);
                setToastData({
                    title: 'Token deleted successfully',
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
        incomingWebhookTokens,
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
                    disabled={incomingWebhookTokens.length >= PAT_LIMIT}
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
                                    You have no tokens for this incoming webhook
                                    yet.
                                </StyledPlaceholderTitle>
                                <StyledPlaceholderSubtitle>
                                    Create a token to start using this incoming
                                    webhook.
                                </StyledPlaceholderSubtitle>
                                <Button
                                    variant='outlined'
                                    onClick={() => setCreateOpen(true)}
                                >
                                    Create new incoming webhook token
                                </Button>
                            </StyledTablePlaceholder>
                        }
                    />
                }
            />
            <IncomingWebhooksTokensCreateDialog
                open={createOpen}
                setOpen={setCreateOpen}
                tokens={incomingWebhookTokens}
                onCreateClick={onCreateClick}
            />
            <IncomingWebhooksTokensDialog
                open={tokenOpen}
                setOpen={setTokenOpen}
                token={newToken}
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
                    able to make requests to this incoming webhook. You cannot
                    undo this action.
                </Typography>
            </Dialogue>
        </>
    );
};
