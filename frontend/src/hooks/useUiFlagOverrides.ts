import { useEffect, useSyncExternalStore } from 'react';
import type { IVariant, UnleashClient } from 'unleash-proxy-client';
import type { UiFlags } from 'interfaces/uiConfig';
import { IS_DEV } from 'constants/env';

// feature_enabled is the parent feature's state, which is not the same as the
// variant's own `enabled` (see flag-resolver.ts getAll). The server may send it
// on the variant; default it to true, since a variant only arrives for a flag
// that resolved to one.
const variantOf = (value: UiFlags[keyof UiFlags]): IVariant =>
    value && typeof value === 'object'
        ? { feature_enabled: true, ...value }
        : { name: 'disabled', enabled: false, feature_enabled: Boolean(value) };

// The toolbar only calls getContext/updateContext/isEnabled/getVariant/on on the
// client it wraps, so this reads uiConfig.flags directly instead of standing up
// an UnleashClient. Context editing in the panel is inert: these flags are
// resolved server-side, so there is no client-side context to re-evaluate.
export const createFlagSource = (getFlags: () => UiFlags) =>
    ({
        getContext: () => ({}),
        updateContext: () => Promise.resolve(),
        isEnabled: (name: string) => {
            const value = getFlags()[name as keyof UiFlags];
            return typeof value === 'object'
                ? Boolean(value?.enabled)
                : Boolean(value);
        },
        getVariant: (name: string) =>
            variantOf(getFlags()[name as keyof UiFlags]),
        on() {
            return this;
        },
    }) as unknown as UnleashClient;

/**
 * Layer toolbar overrides onto a server flag value.
 *
 * The server value decides the shape: a variant-valued flag keeps returning a
 * variant even when it is disabled, matching what callers get without the
 * toolbar. The wrapper returns a plain boolean for `flag`-type overrides, so
 * the result is passed through as-is.
 */
export const applyOverrides = (
    serverValue: unknown,
    flag: string,
    overrides: UnleashClient | undefined,
): unknown => {
    if (!overrides) return serverValue || false;

    if (serverValue && typeof serverValue === 'object') {
        return overrides.getVariant(flag) || false;
    }

    return overrides.isEnabled(flag) || false;
};

export const changesFlagValues = (event: { type: string }) =>
    event.type !== 'sdk_updated';

const listeners = new Set<() => void>();
let version = 0;
let flags: UiFlags = {} as UiFlags;
let client: UnleashClient | undefined;
let initialized = false;

const notify = () => {
    version += 1;
    for (const listener of listeners) {
        listener();
    }
};

const subscribe = (listener: () => void) => {
    listeners.add(listener);
    return () => {
        listeners.delete(listener);
    };
};

const initToolbar = async () => {
    const { ToolbarStateManager, UnleashToolbar, wrapUnleashClient } =
        await import('@unleash/toolbar');
    await import('@unleash/toolbar/toolbar.css');

    const manager = new ToolbarStateManager('local', undefined, true);
    const wrapped = wrapUnleashClient(
        createFlagSource(() => flags),
        manager,
    );
    manager.subscribe((event) => {
        if (changesFlagValues(event)) {
            notify();
        }
    });
    client = wrapped;

    new UnleashToolbar(manager, wrapped, {
        banner: 'Overrides apply to useUiFlag consumers and nav routing. A few components read uiConfig.flags directly and are unaffected.',
        focusOnOpen: 'search',
    });

    notify();
};

const noop = () => {};

const startToolbar = () => {
    if (initialized) return;

    initialized = true;

    initToolbar().catch((error) => {
        // Reset so a remount retries, rather than wedging on one failed import.
        initialized = false;
        console.error('Failed to initialise the Unleash toolbar', error);
    });
};

export const useUiFlagOverrides = (flagsFromConfig: UiFlags) => {
    useSyncExternalStore(
        subscribe,
        () => version,
        () => version,
    );

    // The flag source reads this on evaluation, so it has to be current before
    // the effect below runs.
    if (IS_DEV) {
        flags = flagsFromConfig;
    }

    // The branch sits outside the effect callback so that a production build
    // folds it to `noop` and drops initToolbar, and with it the dynamic imports.
    useEffect(IS_DEV ? startToolbar : noop, []);

    return IS_DEV ? client : undefined;
};
