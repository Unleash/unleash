import { useMemo, useState } from 'react';
import {
    Alert,
    LinearProgress,
    styled,
    Table,
    TableBody,
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
import { TableCell } from 'component/common/Table';
import { TimeAgoCell } from 'component/common/Table/cells/TimeAgoCell/TimeAgoCell';
import { ProjectsList } from 'component/admin/apiToken/ProjectsList/ProjectsList';
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
import { isTokenExpired } from '../isTokenExpired.ts';
import { CreateApplicationTokenButton } from './CreateApplicationTokenButton/CreateApplicationTokenButton.tsx';
import { CreateTokenPanel } from './CreateTokenPanel/CreateTokenPanel.tsx';

const StyledRow = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing(2),
}));

const StyledIntro = styled(StyledRow)(({ theme }) => ({
    marginBottom: theme.spacing(3),
}));

const StyledCard = styled('section')(({ theme }) => ({
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadiusLarge,
    marginBottom: theme.spacing(3),
    overflowX: 'auto',
}));

const StyledCardHeader = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'baseline',
    gap: theme.spacing(1.5),
    padding: theme.spacing(2, 3),
    borderBottom: `1px solid ${theme.palette.divider}`,
}));

const StyledEmpty = styled(StyledRow)(({ theme }) => ({
    padding: theme.spacing(2, 3),
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
            columnHelper.display({
                id: 'projects',
                header: 'Projects',
                cell: ({ row }) => (
                    <ProjectsList
                        project={row.original.project}
                        projects={row.original.projects}
                    />
                ),
            }),
            columnHelper.accessor('seenAt', {
                header: 'Last used',
                cell: ({ getValue }) => <TimeAgoCell value={getValue()} />,
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
        <Table>
            <TableHead>
                <TableRow>
                    {table.getFlatHeaders().map((header) => (
                        <TableCell key={header.id}>
                            {flexRender(
                                header.column.columnDef.header,
                                header.getContext(),
                            )}
                        </TableCell>
                    ))}
                </TableRow>
            </TableHead>
            <TableBody>
                {table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id}>
                        {row.getVisibleCells().map((cell) => (
                            <TableCell
                                key={cell.id}
                                align={cell.column.columnDef.meta?.align}
                            >
                                {flexRender(
                                    cell.column.columnDef.cell,
                                    cell.getContext(),
                                )}
                            </TableCell>
                        ))}
                    </TableRow>
                ))}
            </TableBody>
        </Table>
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

    if (loading || environmentsLoading || overviewLoading) {
        return <LinearProgress />;
    }

    if (forbidden) {
        return (
            <Alert severity='info'>
                You need permission to read API tokens to see the tokens linked
                to this application.
            </Alert>
        );
    }

    if (error) {
        return (
            <Alert severity='error'>
                Could not load the API tokens: {formatUnknownError(error)}
            </Alert>
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

    return (
        <>
            <StyledIntro>
                <Typography>
                    Tokens created here belong to {name}. They work like any
                    other API token: scope is set per token, and changing it
                    means rotating.
                </Typography>
                <CreateApplicationTokenButton
                    startIcon={<Add />}
                    onClick={() => setCreatePanel({})}
                >
                    Create token
                </CreateApplicationTokenButton>
            </StyledIntro>
            {hiddenTokenTypes.length > 0 ? (
                <Alert severity='info' sx={{ mb: 3 }}>
                    {hiddenTokenTypes
                        .map((type) => typeLabels[type])
                        .join(' and ')}{' '}
                    tokens are not listed: you don't have permission to read
                    them.
                </Alert>
            ) : null}
            {cardEnvironments.map((environment) => {
                const environmentTokens =
                    tokensByEnvironment.get(environment) ?? [];
                const instances = instanceCount(environment);
                const label = capitalizeFirst(environment);

                return (
                    <StyledCard key={environment} aria-label={label}>
                        <StyledCardHeader>
                            <Typography variant='h3'>{label}</Typography>
                            <Typography variant='body2' color='text.secondary'>
                                {environmentTokens.length > 0
                                    ? pluralize(
                                          environmentTokens.length,
                                          'token',
                                      )
                                    : 'No active tokens'}
                            </Typography>
                        </StyledCardHeader>
                        {environmentTokens.length > 0 ? (
                            <TokensTable
                                tokens={environmentTokens}
                                onDelete={onDelete}
                            />
                        ) : (
                            <StyledEmpty>
                                <Typography>
                                    {instances > 0
                                        ? `${pluralize(instances, 'instance reports', 'instances report')} here without a linked token.`
                                        : `No token for ${label} yet.`}
                                </Typography>
                                <CreateApplicationTokenButton
                                    variant='outlined'
                                    onClick={() =>
                                        setCreatePanel({ environment })
                                    }
                                >
                                    Create {label} token
                                </CreateApplicationTokenButton>
                            </StyledEmpty>
                        )}
                    </StyledCard>
                );
            })}
            {createPanel ? (
                <CreateTokenPanel
                    appName={name}
                    preferredEnvironment={createPanel.environment}
                    onClose={() => setCreatePanel(undefined)}
                />
            ) : null}
        </>
    );
};
