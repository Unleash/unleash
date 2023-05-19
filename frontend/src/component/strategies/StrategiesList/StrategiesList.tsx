import { useState, useMemo, useCallback, FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Link, Typography, styled } from '@mui/material';
import { Extension } from '@mui/icons-material';
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
import { IStrategy } from 'interfaces/strategy';
import { LinkCell } from 'component/common/Table/cells/LinkCell/LinkCell';
import { SearchHighlightProvider } from 'component/common/Table/SearchHighlightContext/SearchHighlightContext';
import { sortTypes } from 'utils/sortTypes';
import { useTable, useGlobalFilter, useSortBy } from 'react-table';
import { AddStrategyButton } from './AddStrategyButton/AddStrategyButton';
import { StrategySwitch } from './StrategySwitch/StrategySwitch';
import { StrategyEditButton } from './StrategyEditButton/StrategyEditButton';
import { StrategyDeleteButton } from './StrategyDeleteButton/StrategyDeleteButton';
import { Search } from 'component/common/Search/Search';
import { Badge } from 'component/common/Badge/Badge';
import { HelpIcon } from 'component/common/HelpIcon/HelpIcon';
import { CustomStrategyInfo } from '../CustomStrategyInfo/CustomStrategyInfo';

interface IDialogueMetaData {
    show: boolean;
    title: string;
    onConfirm: () => void;
}

const StyledBadge = styled(Badge)(({ theme }) => ({
    marginLeft: theme.spacing(1),
    display: 'inline-block',
}));

const Subtitle: FC<{
    title: string;
    description: string;
    link: string;
}> = ({ title, description, link }) => (
    <Typography component="h2" variant="subtitle1" sx={{ display: 'flex' }}>
        {title}
        <HelpIcon
            htmlTooltip
            tooltip={
                <>
                    <Typography
                        variant="body2"
                        component="p"
                        sx={theme => ({ marginBottom: theme.spacing(1) })}
                    >
                        {description}
                    </Typography>
                    <Link href={link} target="_blank" variant="body2">
                        Read more in the documentation
                    </Link>
                </>
            }
        />
    </Typography>
);

const PredefinedStrategyTitle = () => (
    <Box sx={theme => ({ marginBottom: theme.spacing(1.5) })}>
        <Subtitle
            title="Predefined strategies"
            description="The next level of control comes when you are able to enable a feature for specific users or enable it for a small subset of users. We achieve this level of control with the help of activation strategies."
            link="https://docs.getunleash.io/reference/activation-strategies"
        />
    </Box>
);

const CustomStrategyTitle: FC = () => (
    <Box
        sx={theme => ({
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: theme.spacing(1.5),
        })}
    >
        <Subtitle
            title="Custom strategies"
            description="Custom activation strategies let you define your own activation strategies to use with Unleash."
            link="https://docs.getunleash.io/reference/custom-activation-strategies"
        />
        <AddStrategyButton />
    </Box>
);

