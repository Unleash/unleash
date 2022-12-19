import { usePageTitle } from 'hooks/usePageTitle';
import { Mermaid } from 'component/common/Mermaid/Mermaid';
import { useInstanceMetrics } from 'hooks/api/getters/useInstanceMetrics/useInstanceMetrics';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { Alert, styled } from '@mui/material';

const StyledMermaid = styled(Mermaid)(({ theme }) => ({
    '#mermaid .node rect': {
        fill: theme.palette.secondary.light,
        stroke: theme.palette.secondary.border,
    },
}));

interface INetworkApp {
    label?: string;
    reqs: string;
    type: string;
}

export const NetworkOverview = () => {
    usePageTitle('Network - Overview');
    const { metrics } = useInstanceMetrics();

    const apps: INetworkApp[] = [];
    const isRecent = (v: (number|string)[]) => {
        const threshold = 60000; // ten minutes
        return (v[0] as number) * 1000 > new Date().getTime() - threshold;
    }
    if (Boolean(metrics?.data?.result)) {
        apps.push(
            ...(
                metrics?.data?.result?.map(result => {
                    const data = result.values?.filter(v => isRecent(v))
                    let reqs = 0;
                    if (data) {
                        reqs = parseFloat(data[data.length - 1][1].toString())
                    }
                    return ({
                        label: result.metric?.appName,
                        reqs: reqs.toFixed(2),
                        type: result.metric?.endpoint?.split('/')[2] || 'unknown',
                    })
            }).filter(app => app.label !== 'undefined') || []
            ).filter(app => app.reqs !== '0.00')
        );
    }

    const graph = `
    graph TD
        subgraph _[ ]
        direction BT
            Unleash(<img src='https://www.getunleash.io/logos/unleash_glyph_pos.svg' width='60' height='60' /><br/>Unleash)
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
