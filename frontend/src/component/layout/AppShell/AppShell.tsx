import type { FC, ReactNode } from 'react';
import { styled } from '@mui/material';
import { Link } from 'react-router';
import { ThemeMode } from 'component/common/ThemeMode/ThemeMode';
import { SkipNavTarget } from 'component/common/SkipNavLink/SkipNavTarget';
import { EventTimelineProvider } from 'component/events/EventTimeline/EventTimelineProvider';
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
import { SearchButton } from './sidebar/SearchButton.tsx';
import { SidebarLink } from './sidebar/SidebarLink.tsx';
import { SidebarList } from './sidebar/SidebarList.tsx';
import { SidebarMoreToggle } from './sidebar/SidebarMoreToggle.tsx';
import { SidebarSection } from './sidebar/SidebarSection.tsx';

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
    padding: theme.spacing(1.5),
    backgroundColor: theme.palette.appShell.sidebar,
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

const Sidebar: FC = () => {
    const { isEnterprise } = useUiConfig();

    return (
        <StyledSidebar aria-label='Main'>
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
        </StyledSidebar>
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
    <EventTimelineProvider>
        <StyledRoot>
            <Sidebar />
            <StyledContent>
                <SkipNavTarget />
                {children}
            </StyledContent>
        </StyledRoot>
    </EventTimelineProvider>
);
