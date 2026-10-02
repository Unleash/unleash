import type { Response } from 'express';
import { promisify } from 'util';
import { type IUnleashConfig, NONE } from '../types/index.js';
import { sessionCookieOptions } from '../sessions/session-cookie.js';
import Controller from './controller.js';
import type { IAuthRequest } from './unleash-types.js';
import type { IUnleashServices } from '../services/index.js';
import type SessionService from '../services/session-service.js';

class LogoutController extends Controller {
    private clearSiteDataOnLogout: boolean;

    private cookieName: string;

    private cookiePath: string;

    private baseUri: string;

    private sessionService: SessionService;

    constructor(
        config: IUnleashConfig,
        { sessionService }: Pick<IUnleashServices, 'sessionService'>,
    ) {
        super(config);
        this.sessionService = sessionService;
        this.baseUri = config.server.baseUriPath;
        this.clearSiteDataOnLogout = config.session.clearSiteDataOnLogout;
        this.cookieName = config.session.cookieName;
        // the path has to match the one the cookie was set with, or clearing it
        // is a no-op wherever `BASE_URI_PATH` is set.
        this.cookiePath = sessionCookieOptions(config).path as string;

        this.route({
            method: 'post',
            path: '/',
            handler: this.logout,
            permission: NONE,
            acceptAnyContentType: true,
        });
    }

    async logout(req: IAuthRequest, res: Response): Promise<void> {
        if (req.session) {
            // Allow SSO to register custom logout logic.
            if (req.session.logoutUrl) {
                res.redirect(req.session.logoutUrl);
                return;
            }
        }

        if (req.logout) {
            if (this.isReqLogoutWithoutCallback(req.logout)) {
                // passport < 0.6.0
                req.logout();
            } else {
                // for passport >= 0.6.0, a callback function is expected as first argument.
                // to reuse controller error handling, function is turned into a promise
                const logoutAsyncFn = promisify(req.logout).bind(req);
                await logoutAsyncFn();
            }
        }

        if (req.session) {
            if (req.session.user?.id) {
                await this.sessionService.deleteSessionsForUser(
                    req.session.user.id,
                );
            }
            req.session.destroy();
        }
        res.clearCookie(this.cookieName, { path: this.cookiePath });

        if (this.clearSiteDataOnLogout) {
            res.set('Clear-Site-Data', '"cookies", "storage"');
        }
        if (req.user?.id) {
            await this.sessionService.deleteSessionsForUser(req.user.id);
        }
        res.redirect(`${this.baseUri}/signed-out`);
    }

    private isReqLogoutWithoutCallback(
        logout: IAuthRequest['logout'],
    ): logout is () => void {
        return logout.length === 0;
    }
}

export default LogoutController;
