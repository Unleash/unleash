import { useLocation } from 'react-router-dom';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { ApiTokenPage } from 'component/admin/apiToken/ApiTokenPage/ApiTokenPage';
import AdminMenu from '../menu/AdminMenu';

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
