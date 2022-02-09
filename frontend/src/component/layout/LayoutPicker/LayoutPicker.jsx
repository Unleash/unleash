import ConditionallyRender from '../../common/ConditionallyRender';
import { matchPath } from 'react-router';
import { MainLayout } from '../MainLayout/MainLayout';

const LayoutPicker = ({ children, location }) => {
    const standalonePages = () => {
        const { pathname } = location;
        const isLoginPage = matchPath(pathname, { path: '/login' });
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

        const is404 = matchPath(pathname, { path: '/404' });

        return (
            isLoginPage ||
            isNewUserPage ||
            isChangePasswordPage ||
            isResetPasswordSuccessPage ||
            isForgottenPasswordPage ||
            is404
        );
    };

    return (
        <ConditionallyRender
            condition={standalonePages()}
            show={children}
            elseShow={<MainLayout location={location}>{children}</MainLayout>}
        />
    );
};

export default LayoutPicker;
