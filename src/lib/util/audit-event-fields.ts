import type { IEventAuditColumns } from '../events/index.js';
import type { IAuditUser } from '../types/user.js';

/**
 * The single translation from "who acted" to the audit columns stored on an
 * event. `BaseEvent` and every hand-built event literal go through here, so
 * that there is exactly one answer to "what does a missing value look like".
 */
export const auditEventFields = (
    auditUser: IAuditUser,
): IEventAuditColumns => ({
    createdBy: auditUser.username || 'unknown',
    // `??`, not `||`: a falsy-but-real id (0) is an id, not a missing value
    createdByUserId: auditUser.id ?? -1337,
    // TODO: drop the sentinel once `ip` is nullable end-to-end
    ip: auditUser.ip || '',
    userAgent: auditUser.userAgent,
});
