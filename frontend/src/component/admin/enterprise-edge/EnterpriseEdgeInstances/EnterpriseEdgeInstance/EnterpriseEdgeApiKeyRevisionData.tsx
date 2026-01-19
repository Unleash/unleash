import type { EdgeApiKeyRevisionId } from '../../../../../interfaces/connectedEdge.ts';
import { formatDateYMDHMS } from '../../../../../utils/formatDate.ts';
import { styled } from '@mui/material';

interface IEnterpriseEdgeApiKeyRevisionProps {
    apiKeys?: EdgeApiKeyRevisionId[];
}

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

export const EnterpriseEdgeApiKeyRevisionData = ({
    apiKeys,
}: IEnterpriseEdgeApiKeyRevisionProps) => {
    return apiKeys && apiKeys.length > 0 ? (
        <StyledTable>
            <thead>
                <tr>
                    <th>Key</th>
                    <th>Revision ID</th>
                    <th>Last updated</th>
                </tr>
            </thead>
            <tbody>
                {apiKeys?.map((apiKey) => {
                    return (
                        <tr
                            key={`${apiKey.environment}${apiKey.projects.join(',')}`}
                        >
                            <td>{`${apiToken(apiKey)}`}</td>
                            <td>{apiKey.revisionId}</td>
                            <td>{formatDateYMDHMS(apiKey.lastUpdated)}</td>
                        </tr>
                    );
                })}
            </tbody>
        </StyledTable>
    ) : null;
};

function projectKey(projects: string[]): string {
    return projects.length === 1 ? projects[0] : '[]';
}

function apiToken(revInfo: EdgeApiKeyRevisionId): string {
    return `${projectKey(revInfo.projects)}:${revInfo.environment}.<redacted>`;
}
