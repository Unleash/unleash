import { FC, useEffect, useMemo, useState } from 'react';
import { formatDateYMDHMS } from 'utils/formatDate';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import { useConnectedInstancesTable } from './useConnectedInstancesTable';
import { ConnectedInstancesTable } from './ConnectedInstancesTable';
import { Box, ToggleButton, ToggleButtonGroup } from '@mui/material';
import { useApplicationOverview } from 'hooks/api/getters/useApplicationOverview/useApplicationOverview';
import { useConnectedInstances } from 'hooks/api/getters/useConnectedInstances/useConnectedInstances';
import { ApplicationEnvironmentInstancesSchemaInstancesItem } from '../../../openapi';

export const ConnectedInstances: FC = () => {
    const name = useRequiredPathParam('name');
    const { data: applicationOverview } = useApplicationOverview(name);

    const availableEnvironments = applicationOverview.environments.map(
        (env) => env.name,
    );
    const allEnvironmentsSorted = Array.from(availableEnvironments).sort(
        (a, b) => a.localeCompare(b),
    );
    const [currentEnvironment, setCurrentEnvironment] = useState(
        allEnvironmentsSorted[0],
    );
    const { data: connectedInstances } = useConnectedInstances(
        name,
        currentEnvironment,
    );

    useEffect(() => {
        if (!currentEnvironment && availableEnvironments.length > 0) {
            setCurrentEnvironment(availableEnvironments[0]);
        }
    }, [JSON.stringify(availableEnvironments)]);

    const tableData = useMemo(() => {
        const map = ({
            instanceId,
            sdkVersion,
            clientIp,
            lastSeen,
        }: ApplicationEnvironmentInstancesSchemaInstancesItem) => ({
            instanceId,
            ip: clientIp || '',
            sdkVersion: sdkVersion || '',
            lastSeen: lastSeen ? formatDateYMDHMS(lastSeen) : '',
        });
        if (!currentEnvironment) {
            return [];
        }
        return connectedInstances.instances.map(map);
    }, [JSON.stringify(connectedInstances), currentEnvironment]);

    const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
        useConnectedInstancesTable(tableData);

    return (
        <Box>
            <Box sx={{ mb: 3 }}>
                <Box sx={{ mb: 2 }}>
                    Select which environment to display data for. Only
                    environments that have received traffic for this application
                    will be shown here.
                </Box>
                <ToggleButtonGroup
                    color='primary'
                    value={currentEnvironment}
                    exclusive
                    onChange={(event, value) => {
                        if (value !== null) {
                            setCurrentEnvironment(value);
                        }
                    }}
                >
                    {allEnvironmentsSorted.map((env) => {
                        return <ToggleButton value={env}>{env}</ToggleButton>;
                    })}
                </ToggleButtonGroup>
            </Box>
            <ConnectedInstancesTable
                loading={false}
                headerGroups={headerGroups}
                prepareRow={prepareRow}
                getTableBodyProps={getTableBodyProps}
                getTableProps={getTableProps}
                rows={rows}
            />
        </Box>
    );
};
