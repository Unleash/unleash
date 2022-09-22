import { FC } from 'react';
import { styled } from '@mui/material';
import { IInstanceStatus } from 'interfaces/instance';
import Mermaid from 'react-mermaid2';

const StyledMermaid = styled(Mermaid)(() => ({
    // TODO: Not working :(
    '& > svg': {
        display: 'flex',
        margin: 'auto',
    },
}));

interface INetworkDashboardProps {
    instanceStatus: IInstanceStatus;
}

type statusCode = 'OK' | 'WARN' | 'ERR';

interface IClientStatus {
    id: string;
    appName: string;
    sdk: string;
    status: statusCode;
    edgeConnection: string;
}

interface IEdgeStatus {
    id: string;
    label: string;
    lastFetch?: Date;
    status: statusCode;
}

interface IUnleashStatus {
    status: statusCode;
}

interface INetworkStatus {
    unleash: IUnleashStatus;
    clients: IClientStatus[];
    edges: IEdgeStatus[];
}

const getDateString = (date?: Date) =>
    date?.toISOString().replace('T', ' ').split('.')[0] || 'Never';

const buildGraph = (status: INetworkStatus): string => {
    // TODO: Each node could be clickable to show more info.
    const graph = ['graph LR'];

    status.clients.forEach(client => {
        graph.push(
            `client${client.id}(("${client.appName}")):::${client.status}`
        );
        graph.push(`--${client.sdk}-->edge${client.edgeConnection}`);
    });

    status.edges.forEach(edge => {
        graph.push(
            `edge${edge.id}("${edge.label}"<br />${
                edge.status
            }<br />${getDateString(edge.lastFetch)}):::${edge.status}`
        );
        graph.push(`-->unleash{{Unleash<br />${status.unleash.status}}}`);
    });

    graph.push('classDef OK fill:#00bfa5,stroke:#00bfa5,stroke-width:1px');
    graph.push('classDef WARN fill:#ff9800,stroke:#ff9800,stroke-width:1px');
    graph.push('classDef ERR fill:#f44336,stroke:#f44336,stroke-width:1px');

    return graph.join('\n');
};

export const NetworkDashboard: FC<INetworkDashboardProps> = ({
    instanceStatus,
}) => {
    // TODO: Grab this from something like instanceStatus?
    const mockNetworkStatus: INetworkStatus = {
        unleash: {
            status: 'OK',
        },
        clients: [
            {
                id: 'app-1',
                appName: 'my-app #1',
                sdk: 'rust-sdk',
                status: 'OK',
                edgeConnection: 'edge-1',
            },
            {
                id: 'app-2',
                appName: 'my-app #2',
                sdk: 'react-sdk',
                status: 'WARN',
                edgeConnection: 'edge-2',
            },
            {
                id: 'app-3',
                appName: 'my-app #3',
                sdk: 'python-sdk',
                status: 'ERR',
                edgeConnection: 'edge-3',
            },
        ],
        edges: [
            {
                id: 'edge-1',
                label: 'edge #1',
                lastFetch: new Date(),
                status: 'OK',
            },
            {
                id: 'edge-2',
                label: 'edge #2',
                lastFetch: new Date(Date.now() - 2 * 60 * 60 * 1000),
                status: 'WARN',
            },
            {
                id: 'edge-3',
                label: 'edge #3',
                status: 'ERR',
            },
        ],
    };

    return <StyledMermaid chart={buildGraph(mockNetworkStatus)} />;
};
