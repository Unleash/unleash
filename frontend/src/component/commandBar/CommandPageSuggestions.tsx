import {
    CommandResultGroup,
    listItemButtonStyle,
    StyledButtonTypography,
    StyledListItemIcon,
    StyledListItemText,
} from './RecentlyVisited/CommandResultGroup.tsx';
import { ListItemButton } from '@mui/material';
import { Link } from 'react-router-dom';
import { IconRenderer } from 'component/layout/MainLayout/NavigationSidebar/IconRenderer';
import { usePlausibleTracker } from 'hooks/usePlausibleTracker';
import type { JSX } from 'react';

interface IPageSuggestionItem {
    icon: JSX.Element;
    name: string;
    path: string;
}

const toListItemData = (
    items: string[],
    routes: Record<string, { path: string; title: string }>,
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
];

export const CommandPageSuggestions = ({
    routes,
    onClick,
}: {
    routes: Record<string, { path: string; title: string }>;
    onClick: () => void;
}) => {
    const { trackEvent } = usePlausibleTracker();
    const filtered = pages.filter((page) => routes[page]);
    const pageItems = toListItemData(filtered, routes);
    const onItemClick = (item: IPageSuggestionItem) => {
        trackEvent('command-bar', {
            props: {
                eventType: `click`,
                source: 'suggestions',
                eventTarget: 'Pages',
                pageType: item.name,
            },
        });
        onClick();
    };
    return (
        <CommandResultGroup icon='pages' groupName='Pages' onClick={onClick}>
            {pageItems.map((item, index) => (
                <ListItemButton
                    key={`recently-visited-${index}`}
                    dense={true}
                    component={Link}
                    to={item.path}
                    onClick={() => {
                        onItemClick(item);
                    }}
                    sx={listItemButtonStyle}
                >
                    <StyledListItemIcon>{item.icon}</StyledListItemIcon>
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
