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

const hasExactSameProjects = (
    sourceProjects: string[] | undefined,
    targetProjects: string[],
): boolean => {
    const source = new Set(sourceProjects || []);
    const target = new Set(targetProjects);

    if (source.size !== target.size) {
        return false;
    }

    return Array.from(source).every((project) => target.has(project));
};

const isSubsetOfTokenProjects = (
    candidateProjects: string[] | undefined,
    tokenProjects: Set<string>,
): boolean => {
    const projects = candidateProjects || [];
    return projects.every((project) => tokenProjects.has(project));
};

export const expectedUpstreamRevisionId = (
    revisionIds: EnvironmentRevisionId[],
    apiKey: EdgeApiKeyRevisionId,
): number => {
    const environmentRevisionIds = revisionIds.filter(
        (rev) => rev.environment === apiKey.environment,
    );
    const environmentWideRevisionId = environmentRevisionIds.find(
        (rev) => !rev.projects || rev.projects.length === 0,
    )?.revisionId;
    const projectScopedRevisionIds = environmentRevisionIds.filter((rev) =>
        Boolean(rev.projects && rev.projects.length > 0),
    );

    if (projectScopedRevisionIds.length === 0) {
        return environmentWideRevisionId || 0;
    }

    if (apiKey.projects.includes('*')) {
        return Math.max(
            ...projectScopedRevisionIds.map((rev) => rev.revisionId),
            environmentWideRevisionId || 0,
        );
    }

    const tokenProjects = new Set(apiKey.projects);
    const exactMatchRevision = projectScopedRevisionIds.find((rev) =>
        hasExactSameProjects(rev.projects, apiKey.projects),
    );

    if (exactMatchRevision) {
        return Math.max(
            exactMatchRevision.revisionId,
            environmentWideRevisionId || 0,
        );
    }

    const relevantScopedRevisionIds = projectScopedRevisionIds.filter((rev) =>
        isSubsetOfTokenProjects(rev.projects, tokenProjects),
    );

    if (relevantScopedRevisionIds.length === 0) {
        return environmentWideRevisionId || 0;
    }

    return Math.max(
        ...relevantScopedRevisionIds.map((rev) => rev.revisionId),
        environmentWideRevisionId || 0,
    );
};

const colorFromDiff = (diff: number) => {
    if (diff <= 0) {
        return 'success';
    } else if (diff < 5) {
        return 'warning';
    }
    return 'error';
};

interface IApiRevisionIdProps {
    edgeRevisionId: number;
    upstreamRevisionId: number;
}

const ApiRevisionId = ({
    edgeRevisionId,
    upstreamRevisionId,
}: IApiRevisionIdProps) => {
    const diff = upstreamRevisionId - edgeRevisionId;
    const inSync = diff <= 0;
    const title = inSync
        ? 'Edge feature configuration is up to date'
        : `Edge is ${diff} revisions behind expected upstream revision for this token`;

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
                                        upstreamRevisionId={expectedUpstreamRevisionId(
                                            revisionIds,
                                            apiKey,
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
