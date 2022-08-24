import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { matchPath } from 'react-router';
import { useLocation } from 'react-router-dom';
import { MainLayout } from '../MainLayout/MainLayout';
import { ReactNode } from 'react';

interface ILayoutPickerProps {
    children: ReactNode;
}

export const LayoutPicker = ({ children }: ILayoutPickerProps) => {
    const { pathname } = useLocation();

    return (
        <ConditionallyRender
            condition={isStandalonePage(pathname)}
            show={children}
            elseShow={<MainLayout>{children}</MainLayout>}
        />
    );
};

const isStandalonePage = (pathname: string): boolean => {
    return standalonePagePatterns.some(pattern => {
        return matchPath(pattern, pathname);
    });
};

const standalonePagePatterns = [
    '/login',
    '/new-user',
    '/reset-password',
    '/reset-password-success',
    '/forgotten-password',
    '/splash/:splashId',
    '/404',
];
