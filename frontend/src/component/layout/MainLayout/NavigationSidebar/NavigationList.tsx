import type React from 'react';
import { type FC, useCallback } from 'react';
import type { INavigationMenuItem } from 'interfaces/route';
import type { NavigationMode } from './NavigationMode';
import {
    ExternalFullListItem,
    FullListItem,
    MiniListItem,
    SignOutItem,
} from './ListItems';
import { Box, List, styled, Tooltip, Typography } from '@mui/material';
import { IconRenderer } from './IconRenderer';
import { EnterpriseBadge } from 'component/common/EnterpriseBadge/EnterpriseBadge';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import SearchIcon from '@mui/icons-material/Search';
import PlaygroundIcon from '@mui/icons-material/AutoFixNormal';
import InsightsIcon from '@mui/icons-material/Insights';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FlagIcon from '@mui/icons-material/OutlinedFlag';
import { useUiFlag } from 'hooks/useUiFlag';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import useProjectOverview from 'hooks/api/getters/useProjectOverview/useProjectOverview';
import { ProjectIcon } from 'component/common/ProjectIcon/ProjectIcon';

const StyledBadgeContainer = styled('div')(({ theme }) => ({
    paddingLeft: theme.spacing(2),
    display: 'flex',
}));

const EnterprisePlanBadge = () => (
    <Tooltip title='This is an Enterprise feature'>
        <StyledBadgeContainer>
            <EnterpriseBadge />
        </StyledBadgeContainer>
    </Tooltip>
);

const useShowBadge = () => {
    const { isPro } = useUiConfig();

    const showBadge = useCallback(
        (mode?: INavigationMenuItem['menu']['mode']) => {
            return !!(
                isPro() &&
                !mode?.includes('pro') &&
                mode?.includes('enterprise')
            );
        },
        [isPro],
    );
    return showBadge;
};

export const SecondaryNavigationList: FC<{
    routes: INavigationMenuItem[];
    mode: NavigationMode;
    onClick: (activeItem: string) => void;
    activeItem?: string;
}> = ({ routes, mode, onClick, activeItem }) => {
    const showBadge = useShowBadge();
    const DynamicListItem = mode === 'mini' ? MiniListItem : FullListItem;

    return (
        <List>
            {routes.map((route) => (
                <DynamicListItem
                    key={route.title}
                    onClick={() => onClick(route.path)}
                    href={route.path}
                    text={route.title}
                    selected={activeItem === route.path}
                    badge={
                        showBadge(route?.menu?.mode) ? (
                            <EnterprisePlanBadge />
                        ) : null
                    }
                >
                    <IconRenderer path={route.path} />
                </DynamicListItem>
            ))}
        </List>
    );
};

export const OtherLinksList = () => {
    const { uiConfig } = useUiConfig();

    return (
        <List>
            {uiConfig.links.map((link) => (
                <ExternalFullListItem
                    href={link.href}
                    text={link.value}
                    key={link.value}
                >
                    <IconRenderer path={link.value} />
                </ExternalFullListItem>
            ))}
            <SignOutItem />
        </List>
    );
};

export const RecentProjectsList: FC<{
    projectId: string;
    projectName: string;
    mode: NavigationMode;
    onClick: () => void;
}> = ({ projectId, projectName, mode, onClick }) => {
    const DynamicListItem = mode === 'mini' ? MiniListItem : FullListItem;

    return (
        <List>
            <DynamicListItem
                href={`/projects/${projectId}`}
                text={projectName}
                onClick={onClick}
                selected={false}
            >
                <ProjectIcon />
            </DynamicListItem>
        </List>
    );
};

export const RecentFlagsList: FC<{
    flags: { featureId: string; projectId: string }[];
    mode: NavigationMode;
    onClick: () => void;
}> = ({ flags, mode, onClick }) => {
    const DynamicListItem = mode === 'mini' ? MiniListItem : FullListItem;

    return (
        <List>
            {flags.map((flag) => (
                <DynamicListItem
                    href={`/projects/${flag.projectId}/features/${flag.featureId}`}
                    text={flag.featureId}
                    onClick={onClick}
                    selected={false}
                    key={flag.featureId}
                >
                    <FlagIcon />
                </DynamicListItem>
            ))}
        </List>
    );
};

