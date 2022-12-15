import InstanceMetricsChart from './TrafficMetricsChart';
import AdminMenu from '../menu/AdminMenu';

export const Traffic = () => {
    return (
        <div>
            <AdminMenu />
            <InstanceMetricsChart />
        </div>
    );
};
