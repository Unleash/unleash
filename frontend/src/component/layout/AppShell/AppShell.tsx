import { type FC, lazy, type ReactNode, Suspense, useState } from 'react';
import { styled } from '@mui/material';
import { SkipNavTarget } from 'component/common/SkipNavLink/SkipNavTarget';
import { EventTimelineProvider } from 'component/events/EventTimeline/EventTimelineProvider';
import { FloatingOnboardingChecklistProvider } from 'component/onboarding/floatingChecklist/FloatingOnboardingChecklistContext.tsx';
import { FloatingOnboardingChecklistVisibilityGate } from 'component/onboarding/floatingChecklist/FloatingOnboardingChecklistVisibilityGate.tsx';
import { HelpButtonHintProvider } from 'component/menu/Header/HelpResources/HelpButtonHintContext.tsx';
import { CommandBarDialog } from 'component/commandBar/CommandBarDialog';
import { searchDocsTracking } from 'component/menu/Header/SearchDocs/searchDocsTracking';
import { useUiFlag } from 'hooks/useUiFlag';
import { SidebarContent } from './sidebar/SidebarContent.tsx';
import { PageHeaderRow } from './header/PageHeaderRow.tsx';

const LazySearchDocsChat = lazy(() =>
    import('component/menu/Header/SearchDocs/SearchDocs.tsx').then(
        (module) => ({ default: module.SearchDocsChat }),
    ),
);

const SIDEBAR_WIDTH = 240;

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

export const AppShell: FC<{ children: ReactNode }> = ({ children }) => {
    const searchDocsWidget = useUiFlag('searchDocsWidget');
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchDocsOpen, setSearchDocsOpen] = useState(false);

    return (
        <HelpButtonHintProvider>
            <FloatingOnboardingChecklistProvider>
                <EventTimelineProvider>
                    <StyledRoot>
                        <StyledDesktopSidebar>
                            <SidebarContent
                                searchOpen={searchOpen}
                                onSearch={() => setSearchOpen(true)}
                                onSearchDocs={
                                    searchDocsWidget
                                        ? () => setSearchDocsOpen(true)
                                        : undefined
                                }
                            />
                        </StyledDesktopSidebar>
                        <StyledContent>
                            <SkipNavTarget />
                            <PageHeaderRow />
                            {children}
                        </StyledContent>
                    </StyledRoot>
                    <FloatingOnboardingChecklistVisibilityGate />
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