export const PrimaryNavigationList: FC<{
    mode: NavigationMode;
    onClick: (activeItem: string) => void;
    activeItem?: string;
}> = ({ mode, onClick, activeItem }) => {
    const DynamicListItem = mode === 'mini' ? MiniListItem : FullListItem;
    const killInsightsDashboard = useUiFlag('killInsightsUI');
    const { isOss } = useUiConfig();

    return (
        <List>
            <DynamicListItem
                href='/projects'
                text='Projects'
                onClick={() => onClick('/projects')}
                selected={activeItem === '/projects'}
            >
                <ProjectIcon />
            </DynamicListItem>
            <DynamicListItem
                href='/search'
                text='Search'
                onClick={() => onClick('/search')}
                selected={activeItem === '/search'}
            >
                <SearchIcon />
            </DynamicListItem>
            <DynamicListItem
                href='/playground'
                text='Playground'
                onClick={() => onClick('/playground')}
                selected={activeItem === '/playground'}
            >
                <PlaygroundIcon />
            </DynamicListItem>
            <ConditionallyRender
                condition={!killInsightsDashboard && !isOss()}
                show={
                    <DynamicListItem
                        href='/insights'
                        text='Insights'
                        onClick={() => onClick('/insights')}
                        selected={activeItem === '/insights'}
                    >
                        <InsightsIcon />
                    </DynamicListItem>
                }
            />
        </List>
    );
};

const AccordionHeader: FC<{ children?: React.ReactNode }> = ({ children }) => {
    return (
        <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls='configure-content'
            id='configure-header'
        >
            <Typography sx={{ fontWeight: 'bold', fontSize: 'small' }}>
                {children}
            </Typography>
        </AccordionSummary>
    );
};

export const SecondaryNavigation: FC<{
    expanded: boolean;
    onExpandChange: (expanded: boolean) => void;
    mode: NavigationMode;
    title: string;
    children?: React.ReactNode;
}> = ({ mode, expanded, onExpandChange, title, children }) => {
    return (
        <Accordion
            disableGutters={true}
            sx={{
                boxShadow: 'none',
                '&:before': {
                    display: 'none',
                },
            }}
            expanded={expanded}
            onChange={(_, expand) => {
                onExpandChange(expand);
            }}
        >
            {mode === 'full' && <AccordionHeader>{title}</AccordionHeader>}
            <AccordionDetails sx={{ p: 0 }}>{children}</AccordionDetails>
        </Accordion>
    );
};

export const RecentProjectsNavigation: FC<{
    mode: NavigationMode;
    projectId: string;
    onClick: () => void;
}> = ({ mode, onClick, projectId }) => {
    const { project, loading } = useProjectOverview(projectId);
    const projectDeleted = !project.name && !loading;

    if (projectDeleted) return null;
    return (
        <Box>
            {mode === 'full' && (
                <Typography
                    sx={{
                        fontWeight: 'bold',
                        fontSize: 'small',
                        ml: 2,
                        mt: 1.5,
                    }}
                >
                    Recent project
                </Typography>
            )}
            <RecentProjectsList
                projectId={projectId}
                projectName={project.name}
                mode={mode}
                onClick={onClick}
            />
        </Box>
    );
};

export const RecentFlagsNavigation: FC<{
    mode: NavigationMode;
    flags: { featureId: string; projectId: string }[];
    onClick: () => void;
}> = ({ mode, onClick, flags }) => {
    return (
        <Box>
            {mode === 'full' && (
                <Typography
                    sx={{ fontWeight: 'bold', fontSize: 'small', ml: 2 }}
                >
                    Recent flags
                </Typography>
            )}
            <RecentFlagsList flags={flags} mode={mode} onClick={onClick} />
        </Box>
    );
};
