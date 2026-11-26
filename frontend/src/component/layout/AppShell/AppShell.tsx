import { type FC, lazy, type ReactNode, Suspense, useState } from 'react';
import { Drawer, styled, useMediaQuery, useTheme } from '@mui/material';
import { useLocation } from 'react-router';
import { SkipNavTarget } from 'component/common/SkipNavLink/SkipNavTarget';
import { EventTimelineProvider } from 'component/events/EventTimeline/EventTimelineProvider';
import { FloatingOnboardingChecklistProvider } from 'component/onboarding/floatingChecklist/FloatingOnboardingChecklistContext.tsx';
import { FloatingOnboardingChecklistVisibilityGate } from 'component/onboarding/floatingChecklist/FloatingOnboardingChecklistVisibilityGate.tsx';
import { HelpButtonHintProvider } from 'component/menu/Header/HelpResources/HelpButtonHintContext.tsx';
import { CommandBarDialog } from 'component/commandBar/CommandBarDialog';
import { searchDocsTracking } from 'component/menu/Header/SearchDocs/searchDocsTracking';
import { useUiFlag } from 'hooks/useUiFlag';
import { DraftBanner } from 'component/changeRequest/DraftBanner/DraftBanner.tsx';
import { SidebarContent } from './sidebar/SidebarContent.tsx';
import { PageHeaderRow } from './header/PageHeaderRow.tsx';
import { SwitchBackPopup } from './SwitchBackPopup.tsx';

const LazySearchDocsChat = lazy(() =>
    import('component/menu/Header/SearchDocs/SearchDocs.tsx').then(
        (module) => ({ default: module.SearchDocsChat }),
    ),
);

const SIDEBAR_WIDTH = 240;
const DRAWER_WIDTH = 280;

const StyledRoot = styled('div')(({ theme }) => ({
    display: 'flex',
    minHeight: '100vh',
    backgroundColor: theme.palette.appShell.background,
}));

const StyledDesktopSidebar = styled('div')({
    position: 'sticky',
    top: 0,
    height: '100vh',
    width: SIDEBAR_WIDTH,
    flex: 'none',
});

const StyledMainColumn = styled('div')({
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
});

const StyledContent = styled('main')(({ theme }) => ({
    flex: 1,
    width: '100%',
    maxWidth: 1512,
    margin: '0 auto',
    padding: theme.spacing(0, 3, 6),
    // Pages use high z-indexes (e.g. theme.zIndex.sticky) for sticky headers.
    // Isolating the <main> element into its own stacking context keeps those
    // z-indexes inside the page content, so modals and drawers rendered at the
    // end of the body still paint above the sticky headers.
    isolation: 'isolate',
    [theme.breakpoints.down('md')]: {
        padding: theme.spacing(0, 2, 6),
    },
}));

export const AppShell: FC<{ children: ReactNode }> = ({ children }) => {
    const theme = useTheme();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('lg'));
    const searchDocsWidget = useUiFlag('searchDocsWidget');
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchDocsOpen, setSearchDocsOpen] = useState(false);
    // Keyed to the location key, which changes on every navigation (even to
    // the current page), so following any link closes the drawer while
    // switching sidebar mode from the Settings menu keeps it open.
    const { key: locationKey } = useLocation();
    const [drawerOpenAt, setDrawerOpenAt] = useState<string | null>(null);
    const drawerOpen = drawerOpenAt === locationKey;

    const sidebar = (
        <SidebarContent
            layout={isSmallScreen ? 'drawer' : 'docked'}
            searchOpen={searchOpen}
            onSearch={() => setSearchOpen(true)}
            onSearchDocs={
                searchDocsWidget ? () => setSearchDocsOpen(true) : undefined
            }
        />
    );

    return (
        <HelpButtonHintProvider>
            <FloatingOnboardingChecklistProvider>
                <EventTimelineProvider>
                    <StyledRoot>
                        {isSmallScreen ? (
                            <Drawer
                                open={drawerOpen}
                                onClose={() => setDrawerOpenAt(null)}
                                slotProps={{
                                    paper: {
                                        sx: {
                                            width: DRAWER_WIDTH,
                                            // dvh keeps the sidebar footer above
                                            // the browser bars on iOS Safari.
                                            height: '100dvh',
                                        },
                                    },
                                }}
                            >
                                {sidebar}
                            </Drawer>
                        ) : (
                            <StyledDesktopSidebar>
                                {sidebar}
                            </StyledDesktopSidebar>
                        )}
                        <StyledMainColumn>
                            <DraftBanner />
                            <StyledContent>
                                <SkipNavTarget />
                                <PageHeaderRow
                                    onOpenNavigation={
                                        isSmallScreen
                                            ? () => setDrawerOpenAt(locationKey)
                                            : undefined
                                    }
                                />
                                {children}
                            </StyledContent>
                        </StyledMainColumn>
                    </StyledRoot>
                    <FloatingOnboardingChecklistVisibilityGate />
                    <SwitchBackPopup />
                    <CommandBarDialog
                        open={searchOpen}
                        onOpenChange={setSearchOpen}
                        inputAction='close'
                    />
                    {searchDocsWidget ? (
                        <Suspense fallback={null}>
                            <LazySearchDocsChat
                                open={searchDocsOpen}
                                onOpenChange={setSearchDocsOpen}
                                tracking={searchDocsTracking('help-menu')}
                            />
                        </Suspense>
                    ) : null}
                </EventTimelineProvider>
            </FloatingOnboardingChecklistProvider>
        </HelpButtonHintProvider>
    );
};
