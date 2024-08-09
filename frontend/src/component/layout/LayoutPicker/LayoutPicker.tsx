import type { FC, ReactNode } from 'react';
import { MainLayout } from '../MainLayout/MainLayout';

interface ILayoutPickerProps {
    children: ReactNode;
    isStandalone?: boolean;
}

export const LayoutPicker: FC<ILayoutPickerProps> = ({
    isStandalone,
    children,
}) => (isStandalone === true ? children : <MainLayout>{children}</MainLayout>);
