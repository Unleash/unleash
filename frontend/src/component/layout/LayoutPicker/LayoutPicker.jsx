import ConditionallyRender from '../../common/ConditionallyRender';
import MainLayout from '../MainLayout/MainLayout';

const LayoutPicker = ({ children, location }) => {
    const isLoginPage = location.pathname.includes('login');

    return (
        <ConditionallyRender
            condition={isLoginPage}
            show={children}
            elseShow={<MainLayout location={location}>{children}</MainLayout>}
        />
    );
};

export default LayoutPicker;
