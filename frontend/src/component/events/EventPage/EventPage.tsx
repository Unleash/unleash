import { ADMIN } from '@server/types/permissions';
import { PermissionGuard } from 'component/common/PermissionGuard/PermissionGuard';
import { EventLog } from 'component/events/EventLog/EventLog';

export const EventPage = () => (
    <PermissionGuard permissions={ADMIN}>
        <EventLog title='Event log' />
    </PermissionGuard>
);
