import { useLocationSettings } from 'hooks/useLocationSettings';
import type { ConnectedEdge } from 'interfaces/connectedEdge';
import CircleIcon from '@mui/icons-material/Circle';
import ExpandMore from '@mui/icons-material/ExpandMore';
import { formatDateYMDHMS } from 'utils/formatDate';
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    styled,
    Tooltip,
} from '@mui/material';
import { Badge } from 'component/common/Badge/Badge';
import { HelpIcon } from 'component/common/HelpIcon/HelpIcon';
import { NetworkConnectedEdgeInstanceLatency } from './NetworkConnectedEdgeInstanceLatency.tsx';

const StyledInstance = styled('div')(({ theme }) => ({
    width: '100%',
    borderRadius: theme.shape.borderRadiusMedium,
    border: '1px solid',
    borderColor: theme.palette.secondary.border,
    backgroundColor: theme.palette.secondary.light,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: 0,
    zIndex: 1,
    marginTop: theme.spacing(1),
}));

const StyledAccordion = styled(Accordion)({
    width: '100%',
    background: 'transparent',
    boxShadow: 'none',
});

const StyledAccordionSummary = styled(AccordionSummary, {
    shouldForwardProp: (prop) => prop !== 'connectionStatus',
})<{ connectionStatus: InstanceConnectionStatus }>(
    ({ theme, connectionStatus }) => ({
        fontSize: theme.fontSizes.smallBody,
        padding: theme.spacing(1),
        minHeight: theme.spacing(3),
        '& .MuiAccordionSummary-content': {
            alignItems: 'center',
            gap: theme.spacing(1),
            margin: 0,
            '&.Mui-expanded': {
                margin: 0,
            },
            '& svg': {
                fontSize: theme.fontSizes.mainHeader,
                color:
                    connectionStatus === 'Stale'
                        ? theme.palette.warning.main
                        : connectionStatus === 'Disconnected'
                          ? theme.palette.error.main
                          : theme.palette.success.main,
            },
        },
    }),
);

const StyledAccordionDetails = styled(AccordionDetails)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    fontSize: theme.fontSizes.smallerBody,
    gap: theme.spacing(2),
}));

const StyledDetailRow = styled('div')(({ theme }) => ({
    display: 'flex',
    justifyContent: 'space-between',
    gap: theme.spacing(2),
    '& > span': {
        display: 'flex',
        alignItems: 'center',
    },
}));

const StyledBadge = styled(Badge)(({ theme }) => ({
    padding: theme.spacing(0, 1),
}));

const getHosting = ({
    hosting,
}: ConnectedEdge): 'Cloud' | 'Self-hosted' | 'Unknown' => {
    switch (hosting) {
        case 'hosted':
            return 'Cloud';
        case 'enterprise-self-hosted':
            return 'Self-hosted';
        default:
            return hosting ? `Unknown: ${hosting}` : 'Unknown';
    }
};

const getConnectionStatus = ({
    reportedAt,
}: ConnectedEdge): InstanceConnectionStatus => {
    const reportedTime = new Date(reportedAt).getTime();
    const reportedSecondsAgo = (Date.now() - reportedTime) / 1000;

    if (reportedSecondsAgo > 360) return 'Disconnected';
    if (reportedSecondsAgo > 180) return 'Stale';

    return 'Connected';
};

const getCPUPercentage = ({
    started,
    reportedAt,
    cpuUsage,
}: ConnectedEdge): string => {
    const cpuUsageSeconds = Number(cpuUsage);
    if (!cpuUsageSeconds) return 'No usage';

    const startedTimestamp = new Date(started).getTime();
    const reportedTimestamp = new Date(reportedAt).getTime();

    const totalRuntimeSeconds = (reportedTimestamp - startedTimestamp) / 1000;
    if (totalRuntimeSeconds === 0) return 'No usage';

    return `${((cpuUsageSeconds / totalRuntimeSeconds) * 100).toFixed(2)} %`;
};

