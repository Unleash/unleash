import { PermissionGuard } from 'component/common/PermissionGuard/PermissionGuard';
import { ApiTokenTable } from 'component/common/ApiTokenTable/ApiTokenTable';
import { PageContent } from 'component/common/PageContent/PageContent';
import { PageHeader } from 'component/common/PageHeader/PageHeader';
import { CreateApiTokenButton } from 'component/common/ApiTokenTable/CreateApiTokenButton/CreateApiTokenButton';
import { Search } from 'component/common/Search/Search';
import { useApiTokenTable } from 'component/common/ApiTokenTable/useApiTokenTable';
import { useApiTokens } from 'hooks/api/getters/useApiTokens/useApiTokens';
import { ActionCell } from 'component/common/Table/cells/ActionCell/ActionCell';
import { CopyApiTokenButton } from 'component/common/ApiTokenTable/CopyApiTokenButton/CopyApiTokenButton';
import { RemoveApiTokenButton } from 'component/common/ApiTokenTable/RemoveApiTokenButton/RemoveApiTokenButton';
import useApiTokensApi from 'hooks/api/actions/useApiTokensApi/useApiTokensApi';
import {
    ADMIN,
    DELETE_CLIENT_API_TOKEN,
    DELETE_FRONTEND_API_TOKEN,
    READ_CLIENT_API_TOKEN,
    READ_FRONTEND_API_TOKEN,
    CREATE_CLIENT_API_TOKEN,
    CREATE_FRONTEND_API_TOKEN,
} from '@server/types/permissions';

export const ApiTokenPage = () => {
    const { tokens, loading, refetch } = useApiTokens();
    const { deleteToken } = useApiTokensApi();

    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        rows,
        prepareRow,
        state: { globalFilter },
        setGlobalFilter,
        setHiddenColumns,
        columns,
    } = useApiTokenTable(tokens, props => {
        const READ_PERMISSION =
            props.row.original.type === 'client'
                ? READ_CLIENT_API_TOKEN
                : props.row.original.type === 'frontend'
                ? READ_FRONTEND_API_TOKEN
                : ADMIN;
        const DELETE_PERMISSION =
            props.row.original.type === 'client'
                ? DELETE_CLIENT_API_TOKEN
                : props.row.original.type === 'frontend'
                ? DELETE_FRONTEND_API_TOKEN
                : ADMIN;

        return (
            <ActionCell>
                <CopyApiTokenButton
                    token={props.row.original}
                    permission={READ_PERMISSION}
                />
                <RemoveApiTokenButton
                    token={props.row.original}
                    permission={DELETE_PERMISSION}
                    onRemove={async () => {
                        await deleteToken(props.row.original.secret);
                        refetch();
                    }}
                />
            </ActionCell>
        );
    });

    return (
        <PermissionGuard
            permissions={[
                READ_CLIENT_API_TOKEN,
                READ_FRONTEND_API_TOKEN,
                ADMIN,
            ]}
        >
            <PageContent
                header={
                    <PageHeader
                        title={`API access (${rows.length})`}
                        actions={
                            <>
                                <Search
                                    initialValue={globalFilter}
                                    onChange={setGlobalFilter}
                                />
                                <PageHeader.Divider />
                                <CreateApiTokenButton
                                    permission={[
                                        CREATE_FRONTEND_API_TOKEN,
                                        CREATE_CLIENT_API_TOKEN,
                                        ADMIN,
                                    ]}
                                    path="/admin/api/create-token"
                                />
                            </>
                        }
                    />
                }
            >
                <ApiTokenTable
                    loading={loading}
                    headerGroups={headerGroups}
                    setHiddenColumns={setHiddenColumns}
                    prepareRow={prepareRow}
                    getTableBodyProps={getTableBodyProps}
                    getTableProps={getTableProps}
                    rows={rows}
                    columns={columns}
                    globalFilter={globalFilter}
                />
            </PageContent>
        </PermissionGuard>
    );
};
