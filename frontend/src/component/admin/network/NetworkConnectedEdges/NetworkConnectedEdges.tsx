import { usePageTitle } from 'hooks/usePageTitle';
import { ArcherContainer, ArcherElement } from 'react-archer';
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Alert,
    Typography,
    styled,
    useTheme,
} from '@mui/material';
import { unknownify } from 'utils/unknownify';
import { useMemo } from 'react';
import { ReactComponent as LogoIcon } from 'assets/icons/logoBg.svg';
import { ReactComponent as LogoIconWhite } from 'assets/icons/logoWhiteBg.svg';
import { ThemeMode } from 'component/common/ThemeMode/ThemeMode';
import { useConnectedEdges } from 'hooks/api/getters/useConnectedEdges/useConnectedEdges';
import type { ConnectedEdge } from 'interfaces/connectedEdge';

const UNLEASH = 'Unleash';

const StyledUnleashLevel = styled('div')(({ theme }) => ({
    marginBottom: theme.spacing(18),
    display: 'flex',
    justifyContent: 'center',
}));

const StyledEdgeLevel = styled('div')(({ theme }) => ({
    display: 'flex',
    justifyContent: 'center',
    gap: theme.spacing(4),
    flexWrap: 'wrap',
    marginTop: theme.spacing(2),
}));

const StyledElement = styled('div')(({ theme }) => ({
    borderRadius: theme.shape.borderRadiusMedium,
    border: '1px solid',
    borderColor: theme.palette.secondary.border,
    backgroundColor: theme.palette.secondary.light,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: theme.spacing(1.5),
    zIndex: 1,
    marginTop: theme.spacing(1),
    '& > svg': {
        width: theme.spacing(9),
        height: theme.spacing(9),
    },
}));

const StyledGroup = styled(StyledElement)(({ theme }) => ({
    backgroundColor: 'transparent',
}));

const StyledElementHeader = styled(Typography)(({ theme }) => ({
    fontWeight: theme.fontWeight.bold,
}));

const StyledElementDescription = styled(Typography)(({ theme }) => ({
    fontSize: theme.fontSizes.smallerBody,
    color: theme.palette.text.secondary,
}));

const StyledInstanceAccordion = styled(Accordion)(({ theme }) => ({
    background: 'transparent',
    boxShadow: 'none',
}));

type ConnectedEdgeInstance = ConnectedEdge & {
    connectionStatus: InstanceConnectionStatus;
};

type AppNameGroup = {
    appName: string;
    instances: ConnectedEdgeInstance[];
    groupTargets: Set<string>;
    level: number;
    levelComputed?: boolean;
};

type InstanceConnectionStatus = 'Connected' | 'Stale' | 'Disconnected';

const getConnectionStatus = (
    { reportedAt }: ConnectedEdge,
    now: number,
): InstanceConnectionStatus => {
    const reportedTime = new Date(reportedAt).getTime();
    const reportedSecondsAgo = (now - reportedTime) / 1000;

    if (reportedSecondsAgo > 60) return 'Disconnected';
    if (reportedSecondsAgo > 30) return 'Stale';

    return 'Connected';
};

const computeLevel = (
    appName: string,
    groups: Map<string, AppNameGroup>,
): number => {
    const group = groups.get(appName);
    if (!group) return 0;
    if (group.levelComputed) return group.level;
    let maxLevel = 0;
    group.groupTargets.forEach((target) => {
        if (target !== UNLEASH) {
            const parentLevel = computeLevel(target, groups);
            maxLevel = Math.max(maxLevel, parentLevel + 1);
        }
    });
    group.level = maxLevel;
    group.levelComputed = true;
    return maxLevel;
};

