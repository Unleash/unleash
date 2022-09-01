import { Response } from 'express';
import { IUnleashConfig } from '../types/option';
import Controller from './controller';
import { IAuthRequest } from './unleash-types';

class LogoutController extends Controller {
    private clearSiteDataOnLogout: boolean;

    private cookieName: string;

    private baseUri: string;

    constructor(config: IUnleashConfig) {
        super(config);
        this.baseUri = config.server.baseUriPath;
        this.clearSiteDataOnLogout = config.session.clearSiteDataOnLogout;
        this.cookieName = config.session.cookieName;
        this.get('/', this.logout);
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
            if (req.logout.length === 0) {
                // passport < 0.6.0
                req.logout();
                this.afterLogout(req, res);
            } else {
                // for passport >= 0.6.0, try to call with a callback function
                req.logout((err) => {
                    if (err) {
                        throw err;
                    }
                    this.afterLogout(req, res);
                });
            }
        }
    }

    private afterLogout(req: IAuthRequest, res: Response) {
        if (req.session) {
            req.session = null;
        }
        res.clearCookie(this.cookieName);
        if (this.clearSiteDataOnLogout) {
            res.set('Clear-Site-Data', '"cookies", "storage"');
        }

        res.redirect(`${this.baseUri}/`);
    }
}

export default LogoutController;
