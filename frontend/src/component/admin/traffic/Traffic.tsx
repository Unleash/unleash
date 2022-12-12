import InstanceMetricsChart from '../instance-admin/InstanceMetrics/InstanceMetricsChart'; // TODO move this to traffic folder (pending conversation on how to organize this)
import AdminMenu from '../menu/AdminMenu';

export const Traffic = () => {
    return (
        <div>
            <AdminMenu />
            <InstanceMetricsChart />
        </div>
    );
};
