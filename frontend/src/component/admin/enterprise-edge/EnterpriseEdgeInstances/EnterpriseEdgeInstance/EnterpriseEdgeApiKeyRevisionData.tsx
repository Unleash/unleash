import type {
    EdgeApiKeyRevisionId,
    EnvironmentRevisionId,
} from '../../../../../interfaces/connectedEdge.ts';
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

const ApiRevisionId = ({
    edgeRevisionId,
    upstreamRevisionId,
}: ApiRevisionIdArgs) => {
    const diff = upstreamRevisionId - edgeRevisionId;
    if (edgeRevisionId >= upstreamRevisionId) {
        // We're in sync, flag as green we might even be ahead of the cached revisionId
        return (
            <span
                style={{
                    color: '#2e7d32',
                }}
                title='Edge is in sync with upstream'
            >
                {edgeRevisionId}
            </span>
        );
    } else if (diff < 5) {
        // We're behind, flag as orange if < 5 revisions behind, red if >= 5 revisions behind
        return (
            <span
                style={{
                    color: '#ed6c02',
                }}
                title={`Edge is ${diff} revisions behind upstream (${upstreamRevisionId})`}
            >
                {edgeRevisionId}
            </span>
        );
    } else {
        <span
            style={{
                color: '#d32f2f',
            }}
            title={`Edge is ${diff} revisions behind upstream (${upstreamRevisionId})`}
        >
            {edgeRevisionId}
        </span>;
    }
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
