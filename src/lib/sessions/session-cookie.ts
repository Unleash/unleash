import type { CookieOptions } from 'express';
import type { IUnleashConfig } from '../types/option.js';

/**
 * used when setting or clearing the session cookie
 */
export const sessionCookieOptions = (
    config: Pick<IUnleashConfig, 'server' | 'secureHeaders'>,
): CookieOptions => ({
    // must match exactly or clearCookie() won't work
    path: config.server.baseUriPath === '' ? '/' : config.server.baseUriPath,
    secure: config.secureHeaders,
    sameSite: 'lax',

    httpOnly: true,
});
