// TODO: Implement
export const NetworkConnectedEdgeInstanceLatency = () => {
    const latencyData = {
        clientFeatures: { avg: 120, p99: 300 },
        frontend: { avg: 100, p99: 250 },
        upstream: {
            'Client features': { avg: 130, p99: 320 },
            Metrics: { avg: 90, p99: 200 },
            Edge: { avg: 110, p99: 290 },
        },
    };

    return (
        <table
            style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '12px',
            }}
        >
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
                        {latencyData.clientFeatures.avg}
                    </td>
                    <td style={{ padding: '4px', textAlign: 'right' }}>
                        {latencyData.clientFeatures.p99}
                    </td>
                </tr>
                <tr>
                    <td style={{ padding: '4px' }}>Frontend</td>
                    <td style={{ padding: '4px', textAlign: 'right' }}>
                        {latencyData.frontend.avg}
                    </td>
                    <td style={{ padding: '4px', textAlign: 'right' }}>
                        {latencyData.frontend.p99}
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
                {Object.entries(latencyData.upstream).map(([key, values]) => (
                    <tr key={key}>
                        <td style={{ padding: '4px 8px' }}>{key}</td>
                        <td style={{ padding: '4px', textAlign: 'right' }}>
                            {values.avg}
                        </td>
                        <td style={{ padding: '4px', textAlign: 'right' }}>
                            {values.p99}
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
};