const processGraph = (
    connectedEdges: ConnectedEdge[],
): Map<number, AppNameGroup[]> => {
    const now = Date.now();
    const groups = new Map<string, AppNameGroup>();

    connectedEdges.forEach((edge) => {
        const instance: ConnectedEdgeInstance = {
            ...edge,
            connectionStatus: getConnectionStatus(edge, now),
        };
        if (!groups.has(edge.appName)) {
            groups.set(edge.appName, {
                appName: edge.appName,
                instances: [instance],
                groupTargets: new Set<string>(),
                level: 0,
            });
        } else {
            groups.get(edge.appName)!.instances.push(instance);
        }
    });

    const instanceToGroup = new Map<string, string>();
    groups.forEach((group) => {
        group.instances.forEach((instance) => {
            instanceToGroup.set(instance.instanceId, group.appName);
        });
    });

    groups.forEach((group, appName) => {
        group.instances.forEach((instance) => {
            const target = instance.connectedVia || UNLEASH;
            if (target === UNLEASH) {
                group.groupTargets.add(UNLEASH);
            } else {
                const targetGroup = instanceToGroup.get(target);
                if (targetGroup && targetGroup !== appName) {
                    group.groupTargets.add(targetGroup);
                }
            }
        });
    });

    groups.forEach((_, appName) => {
        computeLevel(appName, groups);
    });

    const groupsByLevel = new Map<number, AppNameGroup[]>();
    groups.forEach((group) => {
        const level = group.level;
        if (!groupsByLevel.has(level)) {
            groupsByLevel.set(level, []);
        }
        groupsByLevel.get(level)!.push(group);
    });
    return groupsByLevel;
};

export const NetworkConnectedEdges = () => {
    usePageTitle('Network - Connected Edges');
    const theme = useTheme();
    const { connectedEdges } = useConnectedEdges();

    const appNamesByLevel = useMemo(
        () => processGraph(connectedEdges),
        [connectedEdges],
    );
    const levels = [...appNamesByLevel.keys()].sort((a, b) => a - b);

    if (appNamesByLevel.size === 0)
        return <Alert severity='warning'>No data available.</Alert>;

    return (
        <ArcherContainer
            strokeColor={theme.palette.text.primary}
            endShape={{ arrow: { arrowLength: 4, arrowThickness: 4 } }}
        >
            <StyledUnleashLevel>
                <ArcherElement id={UNLEASH}>
                    <StyledElement>
                        <ThemeMode
                            darkmode={<LogoIconWhite />}
                            lightmode={<LogoIcon />}
                        />
                        <Typography sx={{ marginTop: theme.spacing(1) }}>
                            {UNLEASH}
                        </Typography>
                    </StyledElement>
                </ArcherElement>
            </StyledUnleashLevel>
            {levels.map((level) => (
                <StyledEdgeLevel key={level}>
                    {appNamesByLevel
                        .get(level)!
                        .map(({ appName, groupTargets, instances }) => (
                            <ArcherElement
                                key={appName}
                                id={appName}
                                relations={Array.from(groupTargets).map(
                                    (target) => ({
                                        targetId: target,
                                        targetAnchor: 'bottom',
                                        sourceAnchor: 'top',
                                        style: {
                                            strokeColor:
                                                theme.palette.secondary.border,
                                        },
                                    }),
                                )}
                            >
                                <StyledGroup>
                                    <StyledElementHeader>
                                        {unknownify(appName)}
                                    </StyledElementHeader>
                                    <StyledElementDescription>
                                        {instances.length} instance
                                        {instances.length === 1 ? '' : 's'}
                                    </StyledElementDescription>
                                    {instances.map(
                                        ({
                                            instanceId,
                                            edgeVersion,
                                            connectedVia,
                                        }) => (
                                            <StyledElement key={instanceId}>
                                                <StyledInstanceAccordion>
                                                    <AccordionSummary>
                                                        <StyledElementHeader>
                                                            {instanceId}
                                                        </StyledElementHeader>
                                                    </AccordionSummary>
                                                    <AccordionDetails>
                                                        <p>
                                                            Connected to:{' '}
                                                            <strong>
                                                                {connectedVia ||
                                                                    UNLEASH}
                                                            </strong>
                                                        </p>
                                                        <br />
                                                        <p>
                                                            (Edge {edgeVersion})
                                                        </p>
                                                        <p>
                                                            Some more details
                                                            here...
                                                        </p>
                                                    </AccordionDetails>
                                                </StyledInstanceAccordion>
                                            </StyledElement>
                                        ),
                                    )}
                                </StyledGroup>
                            </ArcherElement>
                        ))}
                </StyledEdgeLevel>
            ))}
        </ArcherContainer>
    );
};

export default NetworkConnectedEdges;
