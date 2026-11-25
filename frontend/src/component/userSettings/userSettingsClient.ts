import { NOT_FOUND } from 'constants/statusCodes';
import type { UserSettingsSchema } from 'openapi';
import { headers } from 'utils/apiUtils';
import { formatApiPath } from 'utils/formatPath';

export type UserSettings = UserSettingsSchema['settings'];

export type LoadSettingsResult =
    | { status: 'loaded'; settings: UserSettings }
    | { status: 'failed' }
    | { status: 'off' };

export type SaveSettingsResult = 'saved' | 'failed';

export const LOAD_TIMEOUT_MS = 5_000;

export const RETRY_DELAY_MS = 500;

const USER_SETTINGS_PATH = 'api/admin/user/settings';

type LoadAttemptResult =
    | Exclude<LoadSettingsResult, { status: 'failed' }>
    | { status: 'failed'; reason: 'transient' | 'rejected' };

const isRetryableStatus = (status: number) => status >= 500;

const requestSettings = async (
    signal: AbortSignal,
): Promise<LoadAttemptResult> => {
    try {
        const response = await fetch(formatApiPath(USER_SETTINGS_PATH), {
            headers,
            credentials: 'include',
            signal,
        });
        if (response.status === NOT_FOUND) {
            return { status: 'off' };
        }
        if (!response.ok) {
            return {
                status: 'failed',
                reason: isRetryableStatus(response.status)
                    ? 'transient'
                    : 'rejected',
            };
        }
        const { settings }: UserSettingsSchema = await response.json();
        return { status: 'loaded', settings };
    } catch {
        return { status: 'failed', reason: 'transient' };
    }
};

const loadOnce = async (): Promise<LoadAttemptResult> => {
    const controller = new AbortController();
    let timeout: ReturnType<typeof setTimeout> | undefined;
    const timedOut = new Promise<LoadAttemptResult>((resolve) => {
        timeout = setTimeout(() => {
            controller.abort();
            resolve({ status: 'failed', reason: 'transient' });
        }, LOAD_TIMEOUT_MS);
    });
    try {
        return await Promise.race([
            requestSettings(controller.signal),
            timedOut,
        ]);
    } finally {
        clearTimeout(timeout);
    }
};

const wait = (ms: number) =>
    new Promise<void>((resolve) => setTimeout(resolve, ms));

const toLoadSettingsResult = (
    attempt: LoadAttemptResult,
): LoadSettingsResult =>
    attempt.status === 'failed' ? { status: 'failed' } : attempt;

export const loadSettings = async (): Promise<LoadSettingsResult> => {
    const firstAttempt = await loadOnce();
    if (
        firstAttempt.status !== 'failed' ||
        firstAttempt.reason === 'rejected'
    ) {
        return toLoadSettingsResult(firstAttempt);
    }
    await wait(RETRY_DELAY_MS);
    return toLoadSettingsResult(await loadOnce());
};

export const saveSettings = async (
    changes: UserSettings,
): Promise<SaveSettingsResult> => {
    try {
        const response = await fetch(formatApiPath(USER_SETTINGS_PATH), {
            method: 'PUT',
            headers,
            credentials: 'include',
            // Saves are sent as values change, also right before the user
            // leaves the page; keepalive lets the request outlive the page.
            keepalive: true,
            body: JSON.stringify({ settings: changes }),
        });
        return response.ok ? 'saved' : 'failed';
    } catch {
        return 'failed';
    }
};
