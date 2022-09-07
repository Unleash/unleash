import { Table, TableBody, TableCell, TableRow } from 'component/common/Table';
import { useMemo, useState, useCallback } from 'react';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { PageContent } from 'component/common/PageContent/PageContent';
import useAddons from 'hooks/api/getters/useAddons/useAddons';
import useToast from 'hooks/useToast';
import useAddonsApi from 'hooks/api/actions/useAddonsApi/useAddonsApi';
import { IAddon } from 'interfaces/addons';
import { Dialogue } from 'component/common/Dialogue/Dialogue';
import { formatUnknownError } from 'utils/formatUnknownError';
import { LinkCell } from 'component/common/Table/cells/LinkCell/LinkCell';
import { sortTypes } from 'utils/sortTypes';
import { useTable, useSortBy } from 'react-table';
import { PageHeader } from 'component/common/PageHeader/PageHeader';
import { SortableTableHeader, TablePlaceholder } from 'component/common/Table';
import { IconCell } from 'component/common/Table/cells/IconCell/IconCell';
import { AddonIcon } from '../AddonIcon/AddonIcon';
import { ConfiguredAddonsActionsCell } from './ConfiguredAddonsActionCell/ConfiguredAddonsActionsCell';

export const ConfiguredAddons = () => {
    const { refetchAddons, addons, loading } = useAddons();
    const { updateAddon, removeAddon } = useAddonsApi();
    const { setToastData, setToastApiError } = useToast();
    const [showDelete, setShowDelete] = useState(false);
    const [deletedAddon, setDeletedAddon] = useState<IAddon>({
        id: 0,
        provider: '',
        description: '',
        enabled: false,
        events: [],
        parameters: {},
    });

    const data = useMemo(() => {
        if (loading) {
            return Array(5).fill({
                name: 'Addon name',
                description: 'Addon description when loading',
            });
        }

        return addons.map(addon => ({
            ...addon,
        }));
    }, [addons, loading]);

    const toggleAddon = useCallback(
        async (addon: IAddon) => {
            try {
                await updateAddon({ ...addon, enabled: !addon.enabled });
                refetchAddons();
                setToastData({
                    type: 'success',
                    title: 'Success',
                    text: !addon.enabled
                        ? 'Addon is now enabled'
                        : 'Addon is now disabled',
                });
            } catch (error: unknown) {
                setToastApiError(formatUnknownError(error));
                throw error; // caught by optimistic update
            }
        },
        [setToastApiError, refetchAddons, setToastData, updateAddon]
    );

    const columns = useMemo(
        () => [
            {
                id: 'Icon',
                Cell: ({
                    row: {
                        original: { provider },
                    },
                }: any) => (
                    <IconCell icon={<AddonIcon name={provider as string} />} />
                ),
            },
            {
                Header: 'Name',
                accessor: 'provider',
                width: '90%',
                Cell: ({
                    row: {
                        original: { provider, description },
                    },
                }: any) => {
                    return (
                        <LinkCell
                            data-loading
                            title={provider}
                            subtitle={description}
                        />
                    );
                },
                sortType: 'alphanumeric',
            },
            {
                Header: 'Actions',
                id: 'Actions',
                align: 'center',
                Cell: ({
                    row: { original },
                }: {
                    row: { original: IAddon };
                }) => (
                    <ConfiguredAddonsActionsCell
                        setShowDelete={setShowDelete}
                        toggleAddon={toggleAddon}
                        setDeletedAddon={setDeletedAddon}
                        original={original}
                    />
                ),
                width: 150,
                disableSortBy: true,
            },
            {
                accessor: 'description',
                disableSortBy: true,
            },
        ],
        [toggleAddon]
    );

    const initialState = useMemo(
        () => ({
            sortBy: [{ id: 'provider', desc: false }],
            hiddenColumns: ['description'],
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
        useSortBy
    );

    const onRemoveAddon = async (addon: IAddon) => {
        try {
            await removeAddon(addon.id);
            refetchAddons();
            setToastData({
                type: 'success',
                title: 'Success',
                text: 'Deleted addon successfully',
            });
        } catch (error: unknown) {
            setToastApiError(formatUnknownError(error));
        }
    };

    return (
        <PageContent
            isLoading={loading}
            header={<PageHeader title={`Configured addons (${rows.length})`} />}
            sx={theme => ({ marginBottom: theme.spacing(2) })}
        >
            <Table {...getTableProps()}>
                <SortableTableHeader headerGroups={headerGroups} />
                <TableBody {...getTableBodyProps()}>
                    {rows.map(row => {
                        prepareRow(row);
                        return (
                            <TableRow hover {...row.getRowProps()}>
                                {row.cells.map(cell => (
                                    <TableCell
                                        {...cell.getCellProps()}
                                        padding="none"
                                    >
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
                                No addons found matching &ldquo;
                                {globalFilter}
                                &rdquo;
                            </TablePlaceholder>
                        }
                        elseShow={
                            <TablePlaceholder>
                                No addons configured
                            </TablePlaceholder>
                        }
                    />
                }
            />
            <Dialogue
                open={showDelete}
                onClick={() => {
                    onRemoveAddon(deletedAddon);
                    setShowDelete(false);
                }}
                onClose={() => {
                    setShowDelete(false);
                }}
                title="Confirm deletion"
            >
                <div>Are you sure you want to delete this Addon?</div>
            </Dialogue>
        </PageContent>
    );
};
