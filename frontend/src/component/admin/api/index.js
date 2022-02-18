import { ApiTokenList } from '../api-token/ApiTokenList/ApiTokenList';
import AdminMenu from '../menu/AdminMenu';
import ConditionallyRender from '../../common/ConditionallyRender';
import AccessContext from '../../../contexts/AccessContext';
import { useContext } from 'react';

const ApiPage = () => {
    const { isAdmin } = useContext(AccessContext);

    return (
        <div>
            <ConditionallyRender condition={isAdmin} show={<AdminMenu />} />
            <ApiTokenList />
        </div>
    );
};

export default ApiPage;
