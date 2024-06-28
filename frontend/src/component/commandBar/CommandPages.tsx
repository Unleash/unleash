import { usePlausibleTracker } from 'hooks/usePlausibleTracker';
import { Link } from 'react-router-dom';
import {
    CommandResultGroup,
    StyledButtonTypography,
    StyledListItemIcon,
    StyledListItemText,
    listItemButtonStyle,
    type CommandResultGroupItem,
} from './RecentlyVisited/CommandResultGroup';
import { ListItemButton } from '@mui/material';
import { IconRenderer } from 'component/layout/MainLayout/NavigationSidebar/IconRenderer';

export const CommandPages = ({
    items,
}: {
    items: CommandResultGroupItem[];
}) => {
    const { trackEvent } = usePlausibleTracker();
    const groupName = 'Pages';

    const onClick = (item: CommandResultGroupItem) => {
        trackEvent('command-bar', {
            props: {
                eventType: `click`,
                source: 'search',
                eventTarget: groupName,
                ...(groupName === 'Pages' && { pageType: item.name }),
            },
        });
    };
    return (
        <CommandResultGroup groupName={'Pages'} icon={'default'}>
            {items.map((item, index) => (
                <ListItemButton
                    key={`command-result-group-pages-${index}`}
                    dense={true}
                    component={Link}
                    to={item.link}
                    onClick={() => {
                        onClick(item);
                    }}
                    sx={listItemButtonStyle}
                >
                    <StyledListItemIcon
                        sx={(theme) => ({
                            fontSize: theme.fontSizes.smallBody,
                            minWidth: theme.spacing(0.5),
                            margin: theme.spacing(0, 1, 0, 0),
                        })}
                    >
                        <IconRenderer path={item.link} />
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
