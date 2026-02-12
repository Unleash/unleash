import { type FC, useEffect, useRef } from 'react';
import {
    ContentGridContainer,
    FlagGrid,
    ListItemBox,
    SpacedGridItem,
    StyledCardTitle,
    StyledList,
    listItemStyle,
} from './SharedComponents.tsx';
import { usePlausibleTracker } from 'hooks/usePlausibleTracker';
import { getFeatureTypeIcons } from 'utils/getFeatureTypeIcons';
import {
    Alert,
    IconButton,
    Link,
    ListItem,
    ListItemButton,
    Typography,
    styled,
} from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import React from 'react';
import type { PersonalDashboardSchemaFlagsItem } from 'openapi';

const NoActiveFlagsInfo = styled('div')(({ theme }) => ({
    display: 'flex',
    flexFlow: 'column',
    gap: theme.spacing(2),
}));

const FlagListItem: FC<{
    flag: { name: string; project: string; type: string };
    selected: boolean;
    onClick: () => void;
}> = ({ flag, selected, onClick }) => {
    const activeFlagRef = useRef<HTMLLIElement>(null);
    const { trackEvent } = usePlausibleTracker();

    useEffect(() => {
        if (activeFlagRef.current) {
            activeFlagRef.current.scrollIntoView({
                block: 'start',
                inline: 'start',
            });
            window.scrollTo({ top: 0 });
        }
    }, []);
    const IconComponent = getFeatureTypeIcons(flag.type);
    const flagLink = `projects/${flag.project}/features/${flag.name}`;
    return (
        <ListItem
            key={flag.name}
            disablePadding={true}
            sx={{ mb: 1 }}
            ref={selected ? activeFlagRef : null}
        >
            <ListItemButton
                sx={listItemStyle}
                selected={selected}
                onClick={onClick}
            >
                <ListItemBox>
                    <IconComponent color='primary' />
                    <StyledCardTitle>{flag.name}</StyledCardTitle>
                    <IconButton
                        component={Link}
                        href={flagLink}
                        onClick={() => {
                            trackEvent('personal-dashboard', {
                                props: {
                                    eventType: `Go to flag from list`,
                                },
                            });
                        }}
                        size='small'
                        sx={{ ml: 'auto' }}
                    >
                        <SettingsIcon titleAccess={`Go to flag ${flag.name}`} />
                    </IconButton>
                </ListItemBox>
            </ListItemButton>
        </ListItem>
    );
};

type FlagData =
    | {
          state: 'flags';
          flags: PersonalDashboardSchemaFlagsItem[];
          activeFlag?: PersonalDashboardSchemaFlagsItem;
      }
    | {
          state: 'no flags';
      };

type Props = {
    hasProjects: boolean;
    flagData: FlagData;
    setActiveFlag: (flag: PersonalDashboardSchemaFlagsItem) => void;
    refetchDashboard: () => void;
};

export const MyFlags: FC<Props> = ({
    hasProjects,
    flagData,
    setActiveFlag,
    refetchDashboard,
}) => {
    return (
        <ContentGridContainer>
            <FlagGrid>
                <SpacedGridItem gridArea='flags'>
                    {flagData.state === 'flags' ? (
                        <StyledList
                            disablePadding={true}
                            sx={{
                                height: '100%',
                            }}
                        >
                            {flagData.flags.map((flag) => (
                                <FlagListItem
                                    key={flag.name}
                                    flag={flag}
                                    selected={
                                        flag.name === flagData.activeFlag?.name
                                    }
                                    onClick={() => setActiveFlag(flag)}
                                />
                            ))}
                        </StyledList>
                    ) : hasProjects ? (
                        <NoActiveFlagsInfo>
                            <Typography>
                                You have not created or favorited any feature
                                flags. Once you do, they will show up here.
                            </Typography>
                            <Typography>
                                To create a new flag, go to one of your
                                projects.
                            </Typography>
                        </NoActiveFlagsInfo>
                    ) : (
                        <Alert severity='info'>
                            You need to create or join a project to be able to
                            add a flag, or you must be given the rights by your
                            admin to add feature flags.
                        </Alert>
                    )}
                </SpacedGridItem>

                <SpacedGridItem gridArea='chart'>
                    {flagData.state === 'flags' && flagData.activeFlag ? (
                        <FlagMetricsChart
                            flag={flagData.activeFlag}
                            onArchive={refetchDashboard}
                        />
                    ) : (
                        <PlaceholderFlagMetricsChart
                            label={
                                'Metrics for your feature flags will be shown here'
                            }
                        />
                    )}
                </SpacedGridItem>
            </FlagGrid>
        </ContentGridContainer>
    );
};

const FlagMetricsChart = React.lazy(() =>
    import('./FlagMetricsChart.tsx').then((module) => ({
        default: module.FlagMetricsChart,
    })),
);
const PlaceholderFlagMetricsChart = React.lazy(() =>
    import('./FlagMetricsChart.tsx').then((module) => ({
        default: module.PlaceholderFlagMetricsChartWithWrapper,
    })),
);
