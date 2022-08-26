import { GroupsList } from './GroupsList/GroupsList';
import AdminMenu from '../menu/AdminMenu';

export const GroupsAdmin = () => {
    return (
        <div>
            <AdminMenu />
            <GroupsList />
        </div>
    );
};
