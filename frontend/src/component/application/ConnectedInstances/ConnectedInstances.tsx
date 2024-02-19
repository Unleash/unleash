import { useMemo } from 'react';
import useApplication from 'hooks/api/getters/useApplication/useApplication';
import { formatDateYMDHMS } from 'utils/formatDate';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import { useConnectedInstancesTable } from './useConnectedInstancesTable';
import { ConnectedInstancesTable } from './ConnectedInstancesTable';

export const ConnectedInstances = () => {
    const name = useRequiredPathParam('name');
    const { application } = useApplication(name);

    const tableData = useMemo(() => {
        return (
            application.instances
                // @ts-expect-error: the type definition here is incomplete. It
                // should be updated as part of this project.
                .filter((instance) => instance.environment === 'production')
                .map(({ instanceId, sdkVersion, clientIp, lastSeen }) => {
                    return {
                        instanceId,
                        ip: clientIp,
                        sdkVersion,
                        lastSeen: formatDateYMDHMS(lastSeen),
                    };
                })
        );
    }, [application]);

    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        rows,
        prepareRow,
        state: { globalFilter },
        setHiddenColumns,
        columns,
    } = useConnectedInstancesTable(tableData);

    return (
        <ConnectedInstancesTable
            loading={false}
            headerGroups={headerGroups}
            setHiddenColumns={setHiddenColumns}
            prepareRow={prepareRow}
            getTableBodyProps={getTableBodyProps}
            getTableProps={getTableProps}
            rows={rows}
            columns={columns}
            globalFilter={globalFilter}
        />
    );
};
