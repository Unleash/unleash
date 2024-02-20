import { usePageTitle } from '../../hooks/usePageTitle';
import { Mermaid } from '../common/Mermaid/Mermaid';
import { ConditionallyRender } from '../common/ConditionallyRender/ConditionallyRender';
import { Alert, styled } from '@mui/material';
import { useThemeMode } from '../../hooks/useThemeMode';
import { useRequiredPathParam } from '../../hooks/useRequiredPathParam';
import { useNavigate } from 'react-router-dom';

const StyledMermaid = styled(Mermaid)(({ theme }) => ({
    '#mermaid .node rect': {
        fill: theme.palette.secondary.light,
        stroke: theme.palette.secondary.border,
    },
    '#mermaid .application-container': {
        // display: 'flex',
        // padding: theme.spacing(4,3,3,3),
        // flexDirection: 'column',
        // alignItems: 'center',
        // gap: theme.spacing(3),
        backgroundColor: theme.palette.secondary.light,
    },
}));

export const ApplicationOverview = () => {
    usePageTitle('Applications - Overview');
    const applicationName = useRequiredPathParam('name');
    const { themeMode } = useThemeMode();
    const navigate = useNavigate();

    const app = {
        projects: ['default', 'dx'],
        featureCount: 12,
        environments: [
            {
                name: 'production',
                instanceCount: 34,
                sdks: ['unleash-client-node:5.4.0'],
                lastSeen: '2021-10-01T12:00:00Z',
            },
            {
                name: 'development',
                instanceCount: 16,
                sdks: ['unleash-client-java:5.4.0'],
                lastSeen: '2021-10-01T12:00:00Z',
            },
        ],
    };

    const applicationNode = `
    ${applicationName}[<span>${applicationName}</span>]
    `;

    // @ts-ignore
    window.navigateToInstances = (environment: string) => {
        navigate(
            `/applications/${applicationName}/instances?environment=${environment}`,
        );
    };

    const graph = `
    graph TD
        subgraph _[ ]
        direction BT
            ${applicationNode}
            ${app.environments
                .map(
                    ({ name }, i) =>
                        `${name}("${name}")  --- ${applicationName}
                        click ${name} navigateToInstances`,
                )
                .join('\n')}
        end
    `;

    return (
        <ConditionallyRender
            condition={1 === 2 + 1}
            show={<Alert severity='warning'>No data available.</Alert>}
            elseShow={<StyledMermaid>{graph}</StyledMermaid>}
        />
    );
};

export default ApplicationOverview;
