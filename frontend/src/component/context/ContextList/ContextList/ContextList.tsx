import { type FC, useMemo, useState } from 'react';
import {
    type ColumnDef,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getSortedRowModel,
    useReactTable,
} from '@tanstack/react-table';
import {
    Table,
    TableBody,
    TableCell,
    TableRow,
    TablePlaceholder,
} from 'component/common/Table';
import { SortableTableHeader } from 'component/common/Table/SortableTableHeader/SortableTableHeader';
import { PageContent } from 'component/common/PageContent/PageContent';
import { PageHeader } from 'component/common/PageHeader/PageHeader';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { Dialogue as ConfirmDialogue } from 'component/common/Dialogue/Dialogue';
import { useScopedUnleashContext } from 'hooks/api/getters/useUnleashContext/useScopedUnleashContext';
import useContextsApi from 'hooks/api/actions/useContextsApi/useContextsApi';
import useToast from 'hooks/useToast';
import { formatUnknownError } from 'utils/formatUnknownError';
import { AddContextButton } from '../AddContextButton.tsx';
import { SearchHighlightProvider } from 'component/common/Table/SearchHighlightContext/SearchHighlightContext';
import { LinkCell } from 'component/common/Table/cells/LinkCell/LinkCell';
import { ContextActionsCell } from '../ContextActionsCell.tsx';
import Adjust from '@mui/icons-material/Adjust';
import { IconCell } from 'component/common/Table/cells/IconCell/IconCell';
import { Search } from 'component/common/Search/Search';
import { UsedInCell } from '../UsedInCell.tsx';
import { useOptionalPathParam } from 'hooks/useOptionalPathParam.ts';
import { useTracking } from 'hooks/useTracking';
import type { Tracking } from 'utils/trackingEvents';
import {
    contextFieldTrackingProps,
    type ContextFieldTrackingProps,
} from 'component/context/contextFieldTrackingProps';

const contextFieldDeletedTracking: Tracking = {
    event: 'context-fields',
    type: 'deleted',
};

type ContextRow = {
    name: string;
    description: string;
    sortOrder: number;
    usedInProjects?: number;
    usedInFeatures?: number;
};

