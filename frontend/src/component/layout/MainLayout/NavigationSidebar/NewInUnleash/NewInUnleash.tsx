import type { ReactNode } from 'react';
import { useUiFlag } from 'hooks/useUiFlag';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { useLocalStorageState } from 'hooks/useLocalStorageState';
import {
    Badge,
    Icon,
    ListItem,
    ListItemButton,
    ListItemIcon,
    Tooltip,
    styled,
} from '@mui/material';
import Signals from '@mui/icons-material/Sensors';
import type { NavigationMode } from 'component/layout/MainLayout/NavigationSidebar/NavigationMode';
import { NewInUnleashItem } from './NewInUnleashItem';
import { usePlausibleTracker } from 'hooks/usePlausibleTracker';
import { ReactComponent as SignalsPreview } from 'assets/img/signals.svg';
import LinearScaleIcon from '@mui/icons-material/LinearScale';
import { useNavigate } from 'react-router-dom';
import { useEventTimelineContext } from 'component/events/EventTimeline/EventTimelineContext';
import { ReactComponent as EventTimelinePreview } from 'assets/img/eventTimeline.svg';

const StyledNewInUnleash = styled('div')(({ theme }) => ({
    margin: theme.spacing(2, 0, 1, 0),
    borderRadius: theme.shape.borderRadiusMedium,
    [theme.breakpoints.down('lg')]: {
        margin: theme.spacing(2),
        marginBottom: theme.spacing(1),
    },
}));

const StyledListItem = styled(ListItem)(({ theme }) => ({
    margin: theme.spacing(1, 0, 1, 0),
}));

const StyledNewInUnleashHeader = styled('p')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    lineHeight: 1,
    gap: theme.spacing(1),
    '& > span': {
        color: theme.palette.neutral.main,
    },
    padding: theme.spacing(1, 2),
}));

const StyledNewInUnleashList = styled('ul')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    padding: theme.spacing(1),
    listStyle: 'none',
    margin: 0,
    gap: theme.spacing(1),
}));

const StyledMiniItemButton = styled(ListItemButton)(({ theme }) => ({
    borderRadius: theme.spacing(0.5),
    borderLeft: `${theme.spacing(0.5)} solid transparent`,
    '&.Mui-selected': {
        borderLeft: `${theme.spacing(0.5)} solid ${theme.palette.primary.main}`,
    },
}));

const StyledMiniItemIcon = styled(ListItemIcon)(({ theme }) => ({
    minWidth: theme.spacing(4),
    margin: theme.spacing(0.25, 0),
}));

const StyledSignalsIcon = styled(Signals)(({ theme }) => ({
    color: theme.palette.primary.main,
}));

const StyledLinearScaleIcon = styled(LinearScaleIcon)(({ theme }) => ({
    color: theme.palette.primary.main,
}));

type NewItem = {
    label: string;
    summary: string;
    icon: ReactNode;
    onCheckItOut: () => void;
    docsLink: string;
    show: boolean;
    longDescription: ReactNode;
    preview?: ReactNode;
    beta?: boolean;
};

interface INewInUnleashProps {
    mode?: NavigationMode;
    onItemClick?: () => void;
    onMiniModeClick?: () => void;
}

export const NewInUnleash = ({
    mode = 'full',
    onItemClick,
    onMiniModeClick,
}: INewInUnleashProps) => {
    const navigate = useNavigate();
    const { trackEvent } = usePlausibleTracker();
    const [seenItems, setSeenItems] = useLocalStorageState(
        'new-in-unleash-seen:v1',
        new Set(),
    );
    const { isOss, isEnterprise } = useUiConfig();
    const signalsEnabled = useUiFlag('signals');
    const eventTimelineEnabled = useUiFlag('eventTimeline');

    const { setHighlighted } = useEventTimelineContext();

    const items: NewItem[] = [
        {
            label: 'Signals & Actions',
            summary: 'Listen to signals via Webhooks',
            icon: <StyledSignalsIcon />,
            preview: <SignalsPreview />,
            onCheckItOut: () => navigate('/integrations/signals'),
            docsLink: 'https://docs.getunleash.io/reference/signals',
            show: isEnterprise() && signalsEnabled,
            longDescription: (
                <>
                    <p>
                        It allows you to respond to events in your real-time
                        monitoring system by automating tasks such as disabling
                        a beta feature in response to an increase in errors or a
                        drop in conversion rates.
                    </p>

                    <p>
                        <ul>
                            <li>
                                <b>Signal endpoints</b> are used to send signals
                                to Unleash. This allows you to integrate Unleash
                                with any external tool.
                            </li>

                            <li>
                                <b>Actions</b>, which are configured inside
                                projects, allow you to react to those signals
                                and enable or disable flags based on certain
                                conditions.
                            </li>
                        </ul>
                    </p>
                </>
            ),
        },
        {
            label: 'Event timeline',
            summary: 'Keep track of recent events across all your projects',
            icon: <StyledLinearScaleIcon />,
            preview: <EventTimelinePreview />,
            onCheckItOut: () => {
                setHighlighted(true);
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth',
                });
            },
            docsLink: 'https://docs.getunleash.io/reference/events',
            show: !isOss() && eventTimelineEnabled,
            longDescription: (
                <>
                    <p>
                        Monitor recent events across all your projects in one
                        unified timeline.
                    </p>

                    <p>
                        You can access the event timeline from the top menu to
                        get an overview of changes and quickly identify and
                        debug any issues.
                    </p>
                </>
            ),
            beta: true,
        },
    ];

    const visibleItems = items.filter(
        (item) => item.show && !seenItems.has(item.label),
    );

    if (!visibleItems.length) return null;

    if (mode === 'mini' && onMiniModeClick) {
        return (
            <StyledListItem disablePadding onClick={onMiniModeClick}>
                <StyledMiniItemButton dense>
                    <Tooltip title='New in Unleash' placement='right'>
                        <StyledMiniItemIcon>
                            <Badge
                                badgeContent={visibleItems.length}
                                color='primary'
                            >
                                <Icon>new_releases</Icon>
                            </Badge>
                        </StyledMiniItemIcon>
                    </Tooltip>
                </StyledMiniItemButton>
            </StyledListItem>
        );
    }

    return (
        <StyledNewInUnleash>
            <StyledNewInUnleashHeader>
                <Icon>new_releases</Icon>
                New in Unleash
            </StyledNewInUnleashHeader>
            <StyledNewInUnleashList>
                {visibleItems.map(
                    ({
                        label,
                        icon,
                        onCheckItOut,
                        longDescription,
                        docsLink,
                        preview,
                        summary,
                        beta = false,
                    }) => (
                        <NewInUnleashItem
                            key={label}
                            onClick={() => {
                                trackEvent('new-in-unleash-click', {
                                    props: {
                                        label,
                                    },
                                });
                            }}
                            onDismiss={() => {
                                trackEvent('new-in-unleash-dismiss', {
                                    props: {
                                        label,
                                    },
                                });
                                setSeenItems(new Set([...seenItems, label]));
                            }}
                            label={label}
                            icon={icon}
                            onCheckItOut={onCheckItOut}
                            preview={preview}
                            longDescription={longDescription}
                            docsLink={docsLink}
                            summary={summary}
                            beta={beta}
                        />
                    ),
                )}
            </StyledNewInUnleashList>
        </StyledNewInUnleash>
    );
};
