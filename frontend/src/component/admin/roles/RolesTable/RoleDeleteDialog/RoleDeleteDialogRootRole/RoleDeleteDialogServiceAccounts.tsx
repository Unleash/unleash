import { VirtualizedTable } from 'component/common/Table/VirtualizedTable/VirtualizedTable';
import { DateCell } from 'component/common/Table/cells/DateCell/DateCell';
import { HighlightCell } from 'component/common/Table/cells/HighlightCell/HighlightCell';
import { useMemo, useState } from 'react';
import {
    type ColumnDef,
    getCoreRowModel,
    getSortedRowModel,
    useReactTable,
} from '@tanstack/react-table';
import { TimeAgoCell } from 'component/common/Table/cells/TimeAgoCell/TimeAgoCell';
import type { IServiceAccount } from 'interfaces/service-account';
import { ServiceAccountTokensCell } from 'component/admin/serviceAccounts/ServiceAccountsTable/ServiceAccountTokensCell/ServiceAccountTokensCell';

export type PageQueryType = Partial<
    Record<'sort' | 'order' | 'search', string>
>;

interface IRoleDeleteDialogServiceAccountsProps {
    serviceAccounts: IServiceAccount[];
}

export const RoleDeleteDialogServiceAccounts = ({
    serviceAccounts,
}: IRoleDeleteDialogServiceAccountsProps) => {
    const [initialState] = useState(() => ({
        sorting: [{ id: 'seenAt', desc: true }],
    }));

    const columns = useMemo<ColumnDef<IServiceAccount, unknown>[]>(
        () => [
            {
                id: 'name',
                header: 'Name',
                accessorFn: (row) => row.name || '',
                meta: { minWidth: 200 },
                cell: ({ row: { original: serviceAccount } }) => (
                    <HighlightCell
                        value={serviceAccount.name ?? ''}
                        subtitle={serviceAccount.username}
                    />
                ),
            },
            {
                id: 'tokens',
                header: 'Tokens',
                accessorFn: (row) =>
                    row.tokens
                        ?.map(({ description }) => description)
                        .join('\n') || '',
                cell: ({ row: { original: serviceAccount }, getValue }) => (
                    <ServiceAccountTokensCell
                        serviceAccount={serviceAccount}
                        value={String(getValue() ?? '')}
                    />
                ),
                meta: { maxWidth: 100 },
            },
            {
                id: 'createdAt',
                header: 'Created',
                accessorKey: 'createdAt',
                cell: DateCell,
                meta: { width: 120, maxWidth: 120 },
            },
            {
                id: 'seenAt',
                header: 'Last seen',
                accessorFn: (row) =>
                    row.tokens.sort((a, b) => {
                        const aSeenAt = new Date(a.seenAt || 0);
                        const bSeenAt = new Date(b.seenAt || 0);
                        return bSeenAt?.getTime() - aSeenAt?.getTime();
                    })[0]?.seenAt,
                cell: TimeAgoCell,
                meta: { maxWidth: 150 },
            },
        ],
        [],
    );

    const table = useReactTable({
        columns,
        data: serviceAccounts,
        initialState,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        autoResetAll: false,
        enableSortingRemoval: false,
        enableMultiSort: false,
    });

    return <VirtualizedTable tableInstance={table} />;
};
