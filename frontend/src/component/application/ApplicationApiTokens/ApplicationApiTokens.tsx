import { useMemo, useState } from 'react';
import {
    Alert,
    LinearProgress,
    styled,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Typography,
} from '@mui/material';
import Add from '@mui/icons-material/Add';
import {
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    useReactTable,
} from '@tanstack/react-table';
import { PageContent } from 'component/common/PageContent/PageContent';
import { TimeAgo } from 'component/common/TimeAgo/TimeAgo';
import { RemoveApiTokenButton } from 'component/common/ApiTokenTable/RemoveApiTokenButton/RemoveApiTokenButton';
import { Badge } from 'component/common/Badge/Badge';
import { ScreenReaderOnly } from 'component/common/ScreenReaderOnly/ScreenReaderOnly';
import useApiTokensApi from 'hooks/api/actions/useApiTokensApi/useApiTokensApi';
import { useApiTokens } from 'hooks/api/getters/useApiTokens/useApiTokens';
import { useApplicationApiTokens } from 'hooks/api/getters/useApplicationApiTokens/useApplicationApiTokens';
import { useApplicationOverview } from 'hooks/api/getters/useApplicationOverview/useApplicationOverview';
import { useEnvironments } from 'hooks/api/getters/useEnvironments/useEnvironments';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import { formatUnknownError } from 'utils/formatUnknownError';
import { capitalizeFirst } from 'utils/capitalizeFirst';
import {
    DELETE_CLIENT_API_TOKEN,
    DELETE_FRONTEND_API_TOKEN,
} from '@server/types/permissions';
import type { ApiTokenSchema } from 'openapi';
import { pluralize } from '../pluralize.ts';
import { ALL_PROJECTS } from '../ApplicationOverviewPanels/buildApplicationEnvironments.ts';
import { isTokenExpired } from '../isTokenExpired.ts';
import { CreateApplicationTokenButton } from './CreateApplicationTokenButton/CreateApplicationTokenButton.tsx';
import { CreateTokenPanel } from './CreateTokenPanel/CreateTokenPanel.tsx';

const StyledHeader = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: theme.spacing(2),
    padding: theme.spacing(1, 0),
}));

const StyledHeaderText = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1),
}));

const StyledCards = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(3),
}));

const StyledCard = styled('section')(({ theme }) => ({
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadiusLarge,
    overflowX: 'auto',
}));

const StyledCardHeader = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'baseline',
    gap: theme.spacing(1.5),
    padding: theme.spacing(2, 3),
    borderBottom: `1px solid ${theme.palette.divider}`,
}));

// the text and its button sit together, so they read as one group
const StyledEmpty = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: theme.spacing(2),
    padding: theme.spacing(2, 3),
}));

const StyledTable = styled(Table)({
    '& tbody tr:last-of-type td': {
        borderBottom: 0,
    },
});

const StyledCell = styled(TableCell)(({ theme }) => ({
    height: theme.spacing(6),
    padding: theme.spacing(0, 2),
    '&:first-of-type': {
        paddingLeft: theme.spacing(3),
    },
    '&:last-of-type': {
        paddingRight: theme.spacing(3),
    },
    '&&.MuiTableCell-head': {
        height: theme.spacing(6),
        borderRadius: 0,
        borderBottom: `1px solid ${theme.palette.divider}`,
        backgroundColor: 'transparent',
        color: theme.palette.text.secondary,
    },
}));

const typeLabels: Record<string, string> = {
    client: 'Backend',
    backend: 'Backend',
    frontend: 'Frontend',
};

const deletePermission = (type: string) =>
    type === 'frontend' ? DELETE_FRONTEND_API_TOKEN : DELETE_CLIENT_API_TOKEN;

interface ITokensTableProps {
    tokens: ApiTokenSchema[];
    onDelete: (secret: string) => Promise<void>;
}

const columnHelper = createColumnHelper<ApiTokenSchema>();

