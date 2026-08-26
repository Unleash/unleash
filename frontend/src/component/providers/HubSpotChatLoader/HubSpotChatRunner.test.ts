import { describe, expect, it } from 'vitest';
import { buildIdentity } from './HubSpotChatRunner.tsx';

describe('buildIdentity', () => {
    it('ships exactly the fields we send to HubSpot', () => {
        const identity = buildIdentity({
            email: 'user@example.com',
            userId: 42,
            userName: 'Ada Lovelace',
            instanceId: 'instance-abc',
            billing: 'pay-as-you-go',
            trialExpiry: '2026-01-01',
        });

        expect(identity).toStrictEqual({
            id: 'instance-abc:42',
            name: 'Ada Lovelace',
            email: 'user@example.com',
            unleash_unverified_email: 'user@example.com',
            unleash_instance_id: 'instance-abc',
            unleash_instance_url: window.location.origin,
            unleash_billing: 'pay-as-you-go',
            unleash_trial_expiry: '2026-01-01',
        });
    });

    it('falls back to "unknown" instance id when missing', () => {
        const identity = buildIdentity({
            email: 'user@example.com',
            userId: 42,
        });

        expect(identity.id).toBe('unknown:42');
    });
});