const ContextList: FC = () => {
    const projectId = useOptionalPathParam('projectId');
    const [showDelDialogue, setShowDelDialogue] = useState(false);
    // Props are snapshotted with the name so a background refetch cannot desync the
    // opened row from the submitted and succeeded rows of the same series.
    const [deleteTarget, setDeleteTarget] = useState<{
        name: string;
        props: ContextFieldTrackingProps;
    }>();
    const [globalFilter, setGlobalFilter] = useState('');
    const { context, refetchUnleashContext, loading } =
        useScopedUnleashContext();
    const { removeContext, loading: removingContext } =
        useContextsApi(projectId);
    const { setToastData, setToastApiError } = useToast();
    const deleteTracking = useTracking(contextFieldDeletedTracking);

    const trackingPropsFor = (name: string | undefined) => {
        const field = context.find((context) => context.name === name);
        return contextFieldTrackingProps({
            name: name ?? '',
            legalValues: field?.legalValues ?? [],
            description: field?.description,
            stickiness: field?.stickiness ?? false,
        });
    };

    const data = useMemo<ContextRow[]>(() => {
        if (loading) {
            return Array(5).fill({
                name: 'Context name',
                description: 'Context description when loading',
                sortOrder: 0,
            });
        }

        return context
            .map(
                ({
                    name,
                    description,
                    sortOrder,
                    usedInProjects,
                    usedInFeatures,
                }) => ({
                    name,
                    description: description ?? '',
                    sortOrder: sortOrder ?? 0,
                    usedInProjects,
                    usedInFeatures,
                }),
            )
            .sort((a, b) => a.sortOrder - b.sortOrder);
    }, [context, loading]);

    const columns = useMemo<ColumnDef<ContextRow, unknown>[]>(
        () => [
            {
                id: 'Icon',
                cell: () => <IconCell icon={<Adjust color='disabled' />} />,
                enableGlobalFilter: false,
            },
            {
                id: 'name',
                header: 'Name',
                accessorKey: 'name',
                cell: ({
                    row: {
                        original: { name, description },
                    },
                }) => {
                    const editUrl = projectId
                        ? `/projects/${projectId}/settings/context/edit/${name}`
                        : `/context/edit/${name}`;

                    return (
                        <LinkCell
                            title={name}
                            to={editUrl}
                            subtitle={description}
                        />
                    );
                },
                sortingFn: 'alphanumeric',
                meta: { width: '70%' },
            },
            {
                id: 'usedIn',
                header: 'Used in',
                cell: ({ row: { original } }) => (
                    // UsedInCell types its prop against
                    // IUnleashContextDefinition; runtime only reads
                    // usedInProjects/usedInFeatures, present on ContextRow.
                    <UsedInCell original={original as never} />
                ),
                meta: { width: '60%' },
            },
            {
                id: 'Actions',
                header: 'Actions',
                cell: ({
                    row: {
                        original: { name, usedInFeatures },
                    },
                }) => (
                    <ContextActionsCell
                        name={name}
                        onDelete={() => {
                            setDeleteTarget({
                                name,
                                props: trackingPropsFor(name),
                            });
                            setShowDelDialogue(true);
                        }}
                        allowDelete={usedInFeatures === 0}
                    />
                ),
                enableSorting: false,
                enableGlobalFilter: false,
                meta: { width: 200, align: 'center' },
            },
            {
                id: 'description',
                accessorKey: 'description',
                enableSorting: false,
            },
            {
                id: 'sortOrder',
                accessorKey: 'sortOrder',
                enableGlobalFilter: false,
            },
        ],
        [projectId, context],
    );

    const initialState = useMemo(
        () => ({
            sorting: [{ id: 'name', desc: false }],
            columnVisibility: { description: false, sortOrder: false },
        }),
        [],
    );

    const onDeleteContext = async () => {
        if (deleteTarget === undefined) {
            setToastApiError(formatUnknownError(new Error()));
        } else {
            try {
                await deleteTracking.trackMutation(
                    () => removeContext(deleteTarget.name),
                    deleteTarget.props,
                );
                refetchUnleashContext();
                setToastData({
                    type: 'success',
                    text: 'Context field deleted',
                });
            } catch (error) {
                setToastApiError(formatUnknownError(error));
            }
        }

        setDeleteTarget(undefined);
        setShowDelDialogue(false);
    };

    const table = useReactTable({
        columns,
        data,
        initialState,
        state: { globalFilter },
        onGlobalFilterChange: setGlobalFilter,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        autoResetAll: false,
        enableSortingRemoval: false,
    });

    const rows = table.getRowModel().rows;

    return (
        <PageContent
            isLoading={loading}
            header={
                <PageHeader
                    title={`Context fields (${rows.length})`}
                    actions={
                        <>
                            <Search
                                initialValue={globalFilter}
                                onChange={(value) => setGlobalFilter(value)}
                            />
                            <PageHeader.Divider />
                            <AddContextButton />
                        </>
                    }
                />
            }
        >
            <SearchHighlightProvider value={globalFilter}>
                <Table>
                    <SortableTableHeader tableInstance={table} />
                    <TableBody>
                        {rows.map((row) => (
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
            </SearchHighlightProvider>
            <ConditionallyRender
                condition={rows.length === 0}
                show={
                    <ConditionallyRender
                        condition={globalFilter?.length > 0}
                        show={
                            <TablePlaceholder>
                                No contexts found matching &ldquo;
                                {globalFilter}
                                &rdquo;
                            </TablePlaceholder>
                        }
                        elseShow={
                            <TablePlaceholder>
                                No context fields available. Get started by
                                adding one.
                            </TablePlaceholder>
                        }
                    />
                }
            />
            <ConfirmDialogue
                open={showDelDialogue}
                onClick={onDeleteContext}
                onClose={() => {
                    setDeleteTarget(undefined);
                    setShowDelDialogue(false);
                }}
                title='Really delete context field'
                disabledPrimaryButton={removingContext}
                tracking={{
                    ...contextFieldDeletedTracking,
                    props: deleteTarget?.props,
                }}
            />
        </PageContent>
    );
};

export default ContextList;
