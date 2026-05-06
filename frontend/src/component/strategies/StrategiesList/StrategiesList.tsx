import { useState, useMemo, useCallback, type FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, Box, Link, Typography, styled } from '@mui/material';
import Extension from '@mui/icons-material/Extension';
import {
    Table,
    TableBody,
    TableCell,
    TableRow,
    TablePlaceholder,
} from 'component/common/Table';
import { SortableTableHeader } from 'component/common/Table/SortableTableHeader/SortableTableHeader';
import { ActionCell } from 'component/common/Table/cells/ActionCell/ActionCell';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { PageContent } from 'component/common/PageContent/PageContent';
import { PageHeader } from 'component/common/PageHeader/PageHeader';
import { Dialogue } from 'component/common/Dialogue/Dialogue';
import { formatStrategyName } from 'utils/strategyNames';
import { useStrategies } from 'hooks/api/getters/useStrategies/useStrategies';
import useStrategiesApi from 'hooks/api/actions/useStrategiesApi/useStrategiesApi';
import useToast from 'hooks/useToast';
import { formatUnknownError } from 'utils/formatUnknownError';
import type { IStrategy } from 'interfaces/strategy';
import { LinkCell } from 'component/common/Table/cells/LinkCell/LinkCell';
import {
    type ColumnDef,
    flexRender,
    getCoreRowModel,
    getSortedRowModel,
    useReactTable,
    type Table as TableType,
} from '@tanstack/react-table';
import { StrategySwitch } from './StrategySwitch/StrategySwitch.tsx';
import { StrategyEditButton } from './StrategyEditButton/StrategyEditButton.tsx';
import { StrategyDeleteButton } from './StrategyDeleteButton/StrategyDeleteButton.tsx';
import { Badge } from 'component/common/Badge/Badge';
import { HelpIcon } from 'component/common/HelpIcon/HelpIcon';
import { CustomStrategyInfo } from '../CustomStrategyInfo/CustomStrategyInfo.tsx';
import { AddStrategyButton } from './AddStrategyButton/AddStrategyButton.tsx';
import { usePageTitle } from 'hooks/usePageTitle.ts';

interface IDialogueMetaData {
    show: boolean;
    title: string;
    onConfirm: () => void;
}

type StrategyRow = {
    name: string;
    description: string;
    editable: boolean;
    deprecated: boolean;
    advanced?: boolean;
};

const StyledBadge = styled(Badge)(({ theme }) => ({
    marginLeft: theme.spacing(1),
    display: 'inline-block',
}));

const StyledTitle = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing(1),
    fontSize: theme.fontSizes.mainHeader,
    width: '100%',
}));

const StyledSubtitle = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing(2),
    '& > span': {
        fontWeight: theme.fontWeight.bold,
    },
}));

const Title: FC<{
    title: string;
    description: string;
    link: string;
}> = ({ title, description, link }) => (
    <StyledTitle>
        {title}
        <HelpIcon
            htmlTooltip
            tooltip={
                <>
                    <Typography variant='body2' component='p' sx={{ mb: 1 }}>
                        {description}
                    </Typography>
                    <Link
                        href={link}
                        target='_blank'
                        rel='noopener noreferrer'
                        variant='body2'
                    >
                        Read more in the documentation
                    </Link>
                </>
            }
        />
    </StyledTitle>
);

const RecommendationAlert = () => (
    <Alert severity='info' sx={{ mb: 2 }}>
        We recommend using gradual rollout. You can customize it with{' '}
        <Link
            href='https://docs.getunleash.io/concepts/activation-strategies#constraints'
            target='_blank'
            rel='noopener noreferrer'
        >
            constraints
        </Link>{' '}
        and{' '}
        <Link
            href='https://docs.getunleash.io/concepts/strategy-variants'
            target='_blank'
            rel='noopener noreferrer'
        >
            variants
        </Link>
        .
    </Alert>
);

