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
import useProjectOverview from 'hooks/api/getters/useProjectOverview/useProjectOverview';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { usePlausibleTracker } from '../../../hooks/usePlausibleTracker';

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

const ColoredStyledProjectIcon = styled(StyledProjectIcon)(({ theme }) => ({
    fill: theme.palette.primary.main,
    stroke: theme.palette.primary.main,
}));

const StyledTypography = styled(Typography)(({ theme }) => ({
    fontSize: theme.fontSizes.smallBody,
    padding: theme.spacing(0, 2.5),
}));

const StyledListItemIcon = styled(ListItemIcon)(({ theme }) => ({
    minWidth: theme.spacing(0.5),
    margin: theme.spacing(0, 1, 0, 0),
    color: theme.palette.primary.main,
}));

const StyledListItemText = styled(ListItemText)(({ theme }) => ({
    margin: 0,
    fontSize: theme.fontSizes.smallBody,
}));

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
    const { trackEvent } = usePlausibleTracker();

    const onClick = () => {
        trackEvent('command-bar', {
            props: {
                eventType: `click`,
                source: 'recently-visited',
                eventTarget: 'Flags',
            },
        });
    };
    return (
        <ListItemButton
            key={key}
            dense={true}
            component={Link}
            onClick={onClick}
            to={`/projects/${projectId}/features/${featureId}`}
            sx={listItemButtonStyle}
        >
            <StyledListItemIcon>
                <Icon>{'flag'}</Icon>
            </StyledListItemIcon>
            <StyledListItemText>
                <StyledButtonTypography color='textPrimary'>
                    {featureId}
                </StyledButtonTypography>
            </StyledListItemText>
        </ListItemButton>
    );
};

const RecentlyVisitedPathButton = ({
    path,
    key,
    name,
}: { path: string; key: string; name: string }) => {
    const { trackEvent } = usePlausibleTracker();

    const onClick = () => {
        trackEvent('command-bar', {
            props: {
                eventType: `click`,
                source: 'recently-visited',
                eventTarget: 'Pages',
                pageType: name,
            },
        });
    };
    return (
        <ListItemButton
            key={key}
            dense={true}
            component={Link}
            to={path}
            onClick={onClick}
            sx={listItemButtonStyle}
        >
            <StyledListItemIcon
                sx={(theme) => ({ color: theme.palette.primary.main })}
            >
                <ConditionallyRender
                    condition={path === '/projects'}
                    show={<ColoredStyledProjectIcon />}
                    elseShow={<IconRenderer path={path} />}
                />
            </StyledListItemIcon>
            <StyledListItemText>
                <StyledButtonTypography color='textPrimary'>
                    {name}
                </StyledButtonTypography>
            </StyledListItemText>
        </ListItemButton>
    );
};

const RecentlyVisitedProjectButton = ({
    projectId,
    key,
}: { projectId: string; key: string }) => {
    const { trackEvent } = usePlausibleTracker();
    const { project, loading } = useProjectOverview(projectId);
    const projectDeleted = !project.name && !loading;

    const onClick = () => {
        trackEvent('command-bar', {
            props: {
                eventType: `click`,
                source: 'recently-visited',
                eventTarget: 'Projects',
            },
        });
    };

    if (projectDeleted) return null;
    return (
        <ListItemButton
            key={key}
            dense={true}
            component={Link}
            to={`/projects/${projectId}`}
            onClick={onClick}
            sx={listItemButtonStyle}
        >
            <StyledListItemIcon>
                <ColoredStyledProjectIcon />
            </StyledListItemIcon>
            <StyledListItemText>
                <StyledButtonTypography color='textPrimary'>
                    {project.name}
                </StyledButtonTypography>
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
        <StyledContainer>
            <StyledTypography color='textSecondary'>
                Recently visited
            </StyledTypography>
            <List>{buttons}</List>
        </StyledContainer>
    );
};
