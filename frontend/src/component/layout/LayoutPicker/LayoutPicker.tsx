import type { FC, ReactNode } from 'react';
import { useUiFlag } from 'hooks/useUiFlag';
import { MainLayout } from '../MainLayout/MainLayout.tsx';
import { AppShell } from '../AppShell/AppShell.tsx';
import { RecentlyVisitedRecorder } from 'component/commandBar/RecentlyVisitedRecorder';

interface ILayoutPickerProps {
    children: ReactNode;
    isStandalone?: boolean;
}

export const LayoutPicker: FC<ILayoutPickerProps> = ({
    isStandalone,
    children,
}) => {
    const improvedSidebarNavigation = useUiFlag('improvedSidebarNavigation');

    if (isStandalone === true) {
        return children;
    }
    return (
        <>
            <RecentlyVisitedRecorder />
            {improvedSidebarNavigation ? (
                <AppShell>{children}</AppShell>
            ) : (
                <MainLayout>{children}</MainLayout>
            )}
        </>
    );
};
