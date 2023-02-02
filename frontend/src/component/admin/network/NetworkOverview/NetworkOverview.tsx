import { usePageTitle } from 'hooks/usePageTitle';
import { Mermaid } from 'component/common/Mermaid/Mermaid';
import { useInstanceMetrics } from 'hooks/api/getters/useInstanceMetrics/useInstanceMetrics';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { Alert, styled } from '@mui/material';
import { unknownify } from 'utils/unknownify';
import { useMemo } from 'react';
import { RequestsPerSecondSchema } from 'openapi';
import logoIcon from 'assets/icons/logoBg.svg';
import { formatAssetPath } from 'utils/formatPath';

const StyledMermaid = styled(Mermaid)(({ theme }) => ({
    '#mermaid .node rect': {
        fill: theme.palette.secondary.light,
        stroke: theme.palette.secondary.border,
    },
}));

const isRecent = (value: ResultValue) => {
    const threshold = 60000; // ten minutes
    return value[0] * 1000 > new Date().getUTCMilliseconds() - threshold;
};

type ResultValue = [number, string];

interface INetworkApp {
    label?: string;
    reqs: string;
    type: string;
}

const toGraphData = (metrics?: RequestsPerSecondSchema) => {
    const results = metrics?.data?.result;
    return (
        results
            ?.map(result => {
                const values = (result.values || []) as ResultValue[];
                const data = values.filter(value => isRecent(value)) || [];
                let reqs = 0;
                if (data.length) {
                    reqs = parseFloat(data[data.length - 1][1]);
                }
                return {
                    label: unknownify(result.metric?.appName),
                    reqs: reqs.toFixed(2),
                    type: unknownify(result.metric?.endpoint?.split('/')[2]),
                };
            })
            .filter(app => app.label !== 'unknown')
            .filter(app => app.reqs !== '0.00') ?? []
    );
};

export const NetworkOverview = () => {
    usePageTitle('Network - Overview');
    const { metrics } = useInstanceMetrics();
    const apps: INetworkApp[] = useMemo(() => {
        return toGraphData(metrics);
    }, [metrics]);

    const graph = `
    graph TD
        subgraph _[ ]
        direction BT
            Unleash(<img src='${formatAssetPath(
                logoIcon
            )}' width='60' height='60' /><br/>Unleash)
            ${apps
                .map(
                    ({ label, reqs, type }, i) =>
                        `app-${i}(${label}) -- ${reqs} req/s<br>${type} --> Unleash`
                )
                .join('\n')}
        end
    `;

    return (
        <ConditionallyRender
            condition={apps.length === 0}
            show={<Alert severity="warning">No data available.</Alert>}
            elseShow={<StyledMermaid>{graph}</StyledMermaid>}
        />
    );
};

export default NetworkOverview;
