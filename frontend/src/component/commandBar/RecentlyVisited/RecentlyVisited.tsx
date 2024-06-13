import {
    Icon,
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    styled,
    Typography,
} from '@mui/material';
import { Link } from 'react-router-dom';
import {
    IconRenderer,
    StyledProjectIcon,
} from 'component/layout/MainLayout/NavigationSidebar/IconRenderer';
import type { LastViewedPage } from 'hooks/useRecentlyVisited';
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

const toListItemData = (lastVisited: LastViewedPage[]) => {
    return lastVisited.map((item) => {
        if (item.featureId) {
            return {
                name: item.featureId,
                path: `/projects/${item.projectId}/features/${item.featureId}`,
                icon: <Icon>{'flag'}</Icon>,
            };
        }
        if (item.projectId) {
            return {
                name: item.projectId,
                path: `/projects/${item.projectId}`,
                icon: <StyledProjectIcon />,
            };
        }
        return {
            name: item.featureId ?? item.projectId ?? item.pathName,
            path: item.pathName || '/',
            icon: <IconRenderer path={item.pathName ?? '/unknown'} />,
        };
    });
};

export const RecentlyVisited = ({
    lastVisited,
}: { lastVisited: LastViewedPage[] }) => {
    const listItems = toListItemData(lastVisited);
    return (
        <>
            <StyledTypography color='textSecondary'>
                Recently visited
            </StyledTypography>
            <List>
                {listItems.map((item, index) => (
                    <ListItemButton
                        key={`recently-visited-${index}`}
                        dense={true}
                        component={Link}
                        to={item.path}
                        sx={listItemButtonStyle}
                    >
                        <StyledListItemIcon>{item.icon}</StyledListItemIcon>
                        <StyledListItemText>
                            <Typography>{item.name}</Typography>
                        </StyledListItemText>
                    </ListItemButton>
                ))}
            </List>
        </>
    );
};
