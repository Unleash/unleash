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
import type { Theme } from '@mui/material/styles/createTheme';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { TooltipResolver } from 'component/common/TooltipResolver/TooltipResolver';
import { usePlausibleTracker } from 'hooks/usePlausibleTracker';
import useProjectOverview from 'hooks/api/getters/useProjectOverview/useProjectOverview';
import { Children } from 'react';
import { ProjectIcon } from 'component/common/ProjectIcon/ProjectIcon';
import { ButtonItemIcon } from '../ButtonItemIcon.tsx';

export const listItemButtonStyle = (theme: Theme) => ({
    border: `1px solid transparent`,
    borderLeft: `${theme.spacing(0.5)} solid transparent`,
});
export const StyledTypography = styled(Typography)(({ theme }) => ({
    fontSize: theme.fontSizes.bodySize,
    padding: theme.spacing(0, 2.5),
}));

export const StyledListItemIcon = styled(ListItemIcon)(({ theme }) => ({
    minWidth: theme.spacing(0.5),
    margin: theme.spacing(0, 1, 0, 0),
}));

export const StyledListItemText = styled(ListItemText)(({ theme }) => ({
    margin: 0,
    fontSize: theme.fontSizes.bodySize,
}));

export const StyledButtonTypography = styled(Typography)(({ theme }) => ({
    fontSize: theme.fontSizes.bodySize,
}));

export interface CommandResultGroupItem {
    name: string;
    link: string;
    description?: string | null;
}

export const RecentlyVisitedPathButton = ({
    keyName,
    path,
    name,
    onClick,
}: {
    path: string;
    keyName: string;
    name: string;
    onClick: () => void;
}) => {
    const { trackEvent } = usePlausibleTracker();

    const onItemClick = () => {
        trackEvent('command-bar', {
            props: {
                eventType: `click`,
                source: 'recently-visited',
                eventTarget: 'Pages',
                pageType: name,
            },
        });
        onClick();
    };

    return (
        <ListItemButton
            key={keyName}
            dense={true}
            component={Link}
            to={path}
            sx={listItemButtonStyle}
            onClick={onItemClick}
        >
            <StyledListItemIcon>
                <ButtonItemIcon path={path} />
            </StyledListItemIcon>
            <StyledListItemText>
                <StyledButtonTypography color='textPrimary'>
                    {name}
                </StyledButtonTypography>
            </StyledListItemText>
        </ListItemButton>
    );
};

export const RecentlyVisitedProjectButton = ({
    projectId,
    keyName,
    onClick,
}: {
    projectId: string;
    keyName: string;
    onClick: () => void;
}) => {
    const { trackEvent } = usePlausibleTracker();
    const { project, loading } = useProjectOverview(projectId);
    const projectDeleted = !project.name && !loading;

    const onItemClick = () => {
        trackEvent('command-bar', {
            props: {
                eventType: `click`,
                source: 'recently-visited',
                eventTarget: 'Projects',
            },
        });
        onClick();
    };

    if (projectDeleted) return null;
    return (
        <ListItemButton
            key={keyName}
            dense={true}
            component={Link}
            to={`/projects/${projectId}`}
            sx={listItemButtonStyle}
            onClick={onItemClick}
        >
            <StyledListItemIcon>
                <ProjectIcon />
            </StyledListItemIcon>
            <StyledListItemText>
                <StyledButtonTypography color='textPrimary'>
                    {project.name}
                </StyledButtonTypography>
            </StyledListItemText>
        </ListItemButton>
    );
};

export const RecentlyVisitedFeatureButton = ({
    keyName,
    projectId,
    featureId,
    onClick,
}: {
    keyName: string;
    projectId: string;
    featureId: string;
    onClick: () => void;
}) => {
    const { trackEvent } = usePlausibleTracker();
    const onItemClick = () => {
        trackEvent('command-bar', {
            props: {
                eventType: `click`,
                source: 'recently-visited',
                eventTarget: 'Flags',
            },
        });
        onClick();
    };
    return (
        <ListItemButton
            key={keyName}
            dense={true}
            component={Link}
            to={`/projects/${projectId}/features/${featureId}`}
            sx={listItemButtonStyle}
            onClick={onItemClick}
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

interface CommandResultGroupProps {
    icon: string;
    groupName: string;
    items?: CommandResultGroupItem[];
    onClick: () => void;
    children?: React.ReactNode;
}

export const CommandResultGroup = ({
    icon,
    groupName,
    items,
    onClick,
    children,
}: CommandResultGroupProps) => {
    const { trackEvent } = usePlausibleTracker();
    if (
        (!children || Children.count(children) === 0) &&
        (!items || items.length === 0)
    ) {
        return null;
    }

    const slicedItems = items?.slice(0, 3);

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
        <div>
            <StyledTypography color='textSecondary'>
                {groupName}
            </StyledTypography>
            <List>
                {children}
                {slicedItems?.map((item, index) => (
                    <ListItemButton
                        key={`command-result-group-${groupName}-${index}`}
                        dense={true}
                        component={Link}
                        onClick={(e) => {
                            e.stopPropagation();
                            onItemClick(item);
                        }}
                        to={item.link}
                        sx={listItemButtonStyle}
                    >
                        <StyledListItemIcon>
                            <ConditionallyRender
                                condition={groupName === 'Projects'}
                                show={<ProjectIcon />}
                                elseShow={<Icon>{icon}</Icon>}
                            />
                        </StyledListItemIcon>
                        <TooltipResolver
                            title={item.description}
                            variant={'custom'}
                            placement={'bottom-end'}
                        >
                            <StyledListItemText>
                                <StyledButtonTypography color='textPrimary'>
                                    {item.name}
                                </StyledButtonTypography>
                            </StyledListItemText>
                        </TooltipResolver>
                    </ListItemButton>
                ))}
            </List>
        </div>
    );
};
