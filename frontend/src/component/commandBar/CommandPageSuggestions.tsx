import { ListItemButton } from '@mui/material';
import { Link } from 'react-router-dom';
import { IconRenderer } from 'component/layout/MainLayout/NavigationSidebar/IconRenderer';
import { usePlausibleTracker } from 'hooks/usePlausibleTracker';
import type { JSX } from 'react';
import {
    CommandResultGroup,
    listItemButtonStyle,
    StyledButtonTypography,
    StyledListItemIcon,
    StyledListItemText,
} from './RecentlyVisited/CommandResultGroup';

interface IPageSuggestionItem {
    icon: JSX.Element;
    name: string;
    path: string;
}

const toListItemData = (
    items: string[],
    routes: Record<string, { path: string; route: string; title: string }>,
): IPageSuggestionItem[] => {
    return items.map((item) => {
        return {
            name: routes[item]?.title ?? item,
            path: item,
            icon: <IconRenderer path={item} />,
        };
    });
};

const pages = [
    '/search',
    '/integrations',
    '/environments',
    '/context',
    '/segments',
    '/tag-types',
    '/applications',
    '/strategies',
];

export const CommandPageSuggestions = ({
    routes,
}: {
    routes: Record<string, { path: string; route: string; title: string }>;
}) => {
    const { trackEvent } = usePlausibleTracker();
    const filtered = pages.filter((page) => routes[page]);
    const pageItems = toListItemData(filtered, routes);
    const onClick = (item: IPageSuggestionItem) => {
        trackEvent('command-bar', {
            props: {
                eventType: `click`,
                source: 'suggestions',
                eventTarget: 'Pages',
                pageType: item.name,
            },
        });
    };
    return (
        <CommandResultGroup icon='pages' groupName='Pages'>
            {pageItems.map((item, index) => (
                <ListItemButton
                    key={`recently-visited-${index}`}
                    dense={true}
                    component={Link}
                    to={item.path}
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
                        {item.icon}
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
