import type React from 'react';
import type { FC } from 'react';
import type { INavigationMenuItem } from 'interfaces/route';
import type { NavigationMode } from './NavigationMode.tsx';
import {
    ExternalFullListItem,
    FullListItem,
    MiniListItem,
    SignOutItem,
} from './ListItems.tsx';
import { Box, List, Typography } from '@mui/material';
import { IconRenderer } from './IconRenderer.tsx';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FlagIcon from '@mui/icons-material/OutlinedFlag';
import StopRoundedIcon from '@mui/icons-material/StopRounded';
import { ProjectIcon } from 'component/common/ProjectIcon/ProjectIcon';
import useProjectOverview from 'hooks/api/getters/useProjectOverview/useProjectOverview';
import { useShowBadge } from 'component/layout/components/EnterprisePlanBadge/useShowBadge';
import { EnterprisePlanBadge } from 'component/layout/components/EnterprisePlanBadge/EnterprisePlanBadge';
import { useNewAdminMenu } from 'hooks/useNewAdminMenu';
import { AdminMenuNavigation } from '../AdminMenu/AdminNavigationItems.tsx';
import { useUiFlag } from 'hooks/useUiFlag.ts';

export const SecondaryNavigationList: FC<{
    routes: INavigationMenuItem[];
    mode: NavigationMode;
    onClick: (activeItem: string) => void;
    activeItem?: string;
}> = ({ routes, mode, onClick, activeItem }) => {
    const showBadge = useShowBadge();
    const DynamicListItem = mode === 'mini' ? MiniListItem : FullListItem;
    const sideMenuCleanup = useUiFlag('sideMenuCleanup');

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
                    {sideMenuCleanup ? (
                        <StopRoundedIcon fontSize='small' />
                    ) : (
                        <IconRenderer path={route.path} />
                    )}
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
    const { isOss } = useUiConfig();
    const sideMenuCleanup = useUiFlag('sideMenuCleanup');

    return (
        <List>
            <DynamicListItem
                href='/personal'
                text='Dashboard'
                onClick={() => onClick('/personal')}
                selected={activeItem === '/personal'}
            >
                <IconRenderer path='/personal' />
            </DynamicListItem>

            <DynamicListItem
                href='/projects'
                text='Projects'
                onClick={() => onClick('/projects')}
                selected={activeItem === '/projects'}
            >
                <IconRenderer path='/projects' />
            </DynamicListItem>
            <DynamicListItem
                href='/search'
                text='Flags overview'
                onClick={() => onClick('/search')}
                selected={activeItem === '/search'}
            >
                <IconRenderer path='/search' />
            </DynamicListItem>
            <DynamicListItem
                href='/playground'
                text='Playground'
                onClick={() => onClick('/playground')}
                selected={activeItem === '/playground'}
            >
                <IconRenderer path='/playground' />
            </DynamicListItem>
            {!isOss() ? (
                <DynamicListItem
                    href='/insights'
                    text={sideMenuCleanup ? 'Analytics' : 'Insights'}
                    onClick={() => onClick('/insights')}
                    selected={activeItem === '/insights'}
                >
                    <IconRenderer path='/insights' />
                </DynamicListItem>
            ) : null}
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

export const AdminSettingsNavigation: FC<{
    onClick: (activeItem: string) => void;
    onSetFullMode: () => void;
    expanded: boolean;
    routes: INavigationMenuItem[];
    onExpandChange: (expanded: boolean) => void;
    activeItem: string;
    mode: NavigationMode;
}> = ({
    onClick,
    onSetFullMode,
    expanded,
    routes,
    onExpandChange,
    activeItem,
    mode,
}) => {
    const { showOnlyAdminMenu } = useNewAdminMenu();
    if (showOnlyAdminMenu) {
        return <AdminMenuNavigation onClick={() => onClick('/admin')} />;
    }

    const setFullModeOnClick = (activeItem: string) => {
        onSetFullMode();
        onClick(activeItem);
    };

    return <AdminSettingsLink mode={mode} onClick={setFullModeOnClick} />;
};

export const AdminSettingsLink: FC<{
    mode: NavigationMode;
    onClick: (activeItem: string) => void;
}> = ({ mode, onClick }) => {
    const DynamicListItem = mode === 'mini' ? MiniListItem : FullListItem;
    return (
        <Box>
            <List>
                <DynamicListItem
                    href='/admin'
                    text='Admin settings'
                    onClick={() => onClick('/admin')}
                >
                    <IconRenderer path='/admin' />
                </DynamicListItem>
            </List>
        </Box>
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
