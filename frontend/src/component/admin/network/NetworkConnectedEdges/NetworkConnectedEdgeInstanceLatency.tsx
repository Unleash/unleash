import { styled } from '@mui/material';
import type { ConnectedEdge } from 'interfaces/connectedEdge';

const StyledTable = styled('table')(({ theme }) => ({
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: theme.fontSizes.smallerBody,
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
                <tr style={{ textAlign: 'left' }}>
                    <th
                        style={{
                            borderBottom: '1px solid #ccc',
                        }}
                    >
                        Latency (ms)
                    </th>
                    <th
                        style={{
                            borderBottom: '1px solid #ccc',
                            textAlign: 'right',
                        }}
                    >
                        Avg
                    </th>
                    <th
                        style={{
                            borderBottom: '1px solid #ccc',
                            textAlign: 'right',
                        }}
                    >
                        p99
                    </th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td style={{ padding: '4px' }}>Client Features</td>
                    <td style={{ padding: '4px', textAlign: 'right' }}>
                        {instance.clientFeaturesAverageLatencyMs}
                    </td>
                    <td style={{ padding: '4px', textAlign: 'right' }}>
                        {instance.clientFeaturesP99LatencyMs}
                    </td>
                </tr>
                <tr>
                    <td style={{ padding: '4px' }}>Frontend</td>
                    <td style={{ padding: '4px', textAlign: 'right' }}>
                        {instance.frontendApiAverageLatencyMs}
                    </td>
                    <td style={{ padding: '4px', textAlign: 'right' }}>
                        {instance.frontendApiP99LatencyMs}
                    </td>
                </tr>
                <tr>
                    <td
                        colSpan={3}
                        style={{ fontWeight: 'bold', paddingTop: '6px' }}
                    >
                        Upstream
                    </td>
                </tr>
                <tr>
                    <td style={{ padding: '4px 8px' }}>Client Features</td>
                    <td style={{ padding: '4px', textAlign: 'right' }}>
                        {instance.upstreamFeaturesAverageLatencyMs}
                    </td>
                    <td style={{ padding: '4px', textAlign: 'right' }}>
                        {instance.upstreamFeaturesP99LatencyMs}
                    </td>
                </tr>
                <tr>
                    <td style={{ padding: '4px 8px' }}>Metrics</td>
                    <td style={{ padding: '4px', textAlign: 'right' }}>
                        {instance.upstreamMetricsAverageLatencyMs}
                    </td>
                    <td style={{ padding: '4px', textAlign: 'right' }}>
                        {instance.upstreamMetricsP99LatencyMs}
                    </td>
                </tr>
                <tr>
                    <td style={{ padding: '4px 8px' }}>Edge</td>
                    <td style={{ padding: '4px', textAlign: 'right' }}>
                        {instance.upstreamEdgeAverageLatencyMs}
                    </td>
                    <td style={{ padding: '4px', textAlign: 'right' }}>
                        {instance.upstreamEdgeP99LatencyMs}
                    </td>
                </tr>
            </tbody>
        </StyledTable>
    );
};
