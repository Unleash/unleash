import type { FC, ReactNode } from 'react';
import { useNewNavigation } from 'hooks/useNewNavigation';
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
    const newNavigation = useNewNavigation().navigation === 'new';

    if (isStandalone === true) {
        return children;
    }
    return (
        <>
            <RecentlyVisitedRecorder />
            {newNavigation ? (
                <AppShell>{children}</AppShell>
            ) : (
                <MainLayout>{children}</MainLayout>
            )}
        </>
    );
};
