import { SYSTEM_USER_AUDIT, TEST_AUDIT_USER } from '../types/core.js';
import { BaseEvent } from '../types/events.js';
import { FEATURE_CREATED } from '../events/index.js';
import { auditEventFields } from './audit-event-fields.js';
import { extractAuditInfoFromUser } from './extract-user.js';
import { extractAuditInfo } from '../middleware/audit-middleware.js';

/**
 * [EG-4693] "user-initiated" events carry a user-agent, nothing else does.
 */

const requestAudit = extractAuditInfo(
    {
        ip: '127.0.0.1',
        user: { id: 1, email: 'someone@example.com' },
        get: (name: string) =>
            name.toLowerCase() === 'user-agent' ? 'curl/8.4.0' : undefined,
    } as any,
    // capture is what `auditAccessMiddleware` resolves from the flag per request
    { captureUserAgent: true },
);

describe('user-agent on audit events', () => {
    describe('only a request can put a user-agent on an audit event', () => {
        test('should set a userAgent on the request-derived audit context', () => {
            expect(requestAudit.userAgent).toBe('curl/8.4.0');
            expect(new BaseEvent(FEATURE_CREATED, requestAudit).userAgent).toBe(
                'curl/8.4.0',
            );
        });

        // four entry points for audit events that are NOT user-initiated
        test.each([
            ['the system-audit user', SYSTEM_USER_AUDIT],
            ['the test audit user', TEST_AUDIT_USER],
            [
                'an audit context built from a user with no request',
                extractAuditInfoFromUser({ id: 1, email: 'a@b.com' } as any),
            ],
        ])('should carry no user-agent when %s', (_label, auditUser) => {
            expect(auditUser.userAgent).toBeUndefined();
            expect(new BaseEvent(FEATURE_CREATED, auditUser).userAgent).toBe(
                undefined,
            );
            expect(auditEventFields(auditUser).userAgent).toBeUndefined();
        });

        test('should have no user-agent key when created by a system audit user', () => {
            expect(SYSTEM_USER_AUDIT).not.toHaveProperty('userAgent');
        });

        test('should pass an empty-string user-agent through unchanged', () => {
            const blank = { ...requestAudit, userAgent: '' };

            expect(new BaseEvent(FEATURE_CREATED, blank).userAgent).toBe('');

            expect(
                new BaseEvent(FEATURE_CREATED, SYSTEM_USER_AUDIT).userAgent,
            ).toBe(undefined);
        });
    });

    describe('no audit context invents request metadata', () => {
        test('should not invent an IP for a user with no request behind them', () => {
            expect(
                extractAuditInfoFromUser({ id: 1, email: 'a@b.com' } as any).ip,
            ).toBe('127.0.0.1');
        });

        test('should keep an IP that the caller actually knows', () => {
            expect(
                extractAuditInfoFromUser(
                    { id: 1, email: 'a@b.com' } as any,
                    '10.0.0.4',
                ).ip,
            ).toBe('10.0.0.4');
        });
    });
});
