import { VirtualizedTable } from 'component/common/Table';
import { DateCell } from 'component/common/Table/cells/DateCell/DateCell';
import { HighlightCell } from 'component/common/Table/cells/HighlightCell/HighlightCell';
import { useMemo, useState } from 'react';
import { useTable, useSortBy, useFlexLayout, type Column } from 'react-table';
import { sortTypes } from 'utils/sortTypes';
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
        sortBy: [{ id: 'seenAt', desc: true }],
    }));

    const columns = useMemo(
        () =>
            [
                {
                    id: 'name',
                    Header: 'Name',
                    accessor: (row: any) => row.name || '',
                    minWidth: 200,
                    Cell: ({ row: { original: serviceAccount } }: any) => (
                        <HighlightCell
                            value={serviceAccount.name}
                            subtitle={serviceAccount.username}
                        />
                    ),
                },
                {
                    id: 'tokens',
                    Header: 'Tokens',
                    accessor: (row: IServiceAccount) =>
                        row.tokens
                            ?.map(({ description }) => description)
                            .join('\n') || '',
                    Cell: ({
                        row: { original: serviceAccount },
                        value,
                    }: {
                        row: { original: IServiceAccount };
                        value: string;
                    }) => (
                        <ServiceAccountTokensCell
                            serviceAccount={serviceAccount}
                            value={value}
                        />
                    ),
                    maxWidth: 100,
                },
                {
                    Header: 'Created',
                    accessor: 'createdAt',
                    Cell: DateCell,
                    width: 120,
                    maxWidth: 120,
                },
                {
                    id: 'seenAt',
                    Header: 'Last seen',
                    accessor: (row: IServiceAccount) =>
                        row.tokens.sort((a, b) => {
                            const aSeenAt = new Date(a.seenAt || 0);
                            const bSeenAt = new Date(b.seenAt || 0);
                            return bSeenAt?.getTime() - aSeenAt?.getTime();
                        })[0]?.seenAt,
                    Cell: TimeAgoCell,
                    maxWidth: 150,
                },
            ] as Column<IServiceAccount>[],
        [],
    );

    const { headerGroups, rows, prepareRow } = useTable(
        {
            columns,
            data: serviceAccounts,
            initialState,
            sortTypes,
            autoResetHiddenColumns: false,
            autoResetSortBy: false,
            disableSortRemove: true,
            disableMultiSort: true,
        },
        useSortBy,
        useFlexLayout,
    );

    return (
        <VirtualizedTable
            rows={rows}
            headerGroups={headerGroups}
            prepareRow={prepareRow}
        />
    );
};
