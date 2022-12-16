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
    if (Boolean(metrics?.data?.result)) {
        apps.push(
            ...(
                metrics?.data?.result?.map(result => ({
                    label: result.metric?.appName,
                    reqs: parseFloat(
                        result.values?.[
                            result.values?.length - 1
                        ][1].toString() || '0'
                    ).toFixed(2),
                    type: result.metric?.appName!,
                })) || []
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
