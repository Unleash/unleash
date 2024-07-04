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
import { useNavigate } from 'react-router-dom';
import type { NavigationMode } from 'component/layout/MainLayout/NavigationSidebar/NavigationMode';
import { NewInUnleashItem } from './NewInUnleashItem';
import { usePlausibleTracker } from 'hooks/usePlausibleTracker';

const StyledNewInUnleash = styled('div')(({ theme }) => ({
    borderRadius: theme.shape.borderRadiusMedium,
    [theme.breakpoints.down('lg')]: {
        margin: theme.spacing(2),
        marginBottom: theme.spacing(1),
    },
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

type NewItem = {
    label: string;
    icon: ReactNode;
    link: string;
    show: boolean;
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
    const { trackEvent } = usePlausibleTracker();
    const navigate = useNavigate();
    const [seenItems, setSeenItems] = useLocalStorageState(
        'new-in-unleash-seen:v1',
        new Set(),
    );
    const { isEnterprise } = useUiConfig();
    const signalsEnabled = useUiFlag('signals');

    const items: NewItem[] = [
        {
            label: 'Signals & Actions',
            icon: <StyledSignalsIcon />,
            link: '/integrations/signals',
            show: isEnterprise() && signalsEnabled,
        },
    ];

    const visibleItems = items.filter(
        (item) => item.show && !seenItems.has(item.label),
    );

    if (!visibleItems.length) return null;

    if (mode === 'mini' && onMiniModeClick) {
        return (
            <ListItem disablePadding onClick={onMiniModeClick}>
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
            </ListItem>
        );
    }

    return (
        <StyledNewInUnleash>
            <StyledNewInUnleashHeader>
                <Icon>new_releases</Icon>
                New in Unleash
            </StyledNewInUnleashHeader>
            <StyledNewInUnleashList>
                {visibleItems.map(({ label, icon, link }) => (
                    <NewInUnleashItem
                        key={label}
                        icon={icon}
                        onClick={() => {
                            trackEvent('new-in-unleash-click', {
                                props: {
                                    label,
                                },
                            });
                            navigate(link);
                            onItemClick?.();
                        }}
                        onDismiss={() => {
                            trackEvent('new-in-unleash-dismiss', {
                                props: {
                                    label,
                                },
                            });
                            setSeenItems(new Set([...seenItems, label]));
                        }}
                    >
                        {label}
                    </NewInUnleashItem>
                ))}
            </StyledNewInUnleashList>
        </StyledNewInUnleash>
    );
};
