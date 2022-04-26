import AdminMenu from '../menu/AdminMenu';
import ConditionallyRender from 'component/common/ConditionallyRender';
import { ApiTokenPage } from 'component/admin/apiToken/ApiTokenPage/ApiTokenPage';
import { useLocation } from 'react-router-dom';

const ApiPage = () => {
    const { pathname } = useLocation();
    const showAdminMenu = pathname.includes('/admin/');

    return (
        <div>
            <ConditionallyRender
                condition={showAdminMenu}
                show={<AdminMenu />}
            />
            <ApiTokenPage />
        </div>
    );
};

export default ApiPage;
