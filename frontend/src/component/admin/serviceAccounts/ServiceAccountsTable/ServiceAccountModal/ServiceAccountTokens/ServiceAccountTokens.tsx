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
import { TextCell } from 'component/common/Table/cells/TextCell/TextCell';
import { SearchHighlightProvider } from 'component/common/Table/SearchHighlightContext/SearchHighlightContext';
import { PAT_LIMIT } from '@server/util/constants';
import { useServiceAccountTokens } from 'hooks/api/getters/useServiceAccountTokens/useServiceAccountTokens';
import { useSearch } from 'hooks/useSearch';
import {
    INewPersonalAPIToken,
    IPersonalAPIToken,
} from 'interfaces/personalAPIToken';
import { useMemo, useState } from 'react';
import {
    useTable,
    SortingRule,
    useSortBy,
    useFlexLayout,
    Column,
} from 'react-table';
import { sortTypes } from 'utils/sortTypes';
import { ServiceAccountCreateTokenDialog } from './ServiceAccountCreateTokenDialog/ServiceAccountCreateTokenDialog';
import { ServiceAccountTokenDialog } from 'component/admin/serviceAccounts/ServiceAccountsTable/ServiceAccountTokenDialog/ServiceAccountTokenDialog';
import { TimeAgoCell } from 'component/common/Table/cells/TimeAgoCell/TimeAgoCell';
import { useConditionallyHiddenColumns } from 'hooks/useConditionallyHiddenColumns';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { Dialogue } from 'component/common/Dialogue/Dialogue';
import {
    ICreateServiceAccountTokenPayload,
    useServiceAccountTokensApi,
} from 'hooks/api/actions/useServiceAccountTokensApi/useServiceAccountTokensApi';
import useToast from 'hooks/useToast';
import { formatUnknownError } from 'utils/formatUnknownError';
import { IServiceAccount } from 'interfaces/service-account';
import { useServiceAccounts } from 'hooks/api/getters/useServiceAccounts/useServiceAccounts';

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

const defaultSort: SortingRule<string> = { id: 'createdAt' };

interface IServiceAccountTokensProps {
    serviceAccount: IServiceAccount;
    readOnly?: boolean;
}

export const ServiceAccountTokens = ({
    serviceAccount,
    readOnly,
}: IServiceAccountTokensProps) => {
    const theme = useTheme();
    const { setToastData, setToastApiError } = useToast();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));
    const isExtraSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
    const { tokens = [], refetchTokens } = useServiceAccountTokens(
        serviceAccount.id
    );
    const { refetch } = useServiceAccounts();
    const { createServiceAccountToken, deleteServiceAccountToken } =
        useServiceAccountTokensApi();

    const [initialState] = useState(() => ({
        sortBy: readOnly ? [{ id: 'seenAt' }] : [defaultSort],
    }));

    const [searchValue, setSearchValue] = useState('');
    const [createOpen, setCreateOpen] = useState(false);
    const [tokenOpen, setTokenOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [newToken, setNewToken] = useState<INewPersonalAPIToken>();
    const [selectedToken, setSelectedToken] = useState<IPersonalAPIToken>();

    const onCreateClick = async (
        newToken: ICreateServiceAccountTokenPayload
    ) => {
        try {
            const token = await createServiceAccountToken(
                serviceAccount.id,
                newToken
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
                await deleteServiceAccountToken(
                    serviceAccount.id,
                    selectedToken?.id
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
        () =>
            [
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
                    Cell: ({ value }: { value: string }) => {
                        const date = new Date(value);
                        if (
                            date.getFullYear() >
                            new Date().getFullYear() + 100
                        ) {
                            return <TextCell>Never</TextCell>;
                        }
                        return <DateCell value={value} />;
                    },
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
                    Header: 'Last seen',
                    accessor: 'seenAt',
                    Cell: TimeAgoCell,
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
            ] as Column<IPersonalAPIToken>[],
        [setSelectedToken, setDeleteOpen]
    );

    const { data, getSearchText, getSearchContext } = useSearch(
        columns,
        searchValue,
        tokens
    );

    const { headerGroups, rows, prepareRow, setHiddenColumns } = useTable(
        {
            columns,
            data,
            initialState,
            sortTypes,
            autoResetHiddenColumns: false,
            autoResetSortBy: false,
            disableSortRemove: true,
            disableMultiSort: true,
        },
        useSortBy,
        useFlexLayout
    );

    useConditionallyHiddenColumns(
        [
            {
                condition: isExtraSmallScreen,
                columns: ['expiresAt'],
            },
            {
                condition: isSmallScreen,
                columns: ['createdAt'],
            },
            {
                condition: Boolean(readOnly),
                columns: ['Actions', 'expiresAt', 'createdAt'],
            },
        ],
        setHiddenColumns,
        columns
    );

    return (
        <>
            <ConditionallyRender
                condition={!readOnly}
                show={
                    <StyledHeader>
                        <Search
                            initialValue={searchValue}
                            onChange={setSearchValue}
                            getSearchContext={getSearchContext}
                        />
                        <Button
                            variant="contained"
                            color="primary"
                            disabled={tokens.length >= PAT_LIMIT}
                            onClick={() => setCreateOpen(true)}
                        >
                            New token
                        </Button>
                    </StyledHeader>
                }
            />
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
                                    You have no tokens for this service account
                                    yet.
                                </StyledPlaceholderTitle>
                                <StyledPlaceholderSubtitle>
                                    Create a service account token for access to
                                    the Unleash API.
                                </StyledPlaceholderSubtitle>
                                <Button
                                    variant="outlined"
                                    onClick={() => setCreateOpen(true)}
                                >
                                    Create new service account token
                                </Button>
                            </StyledTablePlaceholder>
                        }
                    />
                }
            />
            <ServiceAccountCreateTokenDialog
                open={createOpen}
                setOpen={setCreateOpen}
                tokens={tokens}
                onCreateClick={onCreateClick}
            />
            <ServiceAccountTokenDialog
                open={tokenOpen}
                setOpen={setTokenOpen}
                token={newToken}
            />
            <Dialogue
                open={deleteOpen}
                primaryButtonText="Delete token"
                secondaryButtonText="Cancel"
                onClick={onDeleteClick}
                onClose={() => {
                    setDeleteOpen(false);
                }}
                title="Delete token?"
            >
                <Typography>
                    Any applications or scripts using this token "
                    <strong>{selectedToken?.description}</strong>" will no
                    longer be able to access the Unleash API. You cannot undo
                    this action.
                </Typography>
            </Dialogue>
        </>
    );
};
