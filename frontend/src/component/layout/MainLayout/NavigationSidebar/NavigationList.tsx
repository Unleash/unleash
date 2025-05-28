import type { ComponentProps, FC } from 'react';
import type { INavigationMenuItem } from 'interfaces/route';
import type { NavigationMode } from './NavigationMode.tsx';
import {
    ExternalFullListItem,
    MenuListItem,
    SignOutItem,
} from './ListItems.tsx';
import { Box, List, Typography } from '@mui/material';
import { IconRenderer } from './IconRenderer.tsx';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import FlagIcon from '@mui/icons-material/OutlinedFlag';
import { ProjectIcon } from 'component/common/ProjectIcon/ProjectIcon';
import useProjectOverview from 'hooks/api/getters/useProjectOverview/useProjectOverview';
import { useNewAdminMenu } from 'hooks/useNewAdminMenu';
import { AdminMenuNavigation } from '../AdminMenu/AdminNavigationItems.tsx';
import { useUiFlag } from 'hooks/useUiFlag.ts';
import { ConfigurationAccordion } from './ConfigurationAccordion.tsx';

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

/**
 * @deprecated remove with `sideMenuCleanup` flag
 */
export const RecentProjectsList: FC<{
    projectId: string;
    projectName: string;
    mode: NavigationMode;
    onClick: () => void;
}> = ({ projectId, projectName, mode, onClick }) => (
    <List>
        <MenuListItem
            href={`/projects/${projectId}`}
            text={projectName}
            onClick={onClick}
            selected={false}
            mode={mode}
        >
            <ProjectIcon />
        </MenuListItem>
    </List>
);

/**
 * @deprecated remove with `sideMenuCleanup` flag
 */
export const RecentFlagsList: FC<{
    flags: { featureId: string; projectId: string }[];
    mode: NavigationMode;
    onClick: () => void;
}> = ({ flags, mode, onClick }) => (
    <List>
        {flags.map((flag) => (
            <MenuListItem
                href={`/projects/${flag.projectId}/features/${flag.featureId}`}
                text={flag.featureId}
                onClick={onClick}
                selected={false}
                key={flag.featureId}
                mode={mode}
            >
                <FlagIcon />
            </MenuListItem>
        ))}
    </List>
);

export const PrimaryNavigationList: FC<{
    mode: NavigationMode;
    setMode: (mode: NavigationMode) => void;
    onClick: (activeItem: string) => void;
    activeItem?: string;
}> = ({ mode, setMode, onClick, activeItem }) => {
    const PrimaryListItem = ({
        href,
        text,
    }: Pick<ComponentProps<typeof MenuListItem>, 'href' | 'text'>) => (
        <MenuListItem
            href={href}
            text={text}
            icon={<IconRenderer path={href} />}
            onClick={() => onClick(href)}
            selected={activeItem === href}
            mode={mode}
        />
    );

    const { isOss } = useUiConfig();
    const sideMenuCleanup = useUiFlag('sideMenuCleanup');

    return (
        <List>
            <PrimaryListItem href='/personal' text='Dashboard' />
            <PrimaryListItem href='/projects' text='Projects' />
            <PrimaryListItem href='/search' text='Flags overview' />
            <PrimaryListItem href='/playground' text='Playground' />
            {!isOss() ? (
                <PrimaryListItem
                    href='/insights'
                    text={sideMenuCleanup ? 'Analytics' : 'Insights'}
                />
            ) : null}
            <ConfigurationAccordion
                mode={mode}
                setMode={setMode}
                activeItem={activeItem}
                onClick={() => onClick('configure')}
            />
        </List>
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
}> = ({ mode, onClick }) => (
    <Box>
        <List>
            <MenuListItem
                href='/admin'
                text='Admin settings'
                onClick={() => onClick('/admin')}
                mode={mode}
                icon={<IconRenderer path='/admin' />}
            />
        </List>
    </Box>
);

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
