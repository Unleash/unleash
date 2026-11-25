import { type FC, useEffect, useRef, useState } from 'react';
import { styled } from '@mui/material';
import { Link, useLocation } from 'react-router';
import { ThemeMode } from 'component/common/ThemeMode/ThemeMode';
import UnleashLogo from 'assets/img/logoDarkWithText.svg?react';
import UnleashLogoWhite from 'assets/img/logoWithWhiteText.svg?react';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import GridViewOutlinedIcon from '@mui/icons-material/GridViewOutlined';
import FlagOutlinedIcon from '@mui/icons-material/FlagOutlined';
import AutoFixNormalIcon from '@mui/icons-material/AutoFixNormal';
import InsightsIcon from '@mui/icons-material/Insights';
import QueryStatsOutlinedIcon from '@mui/icons-material/QueryStatsOutlined';
import { ChangeRequestIcon } from 'component/common/ChangeRequestIcon/ChangeRequestIcon';
import { Badge } from 'component/common/Badge/Badge';
import { useLocalStorageState } from 'hooks/useLocalStorageState';
import {
    ConfigureWorkspaceNavigation,
    isConfigureWorkspacePage,
} from './ConfigureWorkspaceNavigation.tsx';
import {
    AdminSettingsNavigation,
    isAdminSettingsPage,
} from './AdminSettingsNavigation.tsx';
import { HelpAndResourcesMenu } from './HelpAndResourcesMenu.tsx';
import { appNavigationLinks } from './appNavigationLinks.ts';
import { useVisibleAppNavigationLinks } from './useVisibleAppNavigationLinks.ts';
import { SearchButton } from './SearchButton.tsx';
import { SettingsMenu } from './SettingsMenu.tsx';
import { SidebarLink } from './SidebarLink.tsx';
import { SidebarList } from './SidebarList.tsx';
import { SidebarMoreToggle } from './SidebarMoreToggle.tsx';
import { SidebarSection } from './SidebarSection.tsx';
import { sidebarSectionLabels } from './sidebarSectionLabels.ts';
import { MyProjectsSection } from '../projects/MyProjectsSection.tsx';
import { OpenedProjectSection } from '../projects/OpenedProjectSection.tsx';

const StyledNav = styled('nav')(({ theme }) => ({
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: theme.palette.appShell.sidebar,
}));

const StyledScrollArea = styled('div')(({ theme }) => ({
    flex: 1,
    overflowY: 'auto',
    padding: theme.spacing(1.5),
}));

const StyledFooter = styled('div')(({ theme }) => ({
    flex: 'none',
    padding: theme.spacing(0, 1.5, 1.5),
}));

const StyledLogoLink = styled(Link)(({ theme }) => ({
    display: 'inline-flex',
    padding: theme.spacing(0.5),
    '& svg': { width: 110, height: 'auto' },
}));

const StyledNavBadge = styled(Badge)(({ theme }) => ({
    fontSize: '10px',
    padding: theme.spacing(0, 0.75),
    lineHeight: 1.4,
    whiteSpace: 'nowrap',
}));

const StyledSearchSlot = styled('div')(({ theme }) => ({
    margin: theme.spacing(1.5, 0, 2),
}));

type SidebarMode = 'app' | 'workspace' | 'admin';
type ManualChoice = { mode: SidebarMode; pathname: string };

const getPageMode = (pathname: string): SidebarMode => {
    if (isConfigureWorkspacePage(pathname)) return 'workspace';
    if (isAdminSettingsPage(pathname)) return 'admin';
    return 'app';
};

