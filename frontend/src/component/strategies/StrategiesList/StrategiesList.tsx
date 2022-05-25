import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { IconButton, Tooltip, Box } from '@mui/material';
import {
    Delete,
    Edit,
    Extension,
    Visibility,
    VisibilityOff,
} from '@mui/icons-material';
import {
    DELETE_STRATEGY,
    UPDATE_STRATEGY,
} from 'component/providers/AccessProvider/permissions';
import {
    Table,
    SortableTableHeader,
    TableBody,
    TableCell,
    TableRow,
    TablePlaceholder,
    TableSearch,
} from 'component/common/Table';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { PageContent } from 'component/common/PageContent/PageContent';
import { PageHeader } from 'component/common/PageHeader/PageHeader';
import { Dialogue } from 'component/common/Dialogue/Dialogue';
import PermissionIconButton from 'component/common/PermissionIconButton/PermissionIconButton';
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
import { StatusBadge } from 'component/common/StatusBadge/StatusBadge';

interface IDialogueMetaData {
    show: boolean;
    title: string;
    onConfirm: () => void;
}

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
            return Array(5).fill({
                name: 'Context name',
                description: 'Context description when loading',
            });
        }

        return strategies.map(
            ({ name, description, editable, deprecated }) => ({
                name,
                description,
                editable,
                deprecated,
            })
        );
    }, [strategies, loading]);

    const columns = useMemo(
        () => [
            {
                id: 'Icon',
                Cell: () => (
                    <Box
                        data-loading
                        sx={{
                            pl: 2,
                            pr: 1,
                            display: 'flex',
                            alignItems: 'center',
                        }}
                    >
                        <Extension color="disabled" />
                    </Box>
                ),
            },
            {
                Header: 'Name',
                accessor: 'name',
                width: '90%',
                Cell: ({
                    row: {
                        original: { name, description, deprecated, editable },
                    },
                }: any) => {
                    const subTitleText = deprecated
                        ? `${description} (deprecated)`
                        : description;
                    return (
                        <LinkCell
                            data-loading
                            title={formatStrategyName(name)}
                            subtitle={subTitleText}
                            to={`/strategies/${name}`}
                        >
                            <ConditionallyRender
                                condition={!editable}
                                show={() => (
                                    <StatusBadge severity="success">
                                        Predefined
                                    </StatusBadge>
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
                    <Box
                        sx={{ display: 'flex', justifyContent: 'flex-end' }}
                        data-loading
                    >
                        <ConditionallyRender
                            condition={original.deprecated}
                            show={reactivateButton(original)}
                            elseShow={deprecateButton(original)}
                        />
                        {editButton(original)}
                        {deleteButton(original)}
                    </Box>
                ),
                width: 150,
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
        []
    );

    const initialState = useMemo(
        () => ({
            sortBy: [{ id: 'name', desc: false }],
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
            data,
            initialState,
            sortTypes,
            autoResetGlobalFilter: false,
            autoResetSortBy: false,
            disableSortRemove: true,
        },
        useGlobalFilter,
        useSortBy
    );

    const onReactivateStrategy = (strategy: IStrategy) => {
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
    };

    const onDeprecateStrategy = (strategy: IStrategy) => {
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
    };

    const onDeleteStrategy = (strategy: IStrategy) => {
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
    };

    const reactivateButton = (strategy: IStrategy) => (
        <PermissionIconButton
            onClick={() => onReactivateStrategy(strategy)}
            permission={UPDATE_STRATEGY}
            tooltipProps={{ title: 'Reactivate activation strategy' }}
        >
            <VisibilityOff />
        </PermissionIconButton>
    );

    const deprecateButton = (strategy: IStrategy) => (
        <ConditionallyRender
            condition={strategy.name === 'default'}
            show={
                <Tooltip title="You cannot deprecate the default strategy">
                    <div>
                        <IconButton disabled size="large">
                            <Visibility titleAccess="Deprecate strategy" />
                        </IconButton>
                    </div>
                </Tooltip>
            }
            elseShow={
                <div>
                    <PermissionIconButton
                        onClick={() => onDeprecateStrategy(strategy)}
                        permission={UPDATE_STRATEGY}
                        tooltipProps={{ title: 'Deprecate strategy' }}
                    >
                        <Visibility />
                    </PermissionIconButton>
                </div>
            }
        />
    );

    const editButton = (strategy: IStrategy) => (
        <ConditionallyRender
            condition={strategy?.editable}
            show={
                <PermissionIconButton
                    onClick={() =>
                        navigate(`/strategies/${strategy?.name}/edit`)
                    }
                    permission={UPDATE_STRATEGY}
                    tooltipProps={{ title: 'Edit strategy' }}
                >
                    <Edit />
                </PermissionIconButton>
            }
            elseShow={
                <Tooltip title="You cannot edit a built-in strategy" arrow>
                    <div>
                        <IconButton disabled size="large">
                            <Edit titleAccess="Edit strategy" />
                        </IconButton>
                    </div>
                </Tooltip>
            }
        />
    );

    const deleteButton = (strategy: IStrategy) => (
        <ConditionallyRender
            condition={strategy?.editable}
            show={
                <PermissionIconButton
                    onClick={() => onDeleteStrategy(strategy)}
                    permission={DELETE_STRATEGY}
                    tooltipProps={{ title: 'Delete strategy' }}
                >
                    <Delete />
                </PermissionIconButton>
            }
            elseShow={
                <Tooltip title="You cannot delete a built-in strategy" arrow>
                    <div>
                        <IconButton disabled size="large">
                            <Delete titleAccess="Delete strategy" />
                        </IconButton>
                    </div>
                </Tooltip>
            }
        />
    );

    const onDialogConfirm = () => {
        dialogueMetaData?.onConfirm();
        setDialogueMetaData((prev: IDialogueMetaData) => ({
            ...prev,
            show: false,
        }));
    };

    return (
        <PageContent
            isLoading={loading}
            header={
                <PageHeader
                    title="Strategies"
                    actions={
                        <>
                            <TableSearch
                                initialValue={globalFilter}
                                onChange={setGlobalFilter}
                            />
                            <PageHeader.Divider />
                            <AddStrategyButton />
                        </>
                    }
                />
            }
        >
            <SearchHighlightProvider value={globalFilter}>
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
            </SearchHighlightProvider>
            <ConditionallyRender
                condition={rows.length === 0}
                show={
                    <ConditionallyRender
                        condition={globalFilter?.length > 0}
                        show={
                            <TablePlaceholder>
                                No strategies found matching &ldquo;
                                {globalFilter}
                                &rdquo;
                            </TablePlaceholder>
                        }
                        elseShow={
                            <TablePlaceholder>
                                No strategies available. Get started by adding
                                one.
                            </TablePlaceholder>
                        }
                    />
                }
            />

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
