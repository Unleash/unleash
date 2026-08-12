import type { IToggle } from '@unleash/proxy-client-react';
import type { UnleashClient } from 'unleash-proxy-client';

export type TestUnleashClient = UnleashClient & {
    setFlags: (next: IToggle[]) => void;
};

/**
 * A minimal stand-in for the real Unleash client, for tests that control which
 * flags exist: pass it to `<FlagProvider unleashClient={...} startClient={false}>`
 * and change flags mid-test with `setFlags`, which notifies `update` listeners
 * the way a real refresh does.
 */
export const testUnleashClient = (
    initial: IToggle[] = [],
): TestUnleashClient => {
    let flags = initial;
    const listeners = new Map<string, Set<() => void>>();
    const client = {
        getAllToggles: () => flags,
        // FlagProvider stops the client on unmount.
        stop: () => {},
        on: (event: string, listener: () => void) => {
            const set = listeners.get(event) ?? new Set();
            set.add(listener);
            listeners.set(event, set);
            return client;
        },
        off: (event: string, listener: () => void) => {
            listeners.get(event)?.delete(listener);
            return client;
        },
        setFlags: (next: IToggle[]) => {
            flags = next;
            for (const listener of listeners.get('update') ?? []) {
                listener();
            }
        },
    };
    return client as unknown as TestUnleashClient;
};
