import AdminMenu from '../menu/AdminMenu';
import { InstanceStats } from './InstanceStats/InstanceStats';

export const InstanceAdmin = () => {
    return (
        <div>
            <AdminMenu />
            <InstanceStats />
        </div>
    );
};
