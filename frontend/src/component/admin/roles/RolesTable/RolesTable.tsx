import { useMemo, useState } from 'react';
import { TablePlaceholder, VirtualizedTable } from 'component/common/Table';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { IRole, PredefinedRoleType } from 'interfaces/role';
import useToast from 'hooks/useToast';
import { formatUnknownError } from 'utils/formatUnknownError';
import { PageContent } from 'component/common/PageContent/PageContent';
import { useMediaQuery } from '@mui/material';
import { SearchHighlightProvider } from 'component/common/Table/SearchHighlightContext/SearchHighlightContext';
import { useFlexLayout, useSortBy, useTable } from 'react-table';
import { sortTypes } from 'utils/sortTypes';
import { TextCell } from 'component/common/Table/cells/TextCell/TextCell';
import theme from 'themes/theme';
import { useConditionallyHiddenColumns } from 'hooks/useConditionallyHiddenColumns';
import { useSearch } from 'hooks/useSearch';
import { IconCell } from 'component/common/Table/cells/IconCell/IconCell';
import { SupervisedUserCircle } from '@mui/icons-material';
import { RolesActionsCell } from './RolesActionsCell/RolesActionsCell';
import { RolesCell } from './RolesCell/RolesCell';
import { RoleDeleteDialog } from './RoleDeleteDialog/RoleDeleteDialog';
import { useRolesApi } from 'hooks/api/actions/useRolesApi/useRolesApi';
import { useRoles } from 'hooks/api/getters/useRoles/useRoles';
import { RoleModal } from '../RoleModal/RoleModal';
import { RolePermissionsCell } from './RolePermissionsCell/RolePermissionsCell';
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

    const { roles, projectRoles, refetch, loading } = useRoles();
    const { removeRole } = useRolesApi();

    const [deleteOpen, setDeleteOpen] = useState(false);

    const onDeleteConfirm = async (role: IRole) => {
        try {
            await removeRole(role.id);
            setToastData({
                title: `${role.name} has been deleted`,
                type: 'success',
            });
            refetch();
            setDeleteOpen(false);
        } catch (error: unknown) {
            setToastApiError(formatUnknownError(error));
        }
    };

    const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));

    const columns = useMemo(
        () => [
            {
                id: 'Icon',
                Cell: () => (
                    <IconCell
                        icon={<SupervisedUserCircle color="disabled" />}
                    />
                ),
                disableGlobalFilter: true,
                maxWidth: 50,
            },
            {
                Header: 'Role',
                accessor: 'name',
                Cell: ({ row: { original: role } }: any) => (
                    <RolesCell role={role} />
                ),
                searchable: true,
                minWidth: 100,
            },
            {
                id: 'permissions',
                Header: 'Permissions',
                Cell: RolePermissionsCell,
                maxWidth: 140,
            },
            {
                Header: 'Actions',
                id: 'Actions',
                align: 'center',
                Cell: ({ row: { original: role } }: any) => (
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
                width: 150,
                disableSortBy: true,
            },
            // Always hidden -- for search
            {
                accessor: 'description',
                Header: 'Description',
                searchable: true,
            },
        ],
        []
    );

    const [initialState] = useState({
        sortBy: [{ id: 'name' }],
        hiddenColumns: ['description'],
    });

    const { data, getSearchText } = useSearch(
        columns,
        searchValue,
        type === ROOT_ROLE_TYPE ? roles : projectRoles
    );

    const { headerGroups, rows, prepareRow, setHiddenColumns } = useTable(
        {
            columns: columns as any,
            data,
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
        useFlexLayout
    );

    useConditionallyHiddenColumns(
        [
            {
                condition: isSmallScreen,
                columns: ['Icon'],
            },
        ],
        setHiddenColumns,
        columns
    );

    return (
        <PageContent isLoading={loading}>
            <SearchHighlightProvider value={getSearchText(searchValue)}>
                <VirtualizedTable
                    rows={rows}
                    headerGroups={headerGroups}
                    prepareRow={prepareRow}
                />
            </SearchHighlightProvider>
            <ConditionallyRender
                condition={rows.length === 0}
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
