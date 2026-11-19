import { type FC, type ReactNode, useEffect, useRef, useState } from 'react';
import { styled } from '@mui/material';
import { Link, useLocation } from 'react-router';
import { ThemeMode } from 'component/common/ThemeMode/ThemeMode';
import { SkipNavTarget } from 'component/common/SkipNavLink/SkipNavTarget';
import { EventTimelineProvider } from 'component/events/EventTimeline/EventTimelineProvider';
import { FloatingOnboardingChecklistProvider } from 'component/onboarding/floatingChecklist/FloatingOnboardingChecklistContext.tsx';
import { FloatingOnboardingChecklistVisibilityGate } from 'component/onboarding/floatingChecklist/FloatingOnboardingChecklistVisibilityGate.tsx';
import { HelpButtonHintProvider } from 'component/menu/Header/HelpResources/HelpButtonHintContext.tsx';
import UnleashLogo from 'assets/img/logoDarkWithText.svg?react';
import UnleashLogoWhite from 'assets/img/logoWithWhiteText.svg?react';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import GridViewOutlinedIcon from '@mui/icons-material/GridViewOutlined';
import FlagOutlinedIcon from '@mui/icons-material/FlagOutlined';
import AutoFixNormalIcon from '@mui/icons-material/AutoFixNormal';
import InsightsIcon from '@mui/icons-material/Insights';
import QueryStatsOutlinedIcon from '@mui/icons-material/QueryStatsOutlined';
import { ChangeRequestIcon } from 'component/common/ChangeRequestIcon/ChangeRequestIcon';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { useUiFlag } from 'hooks/useUiFlag';
import { useLocalStorageState } from 'hooks/useLocalStorageState';
import {
    ConfigureWorkspaceNavigation,
    isConfigureWorkspacePage,
} from './sidebar/ConfigureWorkspaceNavigation.tsx';
import {
    AdminSettingsNavigation,
    isAdminSettingsPage,
} from './sidebar/AdminSettingsNavigation.tsx';
import { HelpAndResourcesMenu } from './sidebar/HelpAndResourcesMenu.tsx';
import { SearchButton } from './sidebar/SearchButton.tsx';
import { SettingsMenu } from './sidebar/SettingsMenu.tsx';
import { SidebarLink } from './sidebar/SidebarLink.tsx';
import { SidebarList } from './sidebar/SidebarList.tsx';
import { SidebarMoreToggle } from './sidebar/SidebarMoreToggle.tsx';
import { SidebarSection } from './sidebar/SidebarSection.tsx';
import { MyProjectsSection } from './projects/MyProjectsSection.tsx';
import { OpenedProjectSection } from './projects/OpenedProjectSection.tsx';

const SIDEBAR_WIDTH = 240;

const StyledRoot = styled('div')(({ theme }) => ({
    display: 'flex',
    minHeight: '100vh',
    backgroundColor: theme.palette.appShell.background,
}));

const StyledSidebar = styled('nav')(({ theme }) => ({
    position: 'sticky',
    top: 0,
    height: '100vh',
    width: SIDEBAR_WIDTH,
    flex: 'none',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: theme.palette.appShell.sidebar,
}));

const StyledSidebarScrollArea = styled('div')(({ theme }) => ({
    flex: 1,
    overflowY: 'auto',
    padding: theme.spacing(1.5),
}));

const StyledSidebarFooter = styled('div')(({ theme }) => ({
    flex: 'none',
    padding: theme.spacing(0, 1.5, 1.5),
}));

const StyledLogoLink = styled(Link)(({ theme }) => ({
    display: 'inline-flex',
    padding: theme.spacing(0.5),
    '& svg': { width: 110, height: 'auto' },
}));

const StyledSearchSlot = styled('div')(({ theme }) => ({
    margin: theme.spacing(1.5, 0, 2),
}));

