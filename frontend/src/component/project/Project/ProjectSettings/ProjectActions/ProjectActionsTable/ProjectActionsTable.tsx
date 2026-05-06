import { useMemo, useState } from 'react';
import { TablePlaceholder } from 'component/common/Table';
import { VirtualizedTableV8 } from 'component/common/Table/VirtualizedTable/VirtualizedTableV8';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import useToast from 'hooks/useToast';
import { formatUnknownError } from 'utils/formatUnknownError';
import { useMediaQuery } from '@mui/material';
import {
    type ColumnDef,
    getCoreRowModel,
    getSortedRowModel,
    useReactTable,
} from '@tanstack/react-table';
import { sortingFns } from 'utils/sortingFns';
import { TextCell } from 'component/common/Table/cells/TextCell/TextCell';
import theme from 'themes/theme';
import { useConditionallyHiddenColumnsV8 } from 'hooks/useConditionallyHiddenColumnsV8';
import { useActions } from 'hooks/api/getters/useActions/useActions';
import { useActionsApi } from 'hooks/api/actions/useActionsApi/useActionsApi';
import type { IActionSet } from 'interfaces/action';
import { ToggleCell } from 'component/common/Table/cells/ToggleCell/ToggleCell';
import { ProjectActionsSourceCell } from './ProjectActionsSourceCell.tsx';
import { ProjectActionsFiltersCell } from './ProjectActionsFiltersCell.tsx';
import { ProjectActionsActorCell } from './ProjectActionsActorCell.tsx';
import { ProjectActionsActionsCell } from './ProjectActionsActionsCell/ProjectActionsActionsCell.tsx';
import { ProjectActionsTableActionsCell } from './ProjectActionsTableActionsCell.tsx';
import { ProjectActionsModal } from './ProjectActionsModal/ProjectActionsModal.tsx';
import { ProjectActionsDeleteDialog } from './ProjectActionsDeleteDialog.tsx';
import { useServiceAccounts } from 'hooks/api/getters/useServiceAccounts/useServiceAccounts';
import { useSignalEndpoints } from 'hooks/api/getters/useSignalEndpoints/useSignalEndpoints';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import { LinkCell } from 'component/common/Table/cells/LinkCell/LinkCell';
import { ProjectActionsEventsModal } from './ProjectActionsEventsModal/ProjectActionsEventsModal.tsx';

interface IProjectActionsTableProps {
    modalOpen: boolean;
    setModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
    selectedAction?: IActionSet;
    setSelectedAction: React.Dispatch<
        React.SetStateAction<IActionSet | undefined>
    >;
}

