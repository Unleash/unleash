import { useState, useMemo, useCallback, type FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, Box, Link, Typography, styled } from '@mui/material';
import Extension from '@mui/icons-material/Extension';
import {
    Table,
    SortableTableHeader,
    TableBody,
    TableCell,
    TableRow,
    TablePlaceholder,
} from 'component/common/Table';
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
import { sortTypes } from 'utils/sortTypes';
import { useTable, useSortBy } from 'react-table';
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

const StrategyDeprecationWarning = () => (
    <Alert severity='warning' sx={{ mb: 2 }}>
        Custom strategies are deprecated and may be removed in a future major
        version. We recommend not using custom strategies going forward and
        instead using the gradual rollout strategy with{' '}
        <Link
            href={
                'https://docs.getunleash.io/reference/activation-strategies#constraints'
            }
            target='_blank'
            rel='noopener noreferrer'
        >
            constraints
        </Link>
        . If you have a need for custom strategies that you cannot support with
        constraints, please reach out to us.
    </Alert>
);

const RecommendationAlert = () => (
    <Alert severity='info' sx={{ mb: 2 }}>
        We recommend using gradual rollout. You can customize it with{' '}
        <Link
            href='https://docs.getunleash.io/reference/activation-strategies#constraints'
            target='_blank'
            rel='noopener noreferrer'
        >
            constraints
        </Link>{' '}
        and{' '}
        <Link
            href='https://docs.getunleash.io/reference/activation-strategies#variants'
            target='_blank'
            rel='noopener noreferrer'
        >
            variants
        </Link>
        .
    </Alert>
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

    const data = useMemo(() => {
        if (loading) {
            const mock = Array(5).fill({
                name: 'Context name',
                description: 'Context description when loading',
            });
            return {
                all: mock,
                standard: mock,
                advanced: mock,
                custom: mock,
            };
        }

        const all = strategies.map(
            ({ name, description, editable, deprecated, advanced }) => ({
                name,
                description,
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

    const columns = useMemo(
        () => [
            {
                id: 'Icon',
                Cell: () => (
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
                Header: 'Name',
                accessor: (row: any) => formatStrategyName(row.name),
                width: '90%',
                Cell: ({
                    row: {
                        original: { name, description, deprecated },
                    },
                }: any) => {
                    return (
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
                    );
                },
                sortType: 'alphanumeric',
            },
            {
                Header: 'Actions',
                id: 'Actions',
                align: 'center',
                Cell: ({ row: { original } }: any) => (
                    <ActionCell>
                        <StrategySwitch
                            deprecated={original.deprecated}
                            onToggle={onToggle(original)}
                        />
                        <ConditionallyRender
                            condition={original.editable}
                            show={
                                <>
                                    <ActionCell.Divider />
                                    <StrategyEditButton
                                        strategy={original}
                                        onClick={() => onEditStrategy(original)}
                                    />
                                    <StrategyDeleteButton
                                        strategy={original}
                                        onClick={() =>
                                            onDeleteStrategy(original)
                                        }
                                    />
                                </>
                            }
                        />
                    </ActionCell>
                ),
                width: 150,
                minWidth: 120,
                disableSortBy: true,
            },
            {
                accessor: 'description',
                disableSortBy: true,
            },
            {
                accessor: 'sortOrder',
                sortType: 'number',
            },
        ],
        [onToggle, onEditStrategy, onDeleteStrategy],
    );

    const initialState = useMemo(
        () => ({
            sortBy: [{ id: 'Name', desc: false }],
            hiddenColumns: ['description', 'sortOrder'],
        }),
        [],
    );

    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        rows: standardRows,
        prepareRow,
    } = useTable(
        {
            columns: columns as any[], // TODO: fix after `react-table` v8 update
            data: data.standard,
            initialState,
            sortTypes,
            autoResetSortBy: false,
            disableSortRemove: true,
            autoResetHiddenColumns: false,
        },
        useSortBy,
    );

    const {
        getTableProps: advancedGetTableProps,
        getTableBodyProps: advancedGetTableBodyProps,
        headerGroups: advancedHeaderGroups,
        rows: advancedRows,
        prepareRow: advancedPrepareRow,
    } = useTable(
        {
            columns: columns as any[], // TODO: fix after `react-table` v8 update
            data: data.advanced,
            initialState,
            sortTypes,
            autoResetSortBy: false,
            disableSortRemove: true,
            autoResetHiddenColumns: false,
        },
        useSortBy,
    );

    const {
        getTableProps: customGetTableProps,
        getTableBodyProps: customGetTableBodyProps,
        headerGroups: customHeaderGroups,
        rows: customRows,
        prepareRow: customPrepareRow,
    } = useTable(
        {
            columns: columns as any[], // TODO: fix after `react-table` v8 update
            data: data.custom,
            initialState,
            sortTypes,
            autoResetSortBy: false,
            disableSortRemove: true,
            autoResetHiddenColumns: false,
        },
        useSortBy,
    );

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
                    <PageHeader>
                        <Title
                            title='Standard strategies'
                            description='Standard strategies let you enable a feature only for a specified audience. Select a starting setup, then customize your strategy with targeting and variants.'
                            link='https://docs.getunleash.io/reference/activation-strategies'
                        />
                    </PageHeader>
                }
            >
                <Box>
                    <RecommendationAlert />
                    <Table {...getTableProps()}>
                        <SortableTableHeader headerGroups={headerGroups} />
                        <TableBody {...getTableBodyProps()}>
                            {standardRows.map((row) => {
                                prepareRow(row);
                                const { key, ...rowProps } = row.getRowProps();
                                return (
                                    <TableRow hover key={key} {...rowProps}>
                                        {row.cells.map((cell) => {
                                            const { key, ...cellProps } =
                                                cell.getCellProps();

                                            return (
                                                <TableCell
                                                    key={key}
                                                    {...cellProps}
                                                >
                                                    {cell.render('Cell')}
                                                </TableCell>
                                            );
                                        })}
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                    <ConditionallyRender
                        condition={standardRows.length === 0}
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
                    <PageHeader>
                        <Title
                            title='Advanced and custom strategies'
                            description='Advanced strategies let you target based on specific properties. Custom activation strategies let you define your own activation strategies to use with Unleash.'
                            link='https://docs.getunleash.io/reference/activation-strategies#custom-strategies'
                        />
                    </PageHeader>
                }
                sx={{ mt: 2 }}
            >
                <Box>
                    <StyledSubtitle>
                        <span>Advanced strategies</span>
                    </StyledSubtitle>
                    <Table {...advancedGetTableProps()}>
                        <SortableTableHeader
                            headerGroups={advancedHeaderGroups}
                        />
                        <TableBody {...advancedGetTableBodyProps()}>
                            {advancedRows.map((row) => {
                                advancedPrepareRow(row);
                                const { key, ...rowProps } = row.getRowProps();
                                return (
                                    <TableRow hover key={key} {...rowProps}>
                                        {row.cells.map((cell) => {
                                            const { key, ...cellProps } =
                                                cell.getCellProps();

                                            return (
                                                <TableCell
                                                    key={key}
                                                    {...cellProps}
                                                >
                                                    {cell.render('Cell')}
                                                </TableCell>
                                            );
                                        })}
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                    <ConditionallyRender
                        condition={advancedRows.length === 0}
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
                    <StrategyDeprecationWarning />
                    <Table {...customGetTableProps()}>
                        <SortableTableHeader
                            headerGroups={customHeaderGroups}
                        />
                        <TableBody {...customGetTableBodyProps()}>
                            {customRows.map((row) => {
                                customPrepareRow(row);
                                const { key, ...rowProps } = row.getRowProps();
                                return (
                                    <TableRow hover key={key} {...rowProps}>
                                        {row.cells.map((cell) => {
                                            const { key, ...cellProps } =
                                                cell.getCellProps();

                                            return (
                                                <TableCell
                                                    key={key}
                                                    {...cellProps}
                                                >
                                                    {cell.render('Cell')}
                                                </TableCell>
                                            );
                                        })}
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                    <ConditionallyRender
                        condition={customRows.length === 0}
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
