import { ApiTokenTable } from 'component/common/ApiTokenTable/ApiTokenTable';
import { PageContent } from 'component/common/PageContent/PageContent';
import { PageHeader } from 'component/common/PageHeader/PageHeader';
import { Search } from 'component/common/Search/Search';
import { useApiTokens } from 'hooks/api/getters/useApiTokens/useApiTokens';
import { ActionCell } from 'component/common/Table/cells/ActionCell/ActionCell';
import { RemoveApiTokenButton } from 'component/common/ApiTokenTable/RemoveApiTokenButton/RemoveApiTokenButton';
import useApiTokensApi from 'hooks/api/actions/useApiTokensApi/useApiTokensApi';
import { ADMIN } from '@server/types/permissions';
import { CdnTokenDocs } from '../CdnTokenDocs/CdnTokenDocs.tsx';
import { Box } from '@mui/material';
import ResponsiveButton from 'component/common/ResponsiveButton/ResponsiveButton';
import Add from '@mui/icons-material/Add';
import { useNavigate } from 'react-router-dom';
import { useCdnTokenTable } from '../useCdnTokenTable.tsx';
import { useCdnTokens } from 'hooks/api/getters/useCdnTokens/useCdnTokens.ts';

export const CdnTokenPage = () => {
    const { tokens, loading, refetch } = useCdnTokens();
    const navigate = useNavigate();

    const {
        headerGroups,
        rows,
        prepareRow,
        state: { globalFilter },
        setGlobalFilter,
        setHiddenColumns,
        columns,
    } = useCdnTokenTable(tokens);

    return (
        <PageContent
            header={
                <PageHeader
                    title={`CDN access (${rows.length})`}
                    actions={
                        <>
                            <Search
                                initialValue={globalFilter}
                                onChange={setGlobalFilter}
                            />
                            <PageHeader.Divider />
                            <ResponsiveButton
                                Icon={Add}
                                onClick={() =>
                                    navigate('/admin/cdn/create-token')
                                }
                                permission={[ADMIN]}
                                maxWidth='700px'
                                disabled={loading} // FIXME: limit reached
                                // tooltipProps={{
                                //     title: limitMessage,
                                // }}
                            >
                                New CDN token
                            </ResponsiveButton>
                        </>
                    }
                />
            }
        >
            <Box sx={(theme) => ({ marginBottom: theme.spacing(4) })}>
                <CdnTokenDocs />
            </Box>
            <ApiTokenTable
                loading={loading}
                headerGroups={headerGroups}
                setHiddenColumns={setHiddenColumns}
                prepareRow={prepareRow}
                rows={rows}
                columns={columns}
                globalFilter={globalFilter}
            />
        </PageContent>
    );
};