export const ProjectActionsTable = ({
    modalOpen,
    setModalOpen,
    selectedAction,
    setSelectedAction,
}: IProjectActionsTableProps) => {
    const { setToastData, setToastApiError } = useToast();

    const projectId = useRequiredPathParam('projectId');
    const { actions, refetch } = useActions(projectId);
    const { toggleActionSet, removeActionSet } = useActionsApi(projectId);

    const { signalEndpoints } = useSignalEndpoints();
    const { serviceAccounts } = useServiceAccounts();

    const [eventsModalOpen, setEventsModalOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);

    const onToggleAction = async (action: IActionSet, enabled: boolean) => {
        try {
            await toggleActionSet(action.id, enabled);
            setToastData({
                text: `"${action.name}" has been ${
                    enabled ? 'enabled' : 'disabled'
                }`,
                type: 'success',
            });
            refetch();
        } catch (error: unknown) {
            setToastApiError(formatUnknownError(error));
        }
    };

    const onDeleteConfirm = async (action: IActionSet) => {
        try {
            await removeActionSet(action.id);
            setToastData({
                text: `"${action.name}" has been deleted`,
                type: 'success',
            });
            refetch();
            setDeleteOpen(false);
        } catch (error: unknown) {
            setToastApiError(formatUnknownError(error));
        }
    };

    const isExtraSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
    const isMediumScreen = useMediaQuery(theme.breakpoints.down('lg'));

    const columns = useMemo<ColumnDef<IActionSet, unknown>[]>(
        () => [
            {
                id: 'name',
                header: 'Name',
                accessorKey: 'name',
                cell: ({ row: { original: action } }) => (
                    <LinkCell
                        title={action.name}
                        subtitle={action.description}
                        onClick={() => {
                            setSelectedAction(action);
                            setModalOpen(true);
                        }}
                    />
                ),
                meta: { minWidth: 60 },
            },
            {
                id: 'source',
                header: 'Source',
                cell: ({ row: { original: action } }) => (
                    <ProjectActionsSourceCell
                        action={action}
                        signalEndpoints={signalEndpoints}
                    />
                ),
            },
            {
                id: 'filters',
                header: 'Filters',
                cell: ({ row: { original: action } }) => (
                    <ProjectActionsFiltersCell action={action} />
                ),
                meta: { maxWidth: 90 },
            },
            {
                id: 'actor',
                header: 'Service account',
                cell: ({ row: { original: action } }) => (
                    <ProjectActionsActorCell
                        action={action}
                        serviceAccounts={serviceAccounts}
                    />
                ),
                meta: { minWidth: 160 },
            },
            {
                id: 'actions',
                header: 'Actions',
                cell: ({ row: { original: action } }) => (
                    <ProjectActionsActionsCell
                        action={action}
                        onCreateAction={() => {
                            setSelectedAction(action);
                            setModalOpen(true);
                        }}
                    />
                ),
                meta: { maxWidth: 130 },
            },
            {
                id: 'enabled',
                header: 'Enabled',
                accessorKey: 'enabled',
                cell: ({ row: { original: action } }) => (
                    <ToggleCell
                        checked={action.enabled}
                        setChecked={(enabled) =>
                            onToggleAction(action, enabled)
                        }
                    />
                ),
                sortingFn: sortingFns.boolean,
                meta: { width: 90, maxWidth: 90 },
            },
            {
                id: 'table-actions',
                header: '',
                cell: ({ row: { original: action } }) => (
                    <ProjectActionsTableActionsCell
                        actionId={action.id}
                        onOpenEvents={() => {
                            setSelectedAction(action);
                            setEventsModalOpen(true);
                        }}
                        onEdit={() => {
                            setSelectedAction(action);
                            setModalOpen(true);
                        }}
                        onDelete={() => {
                            setSelectedAction(action);
                            setDeleteOpen(true);
                        }}
                    />
                ),
                enableSorting: false,
                meta: { width: 50, align: 'center' },
            },
        ],
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [signalEndpoints, serviceAccounts],
    );

    const [initialState] = useState({
        sorting: [{ id: 'name', desc: true }],
    });

    const table = useReactTable({
        columns,
        data: actions,
        initialState,
        defaultColumn: {
            cell: ({ getValue }) => (
                <TextCell value={String(getValue() ?? '')} />
            ),
        },
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        autoResetAll: false,
        enableSortingRemoval: false,
        enableMultiSort: false,
    });

    useConditionallyHiddenColumnsV8(
        [
            {
                condition: isMediumScreen,
                columns: ['actor', 'enabled'],
            },
            {
                condition: isExtraSmallScreen,
                columns: ['filters', 'actions'],
            },
        ],
        table.setColumnVisibility,
        columns,
    );

    const rowCount = table.getRowModel().rows.length;

    return (
        <>
            <VirtualizedTableV8 tableInstance={table} />
            <ConditionallyRender
                condition={rowCount === 0}
                show={
                    <TablePlaceholder>
                        No actions available. Get started by adding one.
                    </TablePlaceholder>
                }
            />
            <ProjectActionsModal
                action={selectedAction}
                open={modalOpen}
                setOpen={setModalOpen}
                onOpenEvents={() => {
                    setModalOpen(false);
                    setEventsModalOpen(true);
                }}
            />
            <ProjectActionsEventsModal
                action={selectedAction}
                open={eventsModalOpen}
                setOpen={setEventsModalOpen}
                onOpenConfiguration={() => {
                    setEventsModalOpen(false);
                    setModalOpen(true);
                }}
            />
            <ProjectActionsDeleteDialog
                action={selectedAction}
                open={deleteOpen}
                setOpen={setDeleteOpen}
                onConfirm={onDeleteConfirm}
            />
        </>
    );
};
