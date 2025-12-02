import { styled } from '@mui/material';
import { HelpIcon } from 'component/common/HelpIcon/HelpIcon';
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
        '& > th:first-of-type, td:first-of-type': {
            textAlign: 'left',
        },
    },
}));

const StyledSectionHeader = styled('tr')(({ theme }) => ({
    fontWeight: theme.fontWeight.bold,
    '&&& > td': {
        paddingTop: theme.spacing(1),
        '& > div': {
            display: 'flex',
            alignItems: 'center',
        },
    },
}));

interface IEnterpriseEdgeInstanceLatencyProps {
    instance: ConnectedEdge;
}

export const EnterpriseEdgeInstanceLatency = ({
    instance,
}: IEnterpriseEdgeInstanceLatencyProps) => {
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
                <StyledSectionHeader>
                    <td colSpan={3}>
                        <div>
                            Upstream{' '}
                            <HelpIcon
                                tooltip={
                                    'Latency measured for requests sent from this Edge instance to the configured upstream, i.e. Unleash or another Edge instance.'
                                }
                                size='16px'
                            />
                        </div>
                    </td>
                </StyledSectionHeader>
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
                <StyledSectionHeader>
                    <td colSpan={3}>
                        <div>
                            Downstream{' '}
                            <HelpIcon
                                tooltip={
                                    'Latency measured when serving requests from clients, i.e. SDKs or other Edge instances.'
                                }
                                size='16px'
                            />
                        </div>
                    </td>
                </StyledSectionHeader>
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
            </tbody>
        </StyledTable>
    );
};
