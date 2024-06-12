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

export const RecentlyVisited = ({
    lastVisited,
}: { lastVisited: LastViewedPage[] }) => {
    return (
        <>
            <StyledTypography color='textSecondary'>
                Recently visited
            </StyledTypography>
            <List>
                {lastVisited.map((item, index) => (
                    <ListItemButton
                        key={`recently-visited-${index}`}
                        dense={true}
                        component={Link}
                        to={item.pathName ?? '/default'}
                        sx={listItemButtonStyle}
                    >
                        <StyledListItemIcon>
                            <IconRenderer path={item.pathName ?? '/default'} />
                        </StyledListItemIcon>
                        <StyledListItemText>
                            <Typography>{item.pathName}</Typography>
                        </StyledListItemText>
                    </ListItemButton>
                ))}
            </List>
        </>
    );
};
