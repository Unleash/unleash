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

const listItemButtonStyle = (theme: Theme) => ({
    borderRadius: theme.spacing(0.5),
    borderLeft: `${theme.spacing(0.5)} solid transparent`,
    '&.Mui-selected': {
        borderLeft: `${theme.spacing(0.5)} solid ${theme.palette.primary.main}`,
    },
});

const StyledTypography = styled(Typography)(({ theme }) => ({
    fontSize: theme.fontSizes.bodySize,
    padding: theme.spacing(0, 3),
}));

const StyledListItemIcon = styled(ListItemIcon)(({ theme }) => ({
    minWidth: theme.spacing(4),
    margin: theme.spacing(0.25, 0),
}));

const StyledListItemText = styled(ListItemText)(({ theme }) => ({
    margin: 0,
}));

const toListItemData = (
    items: string[],
    routes: Record<string, { path: string; route: string; title: string }>,
) => {
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
    const filtered = pages.filter((page) => routes[page]);
    const pageItems = toListItemData(filtered, routes);
    return (
        <>
            <StyledTypography color='textSecondary'>Pages</StyledTypography>
            <List>
                {pageItems.map((item, index) => (
                    <ListItemButton
                        key={`recently-visited-${index}`}
                        dense={true}
                        component={Link}
                        to={item.path}
                        sx={listItemButtonStyle}
                    >
                        <StyledListItemIcon>{item.icon}</StyledListItemIcon>
                        <StyledListItemText>
                            <Typography color='textPrimary'>
                                {item.name}
                            </Typography>
                        </StyledListItemText>
                    </ListItemButton>
                ))}
            </List>
        </>
    );
};
