import { useContext, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
    Grid,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Typography,
    Divider,
} from '@mui/material';
import {
    Extension,
    FlagRounded,
    Report,
    SvgIconComponent,
    Timeline,
} from '@mui/icons-material';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import useApplication from 'hooks/api/getters/useApplication/useApplication';
import AccessContext from 'contexts/AccessContext';
import { formatDateYMDHMS } from 'utils/formatDate';
import { useLocationSettings } from 'hooks/useLocationSettings';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import { MemoizedRowSelectCell } from 'component/project/Project/ProjectFeatureToggles/RowSelectCell/RowSelectCell';
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
        setGlobalFilter,
        setHiddenColumns,
        columns,
    } = useConnectedInstancesTable(tableData);

    return (
        <>
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
            <p>Got some table data for you!</p>
            <ul>
                {tableData.map((instance) => (
                    <li key={instance.instanceId}>
                        <p>Instance ID: {instance.instanceId}</p>
                        <p>IP: {instance.ip}</p>
                        <p>SDK Version: {instance.sdkVersion}</p>
                        <p>Last seen: {instance.lastSeen}</p>
                    </li>
                ))}
            </ul>
        </>
    );
};
