import { useEventTracker } from 'hooks/useEventTracker';
import { Link } from 'react-router';
import {
    CommandResultGroup,
    StyledButtonTypography,
    StyledListItemIcon,
    StyledListItemText,
    listItemButtonStyle,
    type CommandResultGroupItem,
} from './RecentlyVisited/CommandResultGroup.tsx';
import { ListItemButton } from '@mui/material';
import { ButtonItemIcon } from './ButtonItemIcon.tsx';

export const CommandSearchPages = ({
    items,
    onClick,
}: {
    items: CommandResultGroupItem[];
    onClick: () => void;
}) => {
    const { trackEvent } = useEventTracker();
    const groupName = 'Pages';

    const onItemClick = (item: CommandResultGroupItem) => {
        trackEvent('command-bar', {
            props: {
                eventType: `click`,
                source: 'search',
                eventTarget: groupName,
                ...(groupName === 'Pages' && { pageType: item.name }),
            },
        });
        onClick();
    };
    return (
        <CommandResultGroup
            groupName={'Pages'}
            icon={'default'}
            onClick={onClick}
        >
            {items.map((item, index) => (
                <ListItemButton
                    key={`command-result-group-pages-${index}`}
                    dense={true}
                    component={Link}
                    nativeButton={false}
                    to={item.link}
                    onClick={() => {
                        onItemClick(item);
                    }}
                    sx={listItemButtonStyle}
                >
                    <StyledListItemIcon>
                        <ButtonItemIcon path={item.link} />
                    </StyledListItemIcon>
                    <StyledListItemText>
                        <StyledButtonTypography color='textPrimary'>
                            {item.name}
                        </StyledButtonTypography>
                    </StyledListItemText>
                </ListItemButton>
            ))}
        </CommandResultGroup>
    );
};