export const StrategiesList = () => {
    const navigate = useNavigate();
    const [dialogueMetaData, setDialogueMetaData] = useState<IDialogueMetaData>(
        {
            show: false,
            title: '',
            onConfirm: () => {},
        }
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
            })
        );
        return {
            all,
            predefined: all.filter(strategy => !strategy.editable),
            custom: all.filter(strategy => strategy.editable),
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
                                title: 'Success',
                                text: 'Strategy reactivated successfully',
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
                                title: 'Success',
                                text: 'Strategy deprecated successfully',
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
        ]
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
                            title: 'Success',
                            text: 'Strategy deleted successfully',
                        });
                    } catch (error: unknown) {
                        setToastApiError(formatUnknownError(error));
                    }
                },
            });
        },
        [removeStrategy, refetchStrategies, setToastApiError, setToastData]
    );

    const onEditStrategy = useCallback(
        (strategy: IStrategy) => {
            navigate(`/strategies/${strategy.name}/edit`);
        },
        [navigate]
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
                        <Extension color="disabled" />
                    </Box>
                ),
                disableGlobalFilter: true,
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
                                    <StyledBadge color="disabled">
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
                disableGlobalFilter: true,
                disableSortBy: true,
            },
            {
                accessor: 'description',
                disableSortBy: true,
            },
            {
                accessor: 'sortOrder',
                disableGlobalFilter: true,
                sortType: 'number',
            },
        ],
        [onToggle, onEditStrategy, onDeleteStrategy]
    );

    const initialState = useMemo(
        () => ({
            sortBy: [{ id: 'Name', desc: false }],
            hiddenColumns: ['description', 'sortOrder'],
        }),
        []
    );

    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        rows,
        prepareRow,
        state: { globalFilter },
        setGlobalFilter,
    } = useTable(
        {
            columns: columns as any[], // TODO: fix after `react-table` v8 update
            data: data.predefined,
            initialState,
            sortTypes,
            autoResetGlobalFilter: false,
            autoResetSortBy: false,
            disableSortRemove: true,
        },
        useGlobalFilter,
        useSortBy
    );

    const {
        getTableProps: customGetTableProps,
        getTableBodyProps: customGetTableBodyProps,
        headerGroups: customHeaderGroups,
        rows: customRows,
        prepareRow: customPrepareRow,
        setGlobalFilter: customSetGlobalFilter,
    } = useTable(
        {
            columns: columns as any[], // TODO: fix after `react-table` v8 update
            data: data.custom,
            initialState,
            sortTypes,
            autoResetGlobalFilter: false,
            autoResetSortBy: false,
            disableSortRemove: true,
        },
        useGlobalFilter,
        useSortBy
    );

    const onDialogConfirm = () => {
        dialogueMetaData?.onConfirm();
        setDialogueMetaData((prev: IDialogueMetaData) => ({
            ...prev,
            show: false,
        }));
    };

    let strategyTypeCount = rows.length;

    return (
        <PageContent
            isLoading={loading}
            header={
                <PageHeader
                    title={`Strategy types (${strategyTypeCount})`}
                    actions={
                        <Search
                            initialValue={globalFilter}
                            onChange={(...props) => {
                                setGlobalFilter(...props);
                                customSetGlobalFilter(...props);
                            }}
                        />
                    }
                />
            }
        >
            <SearchHighlightProvider value={globalFilter}>
                <Box sx={theme => ({ paddingBottom: theme.spacing(4) })}>
                    <PredefinedStrategyTitle />
                    <Table {...getTableProps()}>
                        <SortableTableHeader headerGroups={headerGroups} />
                        <TableBody {...getTableBodyProps()}>
                            {rows.map(row => {
                                prepareRow(row);
                                return (
                                    <TableRow hover {...row.getRowProps()}>
                                        {row.cells.map(cell => (
                                            <TableCell {...cell.getCellProps()}>
                                                {cell.render('Cell')}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                    <ConditionallyRender
                        condition={rows.length === 0}
                        show={
                            <ConditionallyRender
                                condition={globalFilter?.length > 0}
                                show={
                                    <TablePlaceholder>
                                        No predefined strategies found matching
                                        &ldquo;
                                        {globalFilter}
                                        &rdquo;
                                    </TablePlaceholder>
                                }
                                elseShow={
                                    <TablePlaceholder>
                                        No strategies available.
                                    </TablePlaceholder>
                                }
                            />
                        }
                    />
                </Box>
                <Box>
                    <CustomStrategyTitle />
                    <Table {...customGetTableProps()}>
                        <SortableTableHeader
                            headerGroups={customHeaderGroups}
                        />
                        <TableBody {...customGetTableBodyProps()}>
                            {customRows.map(row => {
                                customPrepareRow(row);
                                return (
                                    <TableRow hover {...row.getRowProps()}>
                                        {row.cells.map(cell => (
                                            <TableCell {...cell.getCellProps()}>
                                                {cell.render('Cell')}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                    <ConditionallyRender
                        condition={customRows.length === 0}
                        show={
                            <ConditionallyRender
                                condition={globalFilter?.length > 0}
                                show={
                                    <TablePlaceholder>
                                        No custom strategies found matching
                                        &ldquo;
                                        {globalFilter}
                                        &rdquo;
                                    </TablePlaceholder>
                                }
                                elseShow={<CustomStrategyInfo />}
                            />
                        }
                    />
                </Box>
            </SearchHighlightProvider>

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
    );
};
