import { styled } from '@mui/material';
import type { ConnectedEdge } from 'interfaces/connectedEdge';

const StyledTable = styled('table')(({ theme }) => ({
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: theme.fontSizes.smallerBody,
    '& > thead': {
        borderBottom: `1px solid ${theme.palette.text.primary}`,
    },
    '& tr': {
        textAlign: 'right',
        '& > th:first-of-type,td:first-of-type': {
            textAlign: 'left',
        },
    },
}));

const StyledUpstreamSection = styled('tr')(({ theme }) => ({
    fontWeight: theme.fontWeight.bold,
    borderBottom: `1px solid ${theme.palette.text.primary}`,
    '& > td:first-of-type': {
        paddingTop: theme.spacing(1),
    },
}));

interface INetworkConnectedEdgeInstanceLatencyProps {
    instance: ConnectedEdge;
}

export const NetworkConnectedEdgeInstanceLatency = ({
    instance,
}: INetworkConnectedEdgeInstanceLatencyProps) => {
    return (
        <StyledTable>
            <thead>
                <tr>
                    <th>Latency (ms)</th>
                    <th>Avg</th>
                    <th>p99</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>Client Features</td>
                    <td>{instance.clientFeaturesAverageLatencyMs}</td>
                    <td>{instance.clientFeaturesP99LatencyMs}</td>
                </tr>
                <tr>
                    <td>Frontend</td>
                    <td>{instance.frontendApiAverageLatencyMs}</td>
                    <td>{instance.frontendApiP99LatencyMs}</td>
                </tr>
                <StyledUpstreamSection>
                    <td colSpan={3}>Upstream</td>
                </StyledUpstreamSection>
                <tr>
                    <td>Client Features</td>
                    <td>{instance.upstreamFeaturesAverageLatencyMs}</td>
                    <td>{instance.upstreamFeaturesP99LatencyMs}</td>
                </tr>
                <tr>
                    <td>Metrics</td>
                    <td>{instance.upstreamMetricsAverageLatencyMs}</td>
                    <td>{instance.upstreamMetricsP99LatencyMs}</td>
                </tr>
                <tr>
                    <td>Edge</td>
                    <td>{instance.upstreamEdgeAverageLatencyMs}</td>
                    <td>{instance.upstreamEdgeP99LatencyMs}</td>
                </tr>
            </tbody>
        </StyledTable>
    );
};