const StyledContent = styled('main')(({ theme }) => ({
    flex: 1,
    minWidth: 0,
    maxWidth: 1512,
    margin: '0 auto',
    padding: theme.spacing(0, 3, 6),
    [theme.breakpoints.down('md')]: {
        padding: theme.spacing(0, 1.5, 6),
    },
}));

type SidebarMode = 'app' | 'workspace' | 'admin';
type ManualChoice = { mode: SidebarMode; pathname: string };

const getPageMode = (pathname: string): SidebarMode => {
    if (isConfigureWorkspacePage(pathname)) return 'workspace';
    if (isAdminSettingsPage(pathname)) return 'admin';
    return 'app';
};

const Sidebar: FC = () => {
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
        <StyledSidebar aria-label='Main'>
            <StyledSidebarScrollArea ref={panelRef}>
                {mode === 'app' ? <AppNavigation /> : null}
                {mode === 'workspace' ? (
                    <ConfigureWorkspaceNavigation
                        onBack={() => setMode('app')}
                    />
                ) : null}
                {mode === 'admin' ? (
                    <AdminSettingsNavigation onBack={() => setMode('app')} />
                ) : null}
            </StyledSidebarScrollArea>
            <StyledSidebarFooter>
                <SidebarList>
                    <HelpAndResourcesMenu />
                    <SettingsMenu
                        onConfigureWorkspace={() => setMode('workspace')}
                        onAdminSettings={() => setMode('admin')}
                    />
                </SidebarList>
            </StyledSidebarFooter>
        </StyledSidebar>
    );
};

const AppNavigation: FC = () => {
    const { isEnterprise } = useUiConfig();

    return (
        <>
            <StyledLogoLink to='/' aria-label='Unleash'>
                <ThemeMode
                    darkmode={<UnleashLogoWhite aria-label='Unleash logo' />}
                    lightmode={<UnleashLogo aria-label='Unleash logo' />}
                />
            </StyledLogoLink>
            <StyledSearchSlot>
                <SearchButton />
            </StyledSearchSlot>
            <SidebarList>
                <SidebarLink
                    to='/personal'
                    icon={<HomeOutlinedIcon />}
                    label='Home'
                />
                {isEnterprise() ? (
                    <SidebarLink
                        to='/change-requests'
                        icon={<ChangeRequestIcon />}
                        label='Change requests'
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
    const { isOss } = useUiConfig();
    const impactViewsEnabled = useUiFlag('impactViews');
    const [moreState, setMoreState] = useLocalStorageState<'open' | 'closed'>(
        'app-shell:workspace-more',
        'closed',
    );
    const expanded = moreState === 'open';

    return (
        <SidebarSection title='Workspace'>
            <SidebarLink
                to='/projects'
                icon={<GridViewOutlinedIcon />}
                label='Projects'
                end
            />
            <SidebarLink
                to='/search'
                icon={<FlagOutlinedIcon />}
                label='Flags overview'
            />
            {expanded ? (
                <>
                    <SidebarLink
                        to='/playground'
                        icon={<AutoFixNormalIcon />}
                        label='Playground'
                    />
                    {!isOss() ? (
                        <SidebarLink
                            to='/insights'
                            icon={<InsightsIcon />}
                            label='Analytics'
                        />
                    ) : null}
                    {!isOss() && impactViewsEnabled ? (
                        <SidebarLink
                            to='/impact-views'
                            icon={<QueryStatsOutlinedIcon />}
                            label='Impact views'
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

export const AppShell: FC<{ children: ReactNode }> = ({ children }) => (
    <HelpButtonHintProvider>
        <FloatingOnboardingChecklistProvider>
            <EventTimelineProvider>
                <StyledRoot>
                    <Sidebar />
                    <StyledContent>
                        <SkipNavTarget />
                        {children}
                    </StyledContent>
                </StyledRoot>
                <FloatingOnboardingChecklistVisibilityGate />
            </EventTimelineProvider>
        </FloatingOnboardingChecklistProvider>
    </HelpButtonHintProvider>
);