const getMemory = ({ memoryUsage }: ConnectedEdge): string => {
    if (!memoryUsage) return 'No usage';

    const units = ['B', 'KB', 'MB', 'GB'];
    let size = memoryUsage;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
        size /= 1024;
        unitIndex++;
    }

    return `${size.toFixed(2)} ${units[unitIndex]}`;
};

type InstanceConnectionStatus = 'Connected' | 'Stale' | 'Disconnected';

interface INetworkConnectedEdgeInstanceProps {
    instance: ConnectedEdge;
}

export const NetworkConnectedEdgeInstance = ({
    instance,
}: INetworkConnectedEdgeInstanceProps) => {
    const { locationSettings } = useLocationSettings();

    const connectionStatus = getConnectionStatus(instance);
    const start = formatDateYMDHMS(instance.started, locationSettings?.locale);
    const lastReport = formatDateYMDHMS(
        instance.reportedAt,
        locationSettings?.locale,
    );
    const cpuPercentage = getCPUPercentage(instance);
    const memory = getMemory(instance);
    const archWarning = cpuPercentage === 'No usage' &&
        memory === 'No usage' && (
            <p>Resource metrics are only available when running on Linux.</p>
        );

    return (
        <StyledInstance>
            <StyledAccordion>
                <StyledAccordionSummary
                    expandIcon={<ExpandMore />}
                    connectionStatus={connectionStatus}
                >
                    <Tooltip
                        arrow
                        title={`${connectionStatus}. Last reported: ${lastReport}`}
                    >
                        <CircleIcon />
                    </Tooltip>
                    {instance.id || instance.instanceId}
                </StyledAccordionSummary>
                <StyledAccordionDetails>
                    <StyledDetailRow>
                        <strong>ID</strong>
                        <span>{instance.instanceId}</span>
                    </StyledDetailRow>
                    <StyledDetailRow>
                        <strong>Upstream server</strong>
                        <span>{instance.connectedVia || 'Unleash'}</span>
                    </StyledDetailRow>
                    <StyledDetailRow>
                        <strong>Region</strong>
                        <span>{instance.region || 'Unknown'}</span>
                    </StyledDetailRow>
                    <StyledDetailRow>
                        <strong>Hosting</strong>
                        <span>{getHosting(instance)}</span>
                    </StyledDetailRow>
                    <StyledDetailRow>
                        <strong>Version</strong>
                        <span>{instance.edgeVersion}</span>
                    </StyledDetailRow>
                    <StyledDetailRow>
                        <strong>Status</strong>
                        <StyledBadge
                            color={
                                connectionStatus === 'Disconnected'
                                    ? 'error'
                                    : connectionStatus === 'Stale'
                                      ? 'warning'
                                      : 'success'
                            }
                        >
                            {connectionStatus}
                        </StyledBadge>
                    </StyledDetailRow>
                    <StyledDetailRow>
                        <strong>Start</strong>
                        <span>{start}</span>
                    </StyledDetailRow>
                    <StyledDetailRow>
                        <strong>Last report</strong>
                        <span>{lastReport}</span>
                    </StyledDetailRow>
                    <StyledDetailRow>
                        <strong>CPU</strong>
                        <span>
                            {cpuPercentage}{' '}
                            <HelpIcon
                                tooltip={
                                    <>
                                        <p>
                                            CPU average usage since instance
                                            started.
                                        </p>
                                        {archWarning}
                                    </>
                                }
                                size='16px'
                            />
                        </span>
                    </StyledDetailRow>
                    <StyledDetailRow>
                        <strong>Memory</strong>
                        <span>
                            {memory}{' '}
                            <HelpIcon
                                tooltip={
                                    <>
                                        <p>Current memory usage.</p>
                                        {archWarning}
                                    </>
                                }
                                size='16px'
                            />
                        </span>
                    </StyledDetailRow>
                    <StyledDetailRow>
                        <strong>Stream clients</strong>
                        <span>{instance.connectedStreamingClients}</span>
                    </StyledDetailRow>
                    <StyledDetailRow>
                        <NetworkConnectedEdgeInstanceLatency
                            instance={instance}
                        />
                    </StyledDetailRow>
                </StyledAccordionDetails>
            </StyledAccordion>
        </StyledInstance>
    );
};
