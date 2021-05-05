import ConditionallyRender from '../../common/ConditionallyRender';
import MainLayout from '../MainLayout';

const LayoutPicker = ({ children, location }) => {
    const standalonePages = () => {
        const isLoginPage = location.pathname.includes('login');
        const isNewUserPage = location.pathname.includes('new-user');
        const isChangePasswordPage = location.pathname.includes(
            'reset-password'
        );
        const isResetPasswordSuccessPage = location.pathname.includes(
            'reset-password-success'
        );
        const isForgottenPasswordPage = location.pathname.includes(
            'forgotten-password'
        );
        const is404 = location.pathname.includes('404');

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
