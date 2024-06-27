import {
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    styled,
    Typography,
} from '@mui/material';
import { Link } from 'react-router-dom';
import { IconRenderer } from 'component/layout/MainLayout/NavigationSidebar/IconRenderer';
import type { Theme } from '@mui/material/styles/createTheme';
import { usePlausibleTracker } from 'hooks/usePlausibleTracker';
import type { JSX } from 'react';

const listItemButtonStyle = (theme: Theme) => ({
    border: `1px solid transparent`,
    borderLeft: `${theme.spacing(0.5)} solid transparent`,
    '&:hover': {
        border: `1px solid ${theme.palette.primary.main}`,
        borderLeft: `${theme.spacing(0.5)} solid ${theme.palette.primary.main}`,
    },
});

const StyledContainer = styled('div')(({ theme }) => ({
    marginBottom: theme.spacing(3),
}));

const StyledButtonTypography = styled(Typography)(({ theme }) => ({
    fontSize: theme.fontSizes.smallerBody,
}));

const StyledTypography = styled(Typography)(({ theme }) => ({
    fontSize: theme.fontSizes.smallBody,
    padding: theme.spacing(0, 2.5),
}));

const StyledListItemIcon = styled(ListItemIcon)(({ theme }) => ({
    minWidth: theme.spacing(4),
    margin: theme.spacing(0.25, 0),
}));

const StyledListItemText = styled(ListItemText)(({ theme }) => ({
    margin: 0,
    fontSize: theme.fontSizes.smallBody,
}));

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

export const PageSuggestions = ({
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
        <StyledContainer>
            <StyledTypography color='textSecondary'>Pages</StyledTypography>
            <List>
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
                                color: theme.palette.primary.main,
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
            </List>
        </StyledContainer>
    );
};
