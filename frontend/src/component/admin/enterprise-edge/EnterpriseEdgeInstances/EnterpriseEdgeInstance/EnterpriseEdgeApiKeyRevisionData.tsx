import type { EdgeApiKeyRevisionId } from '../../../../../interfaces/connectedEdge.ts';
import { styled } from '@mui/material';
import { HelpIcon } from 'component/common/HelpIcon/HelpIcon';
import { formatDateYMDHMS } from '../../../../../utils/formatDate.ts';
import { useLocationSettings } from '../../../../../hooks/useLocationSettings.ts';
import { Truncator } from '../../../../common/Truncator/Truncator.tsx';

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
        paddingTop: theme.spacing(1),
    },
}));

const StyledTableCell = styled('td')(({ theme }) => ({
    paddingTop: theme.spacing(1),
    maxWidth: '80px',
    '& > div': {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'end',
    },
}));

interface IEnterpriseEdgeApiKeyRevisionProps {
    apiKeys?: EdgeApiKeyRevisionId[];
}

const projectKey = (projects: string[]): string => {
    return projects.length === 1 ? projects[0] : `[]`;
};

const apiToken = (revInfo: EdgeApiKeyRevisionId): string => {
    return `${projectKey(revInfo.projects)}:${revInfo.environment}.***`;
};

const listKey = (revInfo: EdgeApiKeyRevisionId): string => {
    return `[${revInfo.projects.join(',')}]:${revInfo.environment}`;
};
export const EnterpriseEdgeApiKeyRevisionData = ({
    apiKeys,
}: IEnterpriseEdgeApiKeyRevisionProps) => {
    const { locationSettings } = useLocationSettings();
    if (!apiKeys || apiKeys.length === 0) {
        return null;
    }
    return (
        <StyledTable>
            <thead>
                <tr>
                    <th>Token</th>
                    <th>Revision</th>
                </tr>
            </thead>
            <tbody>
                {apiKeys?.map((apiKey) => {
                    const token = apiToken(apiKey);
                    return (
                        <tr key={listKey(apiKey)}>
                            <StyledTableCell>
                                <Truncator title={apiToken(apiKey)}>
                                    {apiToken(apiKey)}
                                </Truncator>
                            </StyledTableCell>
                            <StyledTableCell>
                                <div>
                                    {apiKey.revisionId}
                                    <HelpIcon
                                        tooltip={`
                                            Last updated: ${formatDateYMDHMS(apiKey.lastUpdated, locationSettings.locale)}
                                        `}
                                        size='14px'
                                    />
                                </div>
                            </StyledTableCell>
                        </tr>
                    );
                })}
            </tbody>
        </StyledTable>
    );
};
