import { usePageTitle } from 'hooks/usePageTitle';
import { ArcherContainer, ArcherElement } from 'react-archer';
import { Alert, Typography, styled, useTheme } from '@mui/material';
import { unknownify } from 'utils/unknownify';
import { useMemo } from 'react';
import { ReactComponent as LogoIcon } from 'assets/icons/logoBg.svg';
import { ReactComponent as LogoIconWhite } from 'assets/icons/logoWhiteBg.svg';
import { ThemeMode } from 'component/common/ThemeMode/ThemeMode';
import { useConnectedEdges } from 'hooks/api/getters/useConnectedEdges/useConnectedEdges';
import type { ConnectedEdge } from 'interfaces/connectedEdge';
import { NetworkConnectedEdgeInstance } from './NetworkConnectedEdgeInstance.tsx';

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

const StyledNode = styled('div')(({ theme }) => ({
    borderRadius: theme.shape.borderRadiusMedium,
    border: `1px solid ${theme.palette.secondary.border}`,
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

const StyledGroup = styled(StyledNode)({
    backgroundColor: 'transparent',
});

const StyledNodeHeader = styled(Typography)(({ theme }) => ({
    fontWeight: theme.fontWeight.bold,
}));

const StyledNodeDescription = styled(Typography)(({ theme }) => ({
    fontSize: theme.fontSizes.smallerBody,
    color: theme.palette.text.secondary,
}));

type AppNameGroup = {
    appName: string;
    instances: ConnectedEdge[];
    groupTargets: Set<string>;
    level: number;
};

const createGroups = (edges: ConnectedEdge[]): Map<string, AppNameGroup> =>
    edges.reduce((groups, edge) => {
        if (!groups.has(edge.appName)) {
            groups.set(edge.appName, {
                appName: edge.appName,
                instances: [],
                groupTargets: new Set(),
                level: 0,
            });
        }
        groups.get(edge.appName)!.instances.push(edge);
        return groups;
    }, new Map<string, AppNameGroup>());

const computeGroupLevels = (
    groups: Map<string, AppNameGroup>,
): Map<number, AppNameGroup[]> => {
    const memo = new Map<string, number>();

    const getLevel = (group: AppNameGroup): number => {
        if (memo.has(group.appName)) return memo.get(group.appName)!;
        let level = 0;
        group.groupTargets.forEach((target) => {
            if (target !== UNLEASH) {
                const targetGroup = groups.get(target);
                if (targetGroup) {
                    level = Math.max(level, getLevel(targetGroup) + 1);
                }
            }
        });
        memo.set(group.appName, level);
        return level;
    };

    groups.forEach((group) => {
        group.level = getLevel(group);
    });

    const levelsMap = new Map<number, AppNameGroup[]>();
    groups.forEach((group) => {
        const levelGroups = levelsMap.get(group.level) || [];
        levelGroups.push(group);
        levelsMap.set(group.level, levelGroups);
    });
    return levelsMap;
};

const processEdges = (edges: ConnectedEdge[]): Map<number, AppNameGroup[]> => {
    const groups = createGroups(edges);
    const instanceIdToId = new Map<string, string>();
    const idToAppName = new Map<string, string>();

    groups.forEach((group) => {
        group.instances = group.instances
            .sort((a, b) => a.instanceId.localeCompare(b.instanceId))
            .map((instance, index) => {
                const id = `${group.appName}-${index + 1}`;
                instanceIdToId.set(instance.instanceId, id);
                idToAppName.set(id, group.appName);
                return { ...instance, id };
            });
    });

    groups.forEach((group) => {
        group.instances = group.instances.map((instance) => ({
            ...instance,
            connectedVia: instance.connectedVia
                ? instanceIdToId.get(instance.connectedVia) ||
                  instance.connectedVia
                : UNLEASH,
        }));
        const targets = new Set<string>();
        group.instances.forEach((instance) => {
            if (!instance.connectedVia || instance.connectedVia === UNLEASH) {
                targets.add(UNLEASH);
            } else {
                const targetApp = idToAppName.get(instance.connectedVia);
                if (targetApp && targetApp !== group.appName) {
                    targets.add(targetApp);
                }
            }
        });
        group.groupTargets = targets;
    });

    return computeGroupLevels(groups);
};

export const NetworkConnectedEdges = () => {
    usePageTitle('Network - Connected Edges');
    const theme = useTheme();
    const { connectedEdges } = useConnectedEdges({ refreshInterval: 30_000 });

    const edgeLevels = useMemo(
        () => processEdges(connectedEdges),
        [connectedEdges],
    );
    const levels = Array.from(edgeLevels.keys()).sort((a, b) => a - b);

    if (edgeLevels.size === 0)
        return (
            <Alert severity='info'>
                <strong>No Enterprise Edge instances connected</strong>
                <br />
                <br />
                Unlock deeper visibility into your Edge network and enable
                high-performance streaming for your SDKs.
                <br />
                <br />
                Enterprise Edge gives you:
                <br />• Real-time SDK updates through the streaming API
                <br />• Full observability into your Edge instances
                <br />
                <br />
                Interested in getting started?{' '}
                <a href={`mailto:sales@getunleash.io?subject=Enterprise Edge`}>
                    Contact us
                </a>
            </Alert>
        );

    return (
        <ArcherContainer
            strokeColor={theme.palette.text.primary}
            endShape={{ arrow: { arrowLength: 4, arrowThickness: 4 } }}
        >
            <StyledUnleashLevel>
                <ArcherElement id={UNLEASH}>
                    <StyledNode>
                        <ThemeMode
                            darkmode={<LogoIconWhite />}
                            lightmode={<LogoIcon />}
                        />
                        <Typography sx={{ mt: 1 }}>{UNLEASH}</Typography>
                    </StyledNode>
                </ArcherElement>
            </StyledUnleashLevel>
            {levels.map((level) => (
                <StyledEdgeLevel key={level}>
                    {edgeLevels
                        .get(level)
                        ?.map(({ appName, groupTargets, instances }) => (
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
                                    <StyledNodeHeader>
                                        {unknownify(appName)}
                                    </StyledNodeHeader>
                                    <StyledNodeDescription>
                                        {instances.length} instance
                                        {instances.length !== 1 && 's'}
                                    </StyledNodeDescription>
                                    {instances.map((instance) => (
                                        <NetworkConnectedEdgeInstance
                                            key={instance.instanceId}
                                            instance={instance}
                                        />
                                    ))}
                                </StyledGroup>
                            </ArcherElement>
                        ))}
                </StyledEdgeLevel>
            ))}
        </ArcherContainer>
    );
};

export default NetworkConnectedEdges;
