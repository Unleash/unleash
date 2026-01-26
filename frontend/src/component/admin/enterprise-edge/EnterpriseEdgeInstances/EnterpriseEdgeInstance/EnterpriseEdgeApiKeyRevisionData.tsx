import type {
    EdgeApiKeyRevisionId,
    EnvironmentRevisionId,
} from '../../../../../interfaces/connectedEdge.ts';
import { styled, Tooltip } from '@mui/material';
import { HelpIcon } from 'component/common/HelpIcon/HelpIcon';
import { formatDateYMDHMS } from '../../../../../utils/formatDate.ts';
import { useLocationSettings } from '../../../../../hooks/useLocationSettings.ts';
import { Truncator } from '../../../../common/Truncator/Truncator.tsx';
import { Badge } from '../../../../common/Badge/Badge.tsx';

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

const StyledBadge = styled(Badge)(({ theme }) => ({
    padding: theme.spacing(0, 1),
}));

interface IEnterpriseEdgeApiKeyRevisionProps {
    apiKeys?: EdgeApiKeyRevisionId[];
    revisionIds: EnvironmentRevisionId[];
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

const unleashRevisionIdFromArray = (
    revisionIds: EnvironmentRevisionId[],
    environment: string,
): number => {
    return (
        revisionIds.find((rev) => rev.environment === environment)
            ?.revisionId || 0
    );
};

type ApiRevisionIdArgs = {
    edgeRevisionId: number;
    upstreamRevisionId: number;
};

const colorFromDiff = (diff: number) => {
    if (diff <= 0) {
        return 'success';
    } else if (diff < 5) {
        return 'warning';
    }
    return 'error';
};

const ApiRevisionId = ({
    edgeRevisionId,
    upstreamRevisionId,
}: ApiRevisionIdArgs) => {
    const diff = upstreamRevisionId - edgeRevisionId;
    const inSync = diff <= 0;
    const title = inSync
        ? 'Edge feature configuration is up to date'
        : `Edge is ${diff} revisions behind Unleash`;

    return (
        <Tooltip title={title}>
            <StyledBadge color={colorFromDiff(diff)}>
                {edgeRevisionId}
            </StyledBadge>
        </Tooltip>
    );
};

export const EnterpriseEdgeApiKeyRevisionData = ({
    apiKeys,
    revisionIds,
}: IEnterpriseEdgeApiKeyRevisionProps) => {
    const { locationSettings } = useLocationSettings();
    const unleashRevisionId = (environment: string): number => {
        return unleashRevisionIdFromArray(revisionIds, environment);
    };
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
                                <Truncator title={token}>{token}</Truncator>
                            </StyledTableCell>
                            <StyledTableCell>
                                <div>
                                    <ApiRevisionId
                                        edgeRevisionId={apiKey.revisionId}
                                        upstreamRevisionId={unleashRevisionId(
                                            apiKey.environment,
                                        )}
                                    />
                                    <HelpIcon
                                        tooltip={`
                                            Edge last updated this token: ${formatDateYMDHMS(apiKey.lastUpdated, locationSettings.locale)}
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