export const SidebarContent: FC<{
    searchOpen: boolean;
    onSearch: () => void;
    onSearchDocs?: () => void;
}> = ({ searchOpen, onSearch, onSearchDocs }) => {
    const { pathname } = useLocation();
    // A manual switch lasts until the pathname changes, so sorting or searching
    // a table, which only changes the query string, keeps it. It is cleared
    // rather than ignored so that coming back to the page does not revive it.
    const [choice, setChoice] = useState<ManualChoice | null>(null);
    if (choice && choice.pathname !== pathname) {
        setChoice(null);
    }
    const mode = choice ? choice.mode : getPageMode(pathname);
    const setMode = (next: SidebarMode) => setChoice({ mode: next, pathname });
    const panelRef = useRef<HTMLDivElement>(null);

    // Only manual switches move focus, not navigation. This runs after the
    // Settings menu returns focus to its button, so it wins.
    useEffect(() => {
        if (!choice) return;
        panelRef.current
            ?.querySelector<HTMLElement>('a[href], button')
            ?.focus();
    }, [choice]);

    return (
        <StyledNav aria-label='Main'>
            <StyledScrollArea ref={panelRef}>
                {mode === 'app' ? (
                    <AppNavigation
                        searchOpen={searchOpen}
                        onSearch={onSearch}
                    />
                ) : null}
                {mode === 'workspace' ? (
                    <ConfigureWorkspaceNavigation
                        onBack={() => setMode('app')}
                    />
                ) : null}
                {mode === 'admin' ? (
                    <AdminSettingsNavigation onBack={() => setMode('app')} />
                ) : null}
            </StyledScrollArea>
            <StyledFooter>
                <SidebarList>
                    <HelpAndResourcesMenu onSearchDocs={onSearchDocs} />
                    <SettingsMenu
                        onConfigureWorkspace={() => setMode('workspace')}
                        onAdminSettings={() => setMode('admin')}
                    />
                </SidebarList>
            </StyledFooter>
        </StyledNav>
    );
};

const AppNavigation: FC<{ searchOpen: boolean; onSearch: () => void }> = ({
    searchOpen,
    onSearch,
}) => {
    const visibleLinks = useVisibleAppNavigationLinks();

    return (
        <>
            <StyledLogoLink to='/' aria-label='Unleash'>
                <ThemeMode
                    darkmode={<UnleashLogoWhite aria-label='Unleash logo' />}
                    lightmode={<UnleashLogo aria-label='Unleash logo' />}
                />
            </StyledLogoLink>
            <StyledSearchSlot>
                <SearchButton expanded={searchOpen} onClick={onSearch} />
            </StyledSearchSlot>
            <SidebarList>
                <SidebarLink
                    {...appNavigationLinks.home}
                    icon={<HomeOutlinedIcon />}
                />
                {visibleLinks.includes(appNavigationLinks.changeRequests) ? (
                    <SidebarLink
                        {...appNavigationLinks.changeRequests}
                        icon={<ChangeRequestIcon />}
                    />
                ) : null}
            </SidebarList>
            <WorkspaceSection />
            <OpenedProjectSection />
            <MyProjectsSection />
        </>
    );
};

const WorkspaceSection: FC = () => {
    const visibleLinks = useVisibleAppNavigationLinks();
    const [moreState, setMoreState] = useLocalStorageState<'open' | 'closed'>(
        'app-shell:workspace-more',
        'closed',
    );
    const expanded = moreState === 'open';

    return (
        <SidebarSection title={sidebarSectionLabels.workspace}>
            <SidebarLink
                {...appNavigationLinks.projects}
                icon={<GridViewOutlinedIcon />}
            />
            <SidebarLink
                {...appNavigationLinks.flagsOverview}
                icon={<FlagOutlinedIcon />}
            />
            {expanded ? (
                <>
                    <SidebarLink
                        {...appNavigationLinks.playground}
                        icon={<AutoFixNormalIcon />}
                    />
                    {visibleLinks.includes(appNavigationLinks.analytics) ? (
                        <SidebarLink
                            {...appNavigationLinks.analytics}
                            icon={<InsightsIcon />}
                        />
                    ) : null}
                    {visibleLinks.includes(appNavigationLinks.impactViews) ? (
                        <SidebarLink
                            {...appNavigationLinks.impactViews}
                            icon={<QueryStatsOutlinedIcon />}
                            badge={
                                <StyledNavBadge color='info'>
                                    Internal
                                </StyledNavBadge>
                            }
                        />
                    ) : null}
                </>
            ) : null}
            <SidebarMoreToggle
                expanded={expanded}
                onToggle={() => setMoreState(expanded ? 'closed' : 'open')}
            />
        </SidebarSection>
    );
};
