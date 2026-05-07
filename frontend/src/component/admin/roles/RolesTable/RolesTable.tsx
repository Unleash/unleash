import { useMemo, useState } from 'react';
import { TablePlaceholder } from 'component/common/Table';
import { VirtualizedTableV8 } from 'component/common/Table/VirtualizedTable/VirtualizedTableV8';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import type { IRole, PredefinedRoleType } from 'interfaces/role';
import useToast from 'hooks/useToast';
import { formatUnknownError } from 'utils/formatUnknownError';
import { PageContent } from 'component/common/PageContent/PageContent';
import { useTheme, useMediaQuery } from '@mui/material';
import { SearchHighlightProvider } from 'component/common/Table/SearchHighlightContext/SearchHighlightContext';
import {
    type ColumnDef,
    getCoreRowModel,
    getSortedRowModel,
    useReactTable,
} from '@tanstack/react-table';
import { TextCell } from 'component/common/Table/cells/TextCell/TextCell';
import { useConditionallyHiddenColumnsV8 } from 'hooks/useConditionallyHiddenColumnsV8';
import { useSearch } from 'hooks/useSearch';
import { IconCell } from 'component/common/Table/cells/IconCell/IconCell';
import SupervisedUserCircle from '@mui/icons-material/SupervisedUserCircle';
import { RolesActionsCell } from './RolesActionsCell/RolesActionsCell.tsx';
import { RolesCell } from './RolesCell/RolesCell.tsx';
import { RoleDeleteDialog } from './RoleDeleteDialog/RoleDeleteDialog.tsx';
import { useRolesApi } from 'hooks/api/actions/useRolesApi/useRolesApi';
import { useRoles } from 'hooks/api/getters/useRoles/useRoles';
import { RoleModal } from '../RoleModal/RoleModal.tsx';
import { RolePermissionsCell } from './RolePermissionsCell/RolePermissionsCell.tsx';
import { ROOT_ROLE_TYPE } from '@server/util/constants';

interface IRolesTableProps {
    type?: PredefinedRoleType;
    searchValue?: string;
    modalOpen: boolean;
    setModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
    selectedRole?: IRole;
    setSelectedRole: React.Dispatch<React.SetStateAction<IRole | undefined>>;
}

export const RolesTable = ({
    type = ROOT_ROLE_TYPE,
    searchValue = '',
    modalOpen,
    setModalOpen,
    selectedRole,
    setSelectedRole,
}: IRolesTableProps) => {
    const { setToastData, setToastApiError } = useToast();
    const theme = useTheme();

    const { roles, projectRoles, refetch, loading } = useRoles();
    const { removeRole } = useRolesApi();

    const [deleteOpen, setDeleteOpen] = useState(false);

    const onDeleteConfirm = async (role: IRole) => {
        try {
            await removeRole(role.id);
            setToastData({
                text: `${role.name} has been deleted`,
                type: 'success',
            });
            refetch();
            setDeleteOpen(false);
        } catch (error: unknown) {
            setToastApiError(formatUnknownError(error));
        }
    };

    const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));

    const columns = useMemo<ColumnDef<IRole, unknown>[]>(
        () => [
            {
                id: 'Icon',
                cell: () => (
                    <IconCell
                        icon={<SupervisedUserCircle color='disabled' />}
                    />
                ),
                enableGlobalFilter: false,
                meta: { maxWidth: 50 },
            },
            {
                id: 'name',
                header: 'Role',
                accessorKey: 'name',
                cell: ({ row: { original: role } }) => (
                    <RolesCell role={role} />
                ),
                meta: { searchable: true, minWidth: 100 },
            },
            {
                id: 'permissions',
                header: 'Permissions',
                cell: RolePermissionsCell,
                meta: { maxWidth: 140 },
            },
            {
                id: 'Actions',
                header: 'Actions',
                cell: ({ row: { original: role } }) => (
                    <RolesActionsCell
                        role={role}
                        onEdit={() => {
                            setSelectedRole(role);
                            setModalOpen(true);
                        }}
                        onDelete={() => {
                            setSelectedRole(role);
                            setDeleteOpen(true);
                        }}
                    />
                ),
                enableSorting: false,
                meta: { width: 150, align: 'center' },
            },
            // Always hidden -- for search
            {
                id: 'description',
                header: 'Description',
                accessorKey: 'description',
                meta: { searchable: true },
            },
        ],
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [],
    );

    const [initialState] = useState({
        sorting: [{ id: 'name', desc: false }],
        columnVisibility: { description: false },
    });

    const { data, getSearchText } = useSearch(
        columns,
        searchValue,
        type === ROOT_ROLE_TYPE ? roles : projectRoles,
    );

    const table = useReactTable({
        columns,
        data,
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
                condition: isSmallScreen,
                columns: ['Icon'],
            },
        ],
        table.setColumnVisibility,
        columns,
    );

    const rowCount = table.getRowModel().rows.length;

    return (
        <PageContent isLoading={loading}>
            <SearchHighlightProvider value={getSearchText(searchValue)}>
                <VirtualizedTableV8 tableInstance={table} />
            </SearchHighlightProvider>
            <ConditionallyRender
                condition={rowCount === 0}
                show={
                    <ConditionallyRender
                        condition={searchValue?.length > 0}
                        show={
                            <TablePlaceholder>
                                No {type} roles found matching &ldquo;
                                {searchValue}
                                &rdquo;
                            </TablePlaceholder>
                        }
                        elseShow={
                            <TablePlaceholder>
                                No {type} roles available. Get started by adding
                                one.
                            </TablePlaceholder>
                        }
                    />
                }
            />
            <RoleModal
                type={type}
                roleId={selectedRole?.id}
                open={modalOpen}
                setOpen={setModalOpen}
            />
            <RoleDeleteDialog
                role={selectedRole}
                open={deleteOpen}
                setOpen={setDeleteOpen}
                onConfirm={onDeleteConfirm}
            />
        </PageContent>
    );
};
