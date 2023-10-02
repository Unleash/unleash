import { ADMIN } from 'component/providers/AccessProvider/permissions';
import { PermissionGuard } from 'component/common/PermissionGuard/PermissionGuard';
import { EventLog } from 'component/events/EventLog/EventLog';

export const EventPage = () => (
    <PermissionGuard permissions={ADMIN}>
        <EventLog title="Event log" />
    </PermissionGuard>
);
