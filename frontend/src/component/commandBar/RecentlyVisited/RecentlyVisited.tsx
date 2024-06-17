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
import PlaygroundIcon from '@mui/icons-material/AutoFixNormal';
import InsightsIcon from '@mui/icons-material/Insights';
import type { LastViewedPage } from 'hooks/useRecentlyVisited';
import type { Theme } from '@mui/material/styles/createTheme';
import useProjectOverview from 'hooks/api/getters/useProjectOverview/useProjectOverview';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import type { ReactElement } from 'react-markdown/lib/react-markdown';

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

const overridePathIcons: Record<string, () => ReactElement> = {
    '/insights': () => <InsightsIcon />,
    '/playground': () => <PlaygroundIcon />,
    '/projects': () => <StyledProjectIcon />,
};

const toListItemButton = (
    item: LastViewedPage,
    routes: Record<string, { path: string; route: string; title: string }>,
    index: number,
) => {
    const key = `recently-visited-${index}`;
    if (item.featureId && item.projectId) {
        return (
            <RecentlyVisitedFeatureButton
                key={key}
                featureId={item.featureId}
                projectId={item.projectId}
            />
        );
    }
    if (item.projectId) {
        return (
            <RecentlyVisitedProjectButton
                key={key}
                projectId={item.projectId}
            />
        );
    }
    if (!item.pathName) return null;
    const name = routes[item.pathName]?.title ?? item.pathName;
    return (
        <RecentlyVisitedPathButton key={key} path={item.pathName} name={name} />
    );
};

const RecentlyVisitedFeatureButton = ({
    key,
    projectId,
    featureId,
}: { key: string; projectId: string; featureId: string }) => {
    return (
        <ListItemButton
            key={key}
            dense={true}
            component={Link}
            to={`/projects/${projectId}/features/${featureId}`}
            sx={listItemButtonStyle}
        >
            <StyledListItemIcon>
                <Icon>{'flag'}</Icon>
            </StyledListItemIcon>
            <StyledListItemText>
                <Typography color='textPrimary'>{featureId}</Typography>
            </StyledListItemText>
        </ListItemButton>
    );
};

const RecentlyVisitedPathButton = ({
    path,
    key,
    name,
}: { path: string; key: string; name: string }) => {
    return (
        <ListItemButton
            key={key}
            dense={true}
            component={Link}
            to={path}
            sx={listItemButtonStyle}
        >
            <StyledListItemIcon>
                <ConditionallyRender
                    condition={overridePathIcons[path] !== undefined}
                    show={overridePathIcons[path]}
                    elseShow={<IconRenderer path={path} />}
                />
            </StyledListItemIcon>
            <StyledListItemText>
                <Typography color='textPrimary'>{name}</Typography>
            </StyledListItemText>
        </ListItemButton>
    );
};

const RecentlyVisitedProjectButton = ({
    projectId,
    key,
}: { projectId: string; key: string }) => {
    const { project, loading } = useProjectOverview(projectId);
    const projectDeleted = !project.name && !loading;
    if (projectDeleted) return null;
    return (
        <ListItemButton
            key={key}
            dense={true}
            component={Link}
            to={`/projects/${projectId}`}
            sx={listItemButtonStyle}
        >
            <StyledListItemIcon>
                <StyledProjectIcon />
            </StyledListItemIcon>
            <StyledListItemText>
                <Typography color='textPrimary'>{project.name}</Typography>
            </StyledListItemText>
        </ListItemButton>
    );
};

export const RecentlyVisited = ({
    lastVisited,
    routes,
}: {
    lastVisited: LastViewedPage[];
    routes: Record<string, { path: string; route: string; title: string }>;
}) => {
    const buttons = lastVisited.map((item, index) =>
        toListItemButton(item, routes, index),
    );
    return (
        <>
            <StyledTypography color='textSecondary'>
                Recently visited
            </StyledTypography>
            <List>{buttons}</List>
        </>
    );
};