const TokensTable = ({ tokens, onDelete }: ITokensTableProps) => {
    // biome-ignore lint/correctness/useExhaustiveDependencies: onDelete is a new function on every render; new columns would remount the delete button and close its confirmation dialog
    const columns = useMemo(
        () => [
            columnHelper.accessor('tokenName', {
                header: 'Name',
                cell: ({ getValue }) => <strong>{getValue()}</strong>,
            }),
            columnHelper.accessor('type', {
                header: 'Type',
                cell: ({ getValue }) => typeLabels[getValue()] ?? getValue(),
            }),
            columnHelper.accessor('projects', {
                header: 'Projects',
                cell: ({ getValue }) =>
                    getValue().includes(ALL_PROJECTS)
                        ? 'All'
                        : getValue().join(', '),
            }),
            columnHelper.accessor('seenAt', {
                header: 'Last used',
                cell: ({ getValue }) => (
                    <TimeAgo date={getValue()} fallback='Never' />
                ),
            }),
            columnHelper.display({
                id: 'status',
                header: 'Status',
                cell: ({ row }) =>
                    isTokenExpired(row.original) ? (
                        <Badge color='error'>Expired</Badge>
                    ) : (
                        <Badge color='success'>Active</Badge>
                    ),
            }),
            columnHelper.display({
                id: 'actions',
                header: () => <ScreenReaderOnly>Actions</ScreenReaderOnly>,
                cell: ({ row }) => {
                    const { secret, type } = row.original;
                    return secret ? (
                        <RemoveApiTokenButton
                            token={row.original}
                            permission={deletePermission(type)}
                            onRemove={() => onDelete(secret)}
                        />
                    ) : null;
                },
                meta: { align: 'right' },
            }),
        ],
        [],
    );
    const table = useReactTable({
        data: tokens,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getRowId: (token) =>
            token.secret ?? `${token.tokenName}-${token.environment}`,
    });

    return (
        <StyledTable>
            <TableHead>
                <TableRow>
                    {table.getFlatHeaders().map((header) => (
                        <StyledCell key={header.id}>
                            {flexRender(
                                header.column.columnDef.header,
                                header.getContext(),
                            )}
                        </StyledCell>
                    ))}
                </TableRow>
            </TableHead>
            <TableBody>
                {table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id}>
                        {row.getVisibleCells().map((cell) => (
                            <StyledCell
                                key={cell.id}
                                align={cell.column.columnDef.meta?.align}
                            >
                                {flexRender(
                                    cell.column.columnDef.cell,
                                    cell.getContext(),
                                )}
                            </StyledCell>
                        ))}
                    </TableRow>
                ))}
            </TableBody>
        </StyledTable>
    );
};

