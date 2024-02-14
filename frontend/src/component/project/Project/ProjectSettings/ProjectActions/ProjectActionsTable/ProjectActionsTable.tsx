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
import { IActionSet } from 'interfaces/action';
import { ToggleCell } from 'component/common/Table/cells/ToggleCell/ToggleCell';
import { ProjectActionsTriggerCell } from './ProjectActionsTriggerCell';
import { ProjectActionsFiltersCell } from './ProjectActionsFiltersCell';
import { ProjectActionsActorCell } from './ProjectActionsActorCell';
import { ProjectActionsActionsCell } from './ProjectActionsActionsCell';
import { ProjectActionsTableActionsCell } from './ProjectActionsTableActionsCell';
import { ProjectActionsModal } from './ProjectActionsModal/ProjectActionsModal';
import { ProjectActionsDeleteDialog } from './ProjectActionsDeleteDialog';
import { useServiceAccounts } from 'hooks/api/getters/useServiceAccounts/useServiceAccounts';
import { useIncomingWebhooks } from 'hooks/api/getters/useIncomingWebhooks/useIncomingWebhooks';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';

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

    const { incomingWebhooks } = useIncomingWebhooks();
    const { serviceAccounts } = useServiceAccounts();

    const [deleteOpen, setDeleteOpen] = useState(false);

    const onToggleAction = async (action: IActionSet, enabled: boolean) => {
        try {
            await toggleActionSet(action.id, enabled);
            setToastData({
                title: `"${action.name}" has been ${
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
                title: `"${action.name}" has been deleted`,
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
            },
            {
                id: 'trigger',
                Header: 'Trigger',
                Cell: ({
                    row: { original: action },
                }: { row: { original: IActionSet } }) => (
                    <ProjectActionsTriggerCell
                        action={action}
                        incomingWebhooks={incomingWebhooks}
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
                }: { row: { original: IActionSet } }) => (
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
                }: { row: { original: IActionSet } }) => (
                    <ProjectActionsTableActionsCell
                        actionId={action.id}
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
        [incomingWebhooks, serviceAccounts],
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
