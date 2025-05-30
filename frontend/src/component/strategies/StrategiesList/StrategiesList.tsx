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

interface IDialogueMetaData {
    show: boolean;
    title: string;
    onConfirm: () => void;
}

const StyledBox = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
}));

const StyledBadge = styled(Badge)(({ theme }) => ({
    marginLeft: theme.spacing(1),
    display: 'inline-block',
}));

const StyledTypography = styled(Typography)(({ theme }) => ({
    display: 'flex',
    fontSize: theme.fontSizes.mainHeader,
}));

const Subtitle: FC<{
    title: string;
    description: string;
    link: string;
}> = ({ title, description, link }) => (
    <StyledTypography>
        {title}
        <HelpIcon
            htmlTooltip
            tooltip={
                <>
                    <Typography
                        variant='body2'
                        component='p'
                        sx={(theme) => ({ marginBottom: theme.spacing(1) })}
                    >
                        {description}
                    </Typography>
                    <Link href={link} target='_blank' variant='body2'>
                        Read more in the documentation
                    </Link>
                </>
            }
        />
    </StyledTypography>
);

const CustomStrategyTitle: FC = () => (
    <Box
        sx={(theme) => ({
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: theme.spacing(1.5),
        })}
    >
        <Subtitle
            title='Custom strategies'
            description='Custom activation strategies let you define your own activation strategies to use with Unleash.'
            link='https://docs.getunleash.io/reference/custom-activation-strategies'
        />
        <AddStrategyButton />
    </Box>
);

const PredefinedStrategyTitle = () => (
    <Box>
        <Subtitle
            title='Predefined strategies'
            description='Activation strategies let you enable a feature only for a specified audience. Different strategies use different parameters. Predefined strategies are bundled with Unleash.'
            link='https://docs.getunleash.io/reference/activation-strategies'
        />
    </Box>
);

const StrategyDeprecationWarning = () => (
    <Alert severity='warning' sx={{ mb: 2 }}>
        Custom strategies are deprecated and may be removed in a future major
        version. We recommend not using custom strategies going forward and
        instead using the predefined strategies with{' '}
        <Link
            href={
                'https://docs.getunleash.io/reference/activation-strategies#constraints'
            }
            target='_blank'
            variant='body2'
        >
            constraints
        </Link>
        . If you have a need for custom strategies that you cannot support with
        constraints, please reach out to us.
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

    const data = useMemo(() => {
        if (loading) {
            const mock = Array(5).fill({
                name: 'Context name',
                description: 'Context description when loading',
            });
            return {
                all: mock,
                predefined: mock,
                custom: mock,
            };
        }

        const all = strategies.map(
            ({ name, description, editable, deprecated }) => ({
                name,
                description,
                editable,
                deprecated,
            }),
        );
        return {
            all,
            predefined: all.filter((strategy) => !strategy.editable),
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

    const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
        useTable(
            {
                columns: columns as any[], // TODO: fix after `react-table` v8 update
                data: data.predefined,
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
        <StyledBox>
            <PageContent
                isLoading={loading}
                header={
                    <PageHeader
                        titleElement={<PredefinedStrategyTitle />}
                        title='Strategy types'
                    />
                }
            >
                <Box>
                    <Table {...getTableProps()}>
                        <SortableTableHeader headerGroups={headerGroups} />
                        <TableBody {...getTableBodyProps()}>
                            {rows.map((row) => {
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
                        condition={rows.length === 0}
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
                        <CustomStrategyTitle />
                    </PageHeader>
                }
            >
                <Box>
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
        </StyledBox>
    );
};
