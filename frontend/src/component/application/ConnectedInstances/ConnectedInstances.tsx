import { FC, useEffect, useMemo } from 'react';
import { formatDateYMDHMS } from 'utils/formatDate';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import { useConnectedInstancesTable } from './useConnectedInstancesTable';
import { ConnectedInstancesTable } from './ConnectedInstancesTable';
import { Box, ToggleButton, ToggleButtonGroup } from '@mui/material';
import { useApplicationOverview } from 'hooks/api/getters/useApplicationOverview/useApplicationOverview';
import { useConnectedInstances } from 'hooks/api/getters/useConnectedInstances/useConnectedInstances';
import { ApplicationEnvironmentInstancesSchemaInstancesItem } from '../../../openapi';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { StringParam, useQueryParam, withDefault } from 'use-query-params';

const useEnvironments = (application: string) => {
    const { data: applicationOverview } = useApplicationOverview(application);

    const applicationEnvironments = applicationOverview.environments
        .map((env) => env.name)
        .sort();
    const [currentEnvironment, setCurrentEnvironment] = useQueryParam(
        'environment',
        withDefault(StringParam, applicationEnvironments[0]),
    );

    useEffect(() => {
        if (!currentEnvironment && applicationEnvironments.length > 0) {
            setCurrentEnvironment(applicationEnvironments[0]);
        }
    }, [JSON.stringify(applicationEnvironments)]);

    return {
        currentEnvironment,
        setCurrentEnvironment,
        environments: applicationEnvironments,
    };
};

export const ConnectedInstances: FC = () => {
    const name = useRequiredPathParam('name');

    const { currentEnvironment, setCurrentEnvironment, environments } =
        useEnvironments(name);

    const { data: connectedInstances, loading } = useConnectedInstances(
        name,
        currentEnvironment,
    );

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
                <ConditionallyRender
                    condition={Boolean(currentEnvironment)}
                    show={
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
                            {environments.map((env) => {
                                return (
                                    <ToggleButton key={env} value={env}>
                                        {env}
                                    </ToggleButton>
                                );
                            })}
                        </ToggleButtonGroup>
                    }
                />
            </Box>
            <ConnectedInstancesTable
                loading={loading}
                headerGroups={headerGroups}
                prepareRow={prepareRow}
                getTableBodyProps={getTableBodyProps}
                getTableProps={getTableProps}
                rows={rows}
            />
        </Box>
    );
};
