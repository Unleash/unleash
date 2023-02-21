import { useContext } from 'react';
import AccessContext from 'contexts/AccessContext';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import {
    CREATE_API_TOKEN,
    DELETE_API_TOKEN,
    READ_API_TOKEN,
} from 'component/providers/AccessProvider/permissions';
import { AdminAlert } from 'component/common/AdminAlert/AdminAlert';
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

export const ApiTokenPage = () => {
    const { hasAccess } = useContext(AccessContext);
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
    } = useApiTokenTable(tokens, props => (
        <ActionCell>
            <CopyApiTokenButton
                token={props.row.original}
                permission={READ_API_TOKEN}
            />
            <RemoveApiTokenButton
                token={props.row.original}
                permission={DELETE_API_TOKEN}
                onRemove={async () => {
                    await deleteToken(props.row.original.secret);
                    refetch();
                }}
            />
        </ActionCell>
    ));

    return (
        <ConditionallyRender
            condition={hasAccess(READ_API_TOKEN)}
            show={() => (
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
                                        permission={CREATE_API_TOKEN}
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
            )}
            elseShow={() => <AdminAlert />}
        />
    );
};
