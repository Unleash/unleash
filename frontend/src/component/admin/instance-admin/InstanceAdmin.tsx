import AdminMenu from '../menu/AdminMenu';
import { InstanceStats } from './InstanceStats/InstanceStats';
import InstanceMetricsChart from './InstanceMetrics/InstanceMetricsChart';

export const InstanceAdmin = () => {
    return (
        <div>
            <AdminMenu />
            <InstanceStats />
            <InstanceMetricsChart />
        </div>
    );
};
