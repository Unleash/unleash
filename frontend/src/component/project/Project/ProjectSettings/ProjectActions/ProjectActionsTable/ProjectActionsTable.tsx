import { useMemo, useState } from 'react';
import { TablePlaceholder, VirtualizedTable } from 'component/common/Table';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import useToast from 'hooks/useToast';
import { formatUnknownError } from 'utils/formatUnknownError';
import { useMediaQuery } from '@mui/material';
import { useFlexLayout, useSortBy, useTable } from 'react-table';
import { sortTypes } from 'utils/sortTypes';
import { TextCell } from 'component/common/Table/cells/TextCell/TextCell';
import theme from 'themes/theme';
import { useConditionallyHiddenColumns } from 'hooks/useConditionallyHiddenColumns';
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

    const columns = useMemo(
        () => [
            {
                Header: 'Name',
                accessor: 'name',
                minWidth: 60,
                Cell: ({
                    row: { original: action },
                }: {
                    row: { original: IActionSet };
                }) => (
                    <LinkCell
                        title={action.name}
                        subtitle={action.description}
                        onClick={() => {
                            setSelectedAction(action);
                            setModalOpen(true);
                        }}
                    />
                ),
            },
            {
                id: 'source',
                Header: 'Source',
                Cell: ({
                    row: { original: action },
                }: {
                    row: { original: IActionSet };
                }) => (
                    <ProjectActionsSourceCell
                        action={action}
                        signalEndpoints={signalEndpoints}
                    />
                ),
            },
            {
                id: 'filters',
                Header: 'Filters',
                Cell: ({
                    row: { original: action },
                }: {
                    row: { original: IActionSet };
                }) => <ProjectActionsFiltersCell action={action} />,
                maxWidth: 90,
            },
            {
                id: 'actor',
                Header: 'Service account',
                Cell: ({
                    row: { original: action },
                }: {
                    row: { original: IActionSet };
                }) => (
                    <ProjectActionsActorCell
                        action={action}
                        serviceAccounts={serviceAccounts}
                    />
                ),
                minWidth: 160,
            },
            {
                id: 'actions',
                Header: 'Actions',
                Cell: ({
                    row: { original: action },
                }: {
                    row: { original: IActionSet };
                }) => (
                    <ProjectActionsActionsCell
                        action={action}
                        onCreateAction={() => {
                            setSelectedAction(action);
                            setModalOpen(true);
                        }}
                    />
                ),
                maxWidth: 130,
            },
            {
                Header: 'Enabled',
                accessor: 'enabled',
                Cell: ({
                    row: { original: action },
                }: {
                    row: { original: IActionSet };
                }) => (
                    <ToggleCell
                        checked={action.enabled}
                        setChecked={(enabled) =>
                            onToggleAction(action, enabled)
                        }
                    />
                ),
                sortType: 'boolean',
                width: 90,
                maxWidth: 90,
            },
            {
                id: 'table-actions',
                Header: '',
                align: 'center',
                Cell: ({
                    row: { original: action },
                }: {
                    row: { original: IActionSet };
                }) => (
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
                width: 50,
                disableSortBy: true,
            },
        ],
        [signalEndpoints, serviceAccounts],
    );

    const [initialState] = useState({
        sortBy: [{ id: 'name', desc: true }],
    });

    const { headerGroups, rows, prepareRow, setHiddenColumns } = useTable(
        {
            columns: columns as any,
            data: actions,
            initialState,
            sortTypes,
            autoResetHiddenColumns: false,
            autoResetSortBy: false,
            disableSortRemove: true,
            disableMultiSort: true,
            defaultColumn: {
                Cell: TextCell,
            },
        },
        useSortBy,
        useFlexLayout,
    );

    useConditionallyHiddenColumns(
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
        setHiddenColumns,
        columns,
    );

    return (
        <>
            <VirtualizedTable
                rows={rows}
                headerGroups={headerGroups}
                prepareRow={prepareRow}
            />
            <ConditionallyRender
                condition={rows.length === 0}
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
