'use strict';

const Controller = require('../controller');

class UserController extends Controller {
    constructor(config, services) {
        super(config);

        this.accessService = services.accessService;

        this.get('/', this.getUser);
        this.get('/permissions', this.getUserPermissions);
        this.get('/logout', this.logout);
    }

    getUser(req, res) {
        if (req.user) {
            const user = { ...req.user };
            if (!this.config.extendedPermissions) {
                delete user.permissions;
            } else if (!Array.isArray(user.permissions)) {
                user.permissions = [];
            }
            return res
                .status(200)
                .json(user)
                .end();
        }
        return res.status(404).end();
    }

    async getUserPermissions(req, res) {
        if (req.user) {
            const user = { ...req.user };
            const permissions = await this.accessService.getPermissionsForUser(
                user,
            );

            return res
                .status(200)
                .json(permissions)
                .end();
        }
        return res.status(404).end();
    }

    // Deprecated, use "/logout" instead.  Will be removed in v4.
    logout(req, res) {
        if (req.session) {
            req.session = null;
        }
        if (req.logout) {
            req.logout();
        }
        res.redirect(`${this.config.baseUriPath}/`);
    }
}

module.exports = UserController;
