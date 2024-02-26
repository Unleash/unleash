import { FC, useEffect, useMemo, useState } from 'react';
import useApplication from 'hooks/api/getters/useApplication/useApplication';
import { formatDateYMDHMS } from 'utils/formatDate';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import { useConnectedInstancesTable } from './useConnectedInstancesTable';
import { ConnectedInstancesTable } from './ConnectedInstancesTable';
import { IApplication } from 'interfaces/application';
import { Box, ToggleButton, ToggleButtonGroup } from '@mui/material';
import { useApplicationOverview } from '../../../hooks/api/getters/useApplicationOverview/useApplicationOverview';
import { useConnectedInstances } from '../../../hooks/api/getters/useConnectedInstances/useConnectedInstances';

export const ConnectedInstances: FC = () => {
    const name = useRequiredPathParam('name');
    const { application } = useApplication(name);
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
        }: IApplication['instances'][number]) => ({
            instanceId,
            ip: clientIp,
            sdkVersion,
            lastSeen: formatDateYMDHMS(lastSeen),
        });
        if (!currentEnvironment) {
            return application.instances.map(map);
        }
        return application.instances
            .filter(
                // @ts-expect-error: the type definition here is incomplete. It
                // should be updated as part of this project.
                (instance) => instance.environment === currentEnvironment,
            )
            .map(map);
    }, [application, currentEnvironment]);

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
