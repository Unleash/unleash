import ConditionallyRender from 'component/common/ConditionallyRender';
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
    const isLoginPage = matchPath(pathname, {
        path: '/login',
    });

    const isNewUserPage = matchPath(pathname, {
        path: '/new-user',
    });

    const isChangePasswordPage = matchPath(pathname, {
        path: '/reset-password',
    });

    const isResetPasswordSuccessPage = matchPath(pathname, {
        path: '/reset-password-success',
    });

    const isForgottenPasswordPage = matchPath(pathname, {
        path: '/forgotten-password',
    });

    const isSplashPage = matchPath(pathname, {
        path: '/splash/:id',
    });

    const is404 = matchPath(pathname, {
        path: '/404',
    });

    return Boolean(
        isLoginPage ||
            isNewUserPage ||
            isChangePasswordPage ||
            isResetPasswordSuccessPage ||
            isForgottenPasswordPage ||
            isSplashPage ||
            is404
    );
};
