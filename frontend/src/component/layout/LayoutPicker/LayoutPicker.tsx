import type { FC, ReactNode } from 'react';
import { useUiFlag } from 'hooks/useUiFlag';
import { MainLayout } from '../MainLayout/MainLayout.tsx';
import { AppShell } from '../AppShell/AppShell.tsx';

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
    if (improvedSidebarNavigation) {
        return <AppShell>{children}</AppShell>;
    }
    return <MainLayout>{children}</MainLayout>;
};