const StrategyTable = ({ table }: { table: TableType<StrategyRow> }) => (
    <Table>
        <SortableTableHeader tableInstance={table} />
        <TableBody>
            {table.getRowModel().rows.map((row) => (
                <TableRow hover key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
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

export const StrategiesList = () => {
    const navigate = useNavigate();
    const [dialogueMetaData, setDialogueMetaData] = useState<IDialogueMetaData>(
        {
            show: false,
            title: '',
            onConfirm: () => {},
        },
    );

    const { strategies, refetchStrategies, loading } = useStrategies();
    const { removeStrategy, deprecateStrategy, reactivateStrategy } =
        useStrategiesApi();
    const { setToastData, setToastApiError } = useToast();

    usePageTitle('Strategy types');

    const data = useMemo<{
        all: StrategyRow[];
        standard: StrategyRow[];
        advanced: StrategyRow[];
        custom: StrategyRow[];
    }>(() => {
        if (loading) {
            const mock: StrategyRow[] = Array(5).fill({
                name: 'Context name',
                description: 'Context description when loading',
                editable: false,
                deprecated: false,
            });
            return {
                all: mock,
                standard: mock,
                advanced: mock,
                custom: mock,
            };
        }

        const all: StrategyRow[] = strategies.map(
            ({ name, description, editable, deprecated, advanced }) => ({
                name,
                description: description ?? '',
                editable,
                deprecated,
                advanced,
            }),
        );

        const predefined = all.filter((strategy) => !strategy.editable);

        return {
            all,
            standard: predefined.filter((strategy) => !strategy.advanced),
            advanced: predefined.filter((strategy) => strategy.advanced),
            custom: all.filter((strategy) => strategy.editable),
        };
    }, [strategies, loading]);

    const onToggle = useCallback(
        (strategy: IStrategy) => (deprecated: boolean) => {
            if (deprecated) {
                setDialogueMetaData({
                    show: true,
                    title: 'Really reactivate strategy?',
                    onConfirm: async () => {
                        try {
                            await reactivateStrategy(strategy);
                            refetchStrategies();
                            setToastData({
                                type: 'success',
                                text: 'Strategy reactivated',
                            });
                        } catch (error: unknown) {
                            setToastApiError(formatUnknownError(error));
                        }
                    },
                });
            } else {
                setDialogueMetaData({
                    show: true,
                    title: 'Really deprecate strategy?',
                    onConfirm: async () => {
                        try {
                            await deprecateStrategy(strategy);
                            refetchStrategies();
                            setToastData({
                                type: 'success',
                                text: 'Strategy deprecated',
                            });
                        } catch (error: unknown) {
                            setToastApiError(formatUnknownError(error));
                        }
                    },
                });
            }
        },
        [
            deprecateStrategy,
            reactivateStrategy,
            refetchStrategies,
            setToastApiError,
            setToastData,
        ],
    );

    const onDeleteStrategy = useCallback(
        (strategy: IStrategy) => {
            setDialogueMetaData({
                show: true,
                title: 'Really delete strategy?',
                onConfirm: async () => {
                    try {
                        await removeStrategy(strategy);
                        refetchStrategies();
                        setToastData({
                            type: 'success',
                            text: 'Strategy deleted',
                        });
                    } catch (error: unknown) {
                        setToastApiError(formatUnknownError(error));
                    }
                },
            });
        },
        [removeStrategy, refetchStrategies, setToastApiError, setToastData],
    );

    const onEditStrategy = useCallback(
        (strategy: IStrategy) => {
            navigate(`/strategies/${strategy.name}/edit`);
        },
        [navigate],
    );

    const columns = useMemo<ColumnDef<StrategyRow, unknown>[]>(
        () => [
            {
                id: 'Icon',
                cell: () => (
                    <Box
                        data-loading
                        sx={{
                            pl: 3,
                            pr: 1,
                            display: 'flex',
                            alignItems: 'center',
                        }}
                    >
                        <Extension color='disabled' />
                    </Box>
                ),
            },
            {
                id: 'Name',
                header: 'Name',
                accessorFn: (row) => formatStrategyName(row.name),
                cell: ({
                    row: {
                        original: { name, description, deprecated },
                    },
                }) => (
                    <LinkCell
                        data-loading
                        title={formatStrategyName(name)}
                        subtitle={description}
                        to={`/strategies/${name}`}
                    >
                        <ConditionallyRender
                            condition={deprecated}
                            show={() => (
                                <StyledBadge color='disabled'>
                                    Disabled
                                </StyledBadge>
                            )}
                        />
                    </LinkCell>
                ),
                sortingFn: 'alphanumeric',
                meta: { width: '90%' },
            },
            {
                id: 'Actions',
                header: 'Actions',
                cell: ({ row: { original } }) => (
                    <ActionCell>
                        <StrategySwitch
                            deprecated={original.deprecated}
                            onToggle={onToggle(original as IStrategy)}
                        />
                        <ConditionallyRender
                            condition={original.editable}
                            show={
                                <>
                                    <ActionCell.Divider />
                                    <StrategyEditButton
                                        strategy={original as IStrategy}
                                        onClick={() =>
                                            onEditStrategy(
                                                original as IStrategy,
                                            )
                                        }
                                    />
                                    <StrategyDeleteButton
                                        strategy={original as IStrategy}
                                        onClick={() =>
                                            onDeleteStrategy(
                                                original as IStrategy,
                                            )
                                        }
                                    />
                                </>
                            }
                        />
                    </ActionCell>
                ),
                enableSorting: false,
                meta: { width: 150, minWidth: 120, align: 'center' },
            },
            {
                id: 'description',
                accessorKey: 'description',
                enableSorting: false,
            },
        ],
        [onToggle, onEditStrategy, onDeleteStrategy],
    );

    const initialState = useMemo(
        () => ({
            sorting: [{ id: 'Name', desc: false }],
            columnVisibility: { description: false },
        }),
        [],
    );

    const standardTable = useReactTable({
        columns,
        data: data.standard,
        initialState,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        autoResetAll: false,
        enableSortingRemoval: false,
    });

    const advancedTable = useReactTable({
        columns,
        data: data.advanced,
        initialState,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        autoResetAll: false,
        enableSortingRemoval: false,
    });

    const customTable = useReactTable({
        columns,
        data: data.custom,
        initialState,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        autoResetAll: false,
        enableSortingRemoval: false,
    });

    const onDialogConfirm = () => {
        dialogueMetaData?.onConfirm();
        setDialogueMetaData((prev: IDialogueMetaData) => ({
            ...prev,
            show: false,
        }));
    };

    return (
        <>
            <PageContent
                isLoading={loading}
                header={
                    <PageHeader
                        titleElement={
                            <Title
                                title='Standard strategies'
                                description='Standard strategies let you enable a feature only for a specified audience. Select a starting setup, then customize your strategy with targeting and variants.'
                                link='https://docs.getunleash.io/concepts/activation-strategies'
                            />
                        }
                    />
                }
            >
                <Box>
                    <RecommendationAlert />
                    <StrategyTable table={standardTable} />
                    <ConditionallyRender
                        condition={
                            standardTable.getRowModel().rows.length === 0
                        }
                        show={
                            <TablePlaceholder>
                                No strategies available.
                            </TablePlaceholder>
                        }
                    />
                </Box>

                <Dialogue
                    open={dialogueMetaData.show}
                    onClick={onDialogConfirm}
                    title={dialogueMetaData?.title}
                    onClose={() =>
                        setDialogueMetaData((prev: IDialogueMetaData) => ({
                            ...prev,
                            show: false,
                        }))
                    }
                />
            </PageContent>
            <PageContent
                isLoading={loading}
                header={
                    <PageHeader
                        titleElement={
                            <Title
                                title='Advanced and custom strategies'
                                description='Advanced strategies let you target based on specific properties. Custom activation strategies let you define your own activation strategies to use with Unleash.'
                                link='https://docs.getunleash.io/concepts/activation-strategies#custom-strategies'
                            />
                        }
                    />
                }
                sx={{ mt: 2 }}
            >
                <Box>
                    <StyledSubtitle>
                        <span>Advanced strategies</span>
                    </StyledSubtitle>
                    <StrategyTable table={advancedTable} />
                    <ConditionallyRender
                        condition={
                            advancedTable.getRowModel().rows.length === 0
                        }
                        show={
                            <TablePlaceholder>
                                No advanced strategies available.
                            </TablePlaceholder>
                        }
                    />
                </Box>
                <Box>
                    <StyledSubtitle sx={{ mt: 4 }}>
                        <span>Custom strategies</span>
                        <AddStrategyButton />
                    </StyledSubtitle>
                    <StrategyTable table={customTable} />
                    <ConditionallyRender
                        condition={customTable.getRowModel().rows.length === 0}
                        show={<CustomStrategyInfo />}
                    />
                </Box>

                <Dialogue
                    open={dialogueMetaData.show}
                    onClick={onDialogConfirm}
                    title={dialogueMetaData?.title}
                    onClose={() =>
                        setDialogueMetaData((prev: IDialogueMetaData) => ({
                            ...prev,
                            show: false,
                        }))
                    }
                />
            </PageContent>
        </>
    );
};
