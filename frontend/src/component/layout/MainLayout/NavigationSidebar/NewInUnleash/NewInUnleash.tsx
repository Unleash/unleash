import type { ReactNode } from 'react';
import { useUiFlag } from 'hooks/useUiFlag';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { useLocalStorageState } from 'hooks/useLocalStorageState';
import {
    Badge,
    ListItem,
    ListItemButton,
    ListItemIcon,
    Tooltip,
    styled,
} from '@mui/material';
import NewReleases from '@mui/icons-material/NewReleases';
import Signals from '@mui/icons-material/Sensors';
import { useNavigate } from 'react-router-dom';
import type { NavigationMode } from 'component/layout/MainLayout/NavigationSidebar/NavigationMode';
import { NewInUnleashItem } from './NewInUnleashItem';

const StyledNewInUnleash = styled('div')(({ theme }) => ({
    // border: `1px solid ${theme.palette.divider}`,
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
    '& > svg': {
        color: theme.palette.neutral.main,
    },
    padding: theme.spacing(1, 2),
    // borderBottom: `1px solid ${theme.palette.divider}`,
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
    isBeta?: boolean;
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
            // isBeta: true,
        },
        {
            label: 'Other beta',
            icon: <StyledSignalsIcon />,
            link: '/integrations/signals',
            show: isEnterprise() && signalsEnabled,
            // isBeta: true,
        },
        {
            label: 'GA feature',
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
                                <NewReleases />
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
                <NewReleases />
                New in Unleash
            </StyledNewInUnleashHeader>
            <StyledNewInUnleashList>
                {visibleItems.map(({ label, icon, isBeta, link }) => (
                    <NewInUnleashItem
                        key={label}
                        icon={icon}
                        // isBeta={isBeta}
                        onClick={() => {
                            navigate(link);
                            onItemClick?.();
                        }}
                        onDismiss={() => {
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
