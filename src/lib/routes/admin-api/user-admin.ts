import Controller from '../controller';
import { ADMIN } from '../../permissions';
import UserService from '../../services/user-service';
import { AccessService } from '../../services/access-service';
import { Logger } from '../../logger';
import { handleErrors } from './util';
import { IUnleashConfig } from '../../types/option';
import { EmailService, MAIL_ACCEPTED } from '../../services/email-service';
import ResetTokenService from '../../services/reset-token-service';

const getCreatorUsernameOrPassword = req => req.user.username || req.user.email;

export default class UserAdminController extends Controller {
    private userService: UserService;

    private accessService: AccessService;

    private readonly logger: Logger;

    private emailService: EmailService;

    private resetTokenService: ResetTokenService;

    constructor(
        config: IUnleashConfig,
        { userService, accessService, emailService, resetTokenService },
    ) {
        super(config);
        this.userService = userService;
        this.accessService = accessService;
        this.logger = config.getLogger('routes/user-controller.ts');
        this.emailService = emailService;
        this.resetTokenService = resetTokenService;

        this.get('/', this.getUsers, ADMIN);
        this.get('/search', this.search);
        this.post('/', this.createUser, ADMIN);
        this.post('/validate-password', this.validatePassword);
        this.put('/:id', this.updateUser, ADMIN);
        this.post('/:id/change-password', this.changePassword, ADMIN);
        this.delete('/:id', this.deleteUser, ADMIN);
        this.post('/reset-password', this.resetPassword);
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    async resetPassword(req, res): Promise<void> {
        try {
            const requester = getCreatorUsernameOrPassword(req);
            const receiver = req.body.id;
            const resetPasswordUrl = await this.userService.createResetPasswordEmail(
                receiver,
                requester,
            );
            res.json({ resetPasswordUrl });
        } catch (e) {
            handleErrors(res, this.logger, e);
        }
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    async getUsers(req, res): Promise<void> {
        try {
            const users = await this.userService.getAll();
            const rootRoles = await this.accessService.getRootRoles();
            const inviteLinks = await this.resetTokenService.getActiveInvitations();

            const usersWithInviteLinks = users.map(user => {
                const inviteLink = inviteLinks[user.id] || '';
                return { ...user, inviteLink };
            });

            res.json({ users: usersWithInviteLinks, rootRoles });
        } catch (error) {
            this.logger.error(error);
            res.status(500).send({ msg: 'server errors' });
        }
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    async search(req, res): Promise<void> {
        const { q } = req.query;
        try {
            const users =
                q && q.length > 1 ? await this.userService.search(q) : [];
            res.json(users);
        } catch (error) {
            this.logger.error(error);
            res.status(500).send({ msg: 'server errors' });
        }
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    async createUser(req, res): Promise<void> {
        const { username, email, name, rootRole } = req.body;
        const { user } = req;

        try {
            const createdUser = await this.userService.createUser({
                username,
                email,
                name,
                rootRole: Number(rootRole),
            });

            const inviteLink = await this.resetTokenService.createNewUserUrl(
                createdUser.id,
                user.email,
            );

            const emailConfigured = this.emailService.configured();
            let sentMetaData = null;
            if (emailConfigured) {
                sentMetaData = await this.emailService.sendGettingStartedMail(
                    createdUser.name,
                    createdUser.email,
                    inviteLink.toString(),
                );
            } else {
                this.logger.warn(
                    'email was not sent to the user because email configuration is lacking',
                );
            }

            const emailSent =
                sentMetaData?.response.includes(MAIL_ACCEPTED) || false;

            res.status(201).send({
                ...createdUser,
                inviteLink,
                emailSent,
                rootRole,
            });
        } catch (e) {
            this.logger.warn(e.message);
            res.status(400).send([{ msg: e.message }]);
        }
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    async updateUser(req, res): Promise<void> {
        const { id } = req.params;
        const { name, email, rootRole } = req.body;

        try {
            const user = await this.userService.updateUser({
                id: Number(id),
                name,
                email,
                rootRole: Number(rootRole),
            });
            res.status(200).send({ ...user, rootRole });
        } catch (e) {
            this.logger.warn(e.message);
            res.status(400).send([{ msg: e.message }]);
        }
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    async deleteUser(req, res): Promise<void> {
        const { id } = req.params;

        try {
            await this.userService.deleteUser(+id);
            res.status(200).send();
        } catch (error) {
            this.logger.warn(error);
            res.status(500).send();
        }
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    async validatePassword(req, res): Promise<void> {
        const { password } = req.body;

        try {
            this.userService.validatePassword(password);
            res.status(200).send();
        } catch (e) {
            res.status(400).send([{ msg: e.message }]);
        }
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    async changePassword(req, res): Promise<void> {
        const { id } = req.params;
        const { password } = req.body;

        try {
            await this.userService.changePassword(+id, password);
            res.status(200).send();
        } catch (e) {
            res.status(400).send([{ msg: e.message }]);
        }
    }
}

module.exports = UserAdminController;
