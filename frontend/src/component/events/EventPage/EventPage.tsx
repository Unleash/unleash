import { PermissionGuard } from 'component/common/PermissionGuard/PermissionGuard';
import { EventLog } from 'component/events/EventLog/EventLog';
import { READ_LOGS, ADMIN } from '@server/types/permissions';

export const EventPage = () => (
    <PermissionGuard permissions={[ADMIN, READ_LOGS]}>
        <EventLog title='Event log' />
    </PermissionGuard>
);
