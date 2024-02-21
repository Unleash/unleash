import { useMemo } from 'react';
import useApplication from 'hooks/api/getters/useApplication/useApplication';
import { formatDateYMDHMS } from 'utils/formatDate';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import { useConnectedInstancesTable } from './useConnectedInstancesTable';
import { ConnectedInstancesTable } from './ConnectedInstancesTable';
import { IApplication } from 'interfaces/application';
import { useQueryParam } from 'use-query-params';
import { styled } from '@mui/material';

const Container = styled('div')(({ theme }) => ({
    '* + *': {
        marginBlockStart: theme.spacing(2),
    },
}));

const EnvironmentSelectionContainer = styled('div')(({ theme }) => ({
    label: {
        color: theme.palette.primary.main,
        background: theme.palette.background,
        paddingInline: theme.spacing(2),
        paddingBlock: theme.spacing(1),
        border: `1px solid ${theme.palette.background.alternative}`,
        borderInlineStart: 'none',
        fontWeight: 'bold',
    },
    'label:first-of-type': {
        borderInlineStart: `1px solid ${theme.palette.background.alternative}`,
        borderRadius: `${theme.shape.borderRadiusMedium}px 0 0 ${theme.shape.borderRadiusMedium}px`,
    },
    'label:last-of-type': {
        borderRadius: `0 ${theme.shape.borderRadiusMedium}px ${theme.shape.borderRadiusMedium}px 0`,
    },
    'label:has(input:checked)': {
        background: theme.palette.background.alternative,
        color: theme.palette.primary.contrastText,
    },
    'label:focus-within': {
        outline: `2px solid ${theme.palette.background.alternative}`,
        outlineOffset: theme.spacing(0.5),
    },

    fieldset: {
        border: 'none',
        padding: 0,
        margin: 0,
    },
    legend: {
        marginBlockEnd: theme.spacing(3),
    },

    '.visually-hidden': {
        border: 0,
        clip: 'rect(0 0 0 0)',
        height: 'auto',
        margin: 0,
        overflow: 'hidden',
        padding: 0,
        position: 'absolute',
        width: '1px',
        whiteSpace: 'nowrap',
    },
}));

export const ConnectedInstances = () => {
    const name = useRequiredPathParam('name');
    const { application } = useApplication(name);
    const [currentEnvironment, setCurrentEnvironment] =
        useQueryParam('environment');
    const availableEnvironments = new Set(
        application?.instances.map(
            // @ts-expect-error: the type definition here is incomplete. It
            // should be updated as part of this project.
            (instance) => instance.environment,
        ),
    );
    const allEnvironmentsSorted = Array.from(availableEnvironments).sort(
        (a, b) => a.localeCompare(b),
    );

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
        <Container>
            <EnvironmentSelectionContainer>
                <fieldset>
                    <legend>
                        Select which environment to display data for. Only
                        environments that have received traffic for this
                        application will be shown here.
                    </legend>
                    {allEnvironmentsSorted.map((env) => {
                        return (
                            <label key={env}>
                                {env}
                                <input
                                    defaultChecked={currentEnvironment === env}
                                    className='visually-hidden'
                                    type='radio'
                                    name='active-environment'
                                    onClick={() => {
                                        setCurrentEnvironment(env);
                                    }}
                                />
                            </label>
                        );
                    })}
                </fieldset>
            </EnvironmentSelectionContainer>
            <ConnectedInstancesTable
                loading={false}
                headerGroups={headerGroups}
                prepareRow={prepareRow}
                getTableBodyProps={getTableBodyProps}
                getTableProps={getTableProps}
                rows={rows}
            />
        </Container>
    );
};
