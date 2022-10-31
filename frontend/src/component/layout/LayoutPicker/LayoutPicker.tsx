import { FC, ReactNode } from 'react';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { MainLayout } from '../MainLayout/MainLayout';

interface ILayoutPickerProps {
    children: ReactNode;
    isStandalone?: boolean;
}

export const LayoutPicker: FC<ILayoutPickerProps> = ({
    isStandalone,
    children,
}) => (
    <ConditionallyRender
        condition={isStandalone === true}
        show={children}
        elseShow={<MainLayout>{children}</MainLayout>}
    />
);