export const ApplicationApiTokens = () => {
    const name = useRequiredPathParam('name');
    const { tokens, loading, error, forbidden, hiddenTokenTypes, refetch } =
        useApplicationApiTokens(name);
    const { environments, loading: environmentsLoading } = useEnvironments();

    // how many SDK instances report in each environment
    const { data: overview, loading: overviewLoading } =
        useApplicationOverview(name);
    const { deleteToken } = useApiTokensApi();
    const { refetch: refetchAllTokens } = useApiTokens();
    const [createPanel, setCreatePanel] = useState<{
        environment?: string;
    }>();

    const onDelete = async (secret: string) => {
        try {
            await deleteToken(secret);
        } finally {
            refetchAllTokens();
            await refetch();
        }
    };

    const isLoading = loading || environmentsLoading || overviewLoading;
    const allTokensVisible = hiddenTokenTypes.length === 0;
    // no count while it could be wrong: loading, or tokens the viewer can't see
    const title =
        isLoading || forbidden || error || !allTokensVisible
            ? 'Tokens'
            : `Tokens (${tokens.length})`;
    const header = (
        <StyledHeader>
            <StyledHeaderText>
                <Typography variant='h2'>{title}</Typography>
                <Typography color='text.secondary'>
                    Tokens created here belong to {name}. They work like any
                    other API token: scope is set per token, and changing it
                    means rotating.
                </Typography>
            </StyledHeaderText>
            <CreateApplicationTokenButton
                startIcon={<Add />}
                onClick={() => setCreatePanel({})}
            >
                Create token
            </CreateApplicationTokenButton>
        </StyledHeader>
    );
    const createTokenPanel = createPanel ? (
        <CreateTokenPanel
            appName={name}
            preferredEnvironment={createPanel.environment}
            onClose={() => setCreatePanel(undefined)}
        />
    ) : null;

    if (isLoading) {
        return (
            <PageContent header={header}>
                <LinearProgress />
                {createTokenPanel}
            </PageContent>
        );
    }

    if (forbidden) {
        return (
            <PageContent header={header}>
                <Alert severity='info'>
                    You need permission to read API tokens to see the tokens
                    linked to this application.
                </Alert>
                {createTokenPanel}
            </PageContent>
        );
    }

    if (error) {
        return (
            <PageContent header={header}>
                <Alert severity='error'>
                    Could not load the API tokens: {formatUnknownError(error)}
                </Alert>
                {createTokenPanel}
            </PageContent>
        );
    }

    const tokensByEnvironment = Map.groupBy(
        tokens,
        (token) => token.environment ?? '',
    );
    const cardEnvironments = [
        ...new Set([
            ...environments.filter((e) => e.enabled).map((e) => e.name),
            ...tokensByEnvironment.keys(),
        ]),
    ];
    const instanceCount = (environment: string) =>
        overview.environments.find((e) => e.name === environment)
            ?.instanceCount ?? 0;
    const emptyText = (label: string, instances: number) => {
        if (!allTokensVisible) {
            return `No token you can see for ${label}.`;
        }
        return instances > 0
            ? `${pluralize(instances, 'instance reports', 'instances report')} here without a linked token.`
            : `No token for ${label} yet.`;
    };

    return (
        <PageContent header={header}>
            <StyledCards>
                {allTokensVisible ? null : (
                    <Alert severity='info'>
                        {hiddenTokenTypes
                            .map((type) => typeLabels[type])
                            .join(' and ')}{' '}
                        tokens are not listed: you don't have permission to read
                        them.
                    </Alert>
                )}
                {cardEnvironments.map((environment) => {
                    const environmentTokens =
                        tokensByEnvironment.get(environment) ?? [];
                    const instances = instanceCount(environment);
                    const label = capitalizeFirst(environment);

                    return (
                        <StyledCard key={environment} aria-label={label}>
                            <StyledCardHeader>
                                <Typography variant='h3'>{label}</Typography>
                                {environmentTokens.length > 0 ? (
                                    <Typography
                                        variant='body2'
                                        color='text.secondary'
                                    >
                                        {pluralize(
                                            environmentTokens.length,
                                            'token',
                                        )}
                                    </Typography>
                                ) : null}
                            </StyledCardHeader>
                            {environmentTokens.length > 0 ? (
                                <TokensTable
                                    tokens={environmentTokens}
                                    onDelete={onDelete}
                                />
                            ) : (
                                <StyledEmpty>
                                    <Typography>
                                        {emptyText(label, instances)}
                                    </Typography>
                                    <CreateApplicationTokenButton
                                        variant='outlined'
                                        onClick={() =>
                                            setCreatePanel({ environment })
                                        }
                                    >
                                        Create token
                                        <ScreenReaderOnly as='span'>
                                            {' '}
                                            in {label}
                                        </ScreenReaderOnly>
                                    </CreateApplicationTokenButton>
                                </StyledEmpty>
                            )}
                        </StyledCard>
                    );
                })}
            </StyledCards>
            {createTokenPanel}
        </PageContent>
    );
};
