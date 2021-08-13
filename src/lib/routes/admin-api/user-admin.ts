import { Request, Response } from 'express';
import Controller from '../controller';
import { ADMIN } from '../../types/permissions';
import UserService from '../../services/user-service';
import { AccessService } from '../../services/access-service';
import { Logger } from '../../logger';
import { handleErrors } from '../util';
import { IUnleashConfig } from '../../types/option';
import { EmailService } from '../../services/email-service';
import ResetTokenService from '../../services/reset-token-service';
import { IUnleashServices } from '../../types/services';
import SessionService from '../../services/session-service';
import { IAuthRequest } from '../unleash-types';

interface ICreateUserBody {
    username: string;
    email: string;
    name: string;
    rootRole: number;
    sendEmail: boolean;
}

export default class UserAdminController extends Controller {
    private userService: UserService;

    private accessService: AccessService;

    private readonly logger: Logger;

    private emailService: EmailService;

    private resetTokenService: ResetTokenService;

    private sessionService: SessionService;

    constructor(
        config: IUnleashConfig,
        {
            userService,
            accessService,
            emailService,
            resetTokenService,
            sessionService,
        }: Pick<
            IUnleashServices,
            | 'userService'
            | 'accessService'
            | 'emailService'
            | 'resetTokenService'
            | 'sessionService'
        >,
    ) {
        super(config);
        this.userService = userService;
        this.accessService = accessService;
        this.emailService = emailService;
        this.logger = config.getLogger('routes/user-controller.ts');
        this.resetTokenService = resetTokenService;
        this.sessionService = sessionService;

        this.get('/', this.getUsers, ADMIN);
        this.get('/search', this.search);
        this.post('/', this.createUser, ADMIN);
        this.post('/validate-password', this.validatePassword);
        this.put('/:id', this.updateUser, ADMIN);
        this.post('/:id/change-password', this.changePassword, ADMIN);
        this.delete('/:id', this.deleteUser, ADMIN);
        this.post('/reset-password', this.resetPassword);
        this.get('/active-sessions', this.getActiveSessions, ADMIN);
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    async resetPassword(req, res): Promise<void> {
        const { user } = req;
        try {
            const receiver = req.body.id;
            const resetPasswordUrl =
                await this.userService.createResetPasswordEmail(receiver, user);
            res.json({ resetPasswordUrl });
        } catch (e) {
            handleErrors(res, this.logger, e);
        }
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    async getUsers(req: Request, res: Response): Promise<void> {
        try {
            const users = await this.userService.getAll();
            const rootRoles = await this.accessService.getRootRoles();
            const inviteLinks =
                await this.resetTokenService.getActiveInvitations();

            const usersWithInviteLinks = users.map((user) => {
                const inviteLink = inviteLinks[user.id] || '';
                return { ...user, inviteLink };
            });

            res.json({ users: usersWithInviteLinks, rootRoles });
        } catch (error) {
            this.logger.error(error);
            res.status(500).send({ msg: 'server errors' });
        }
    }

    async getActiveSessions(req: Request, res: Response): Promise<void> {
        try {
            const sessions = await this.sessionService.getActiveSessions();
            res.json(sessions);
        } catch (error) {
            handleErrors(res, this.logger, error);
        }
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    async search(req: Request, res: Response): Promise<void> {
        const { q } = req.query as any;
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
    async createUser(
        req: IAuthRequest<any, any, ICreateUserBody, any>,
        res: Response,
    ): Promise<void> {
        const { username, email, name, rootRole, sendEmail } = req.body;
        const { user } = req;

        try {
            const createdUser = await this.userService.createUser(
                {
                    username,
                    email,
                    name,
                    rootRole,
                },
                user,
            );
            const inviteLink = await this.resetTokenService.createNewUserUrl(
                createdUser.id,
                user.email,
            );

            let emailSent = false;
            const emailConfigured = this.emailService.configured();
            const reallySendEmail =
                emailConfigured && (sendEmail !== undefined ? sendEmail : true);
            if (reallySendEmail) {
                try {
                    await this.emailService.sendGettingStartedMail(
                        createdUser.name,
                        createdUser.email,
                        inviteLink.toString(),
                    );
                    emailSent = true;
                } catch (e) {
                    this.logger.warn(
                        'email was configured, but sending failed due to: ',
                        e,
                    );
                }
            } else {
                this.logger.warn(
                    'email was not sent to the user because email configuration is lacking',
                );
            }

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

    async updateUser(req: IAuthRequest, res: Response): Promise<void> {
        const { user, params, body } = req;

        const { id } = params;
        const { name, email, rootRole } = body;

        try {
            const updateUser = await this.userService.updateUser(
                {
                    id: Number(id),
                    name,
                    email,
                    rootRole,
                },
                user,
            );
            res.status(200).send({ ...updateUser, rootRole });
        } catch (e) {
            this.logger.warn(e.message);
            res.status(400).send([{ msg: e.message }]);
        }
    }

    async deleteUser(req: IAuthRequest, res: Response): Promise<void> {
        const { user, params } = req;
        const { id } = params;

        try {
            await this.userService.deleteUser(+id, user);
            res.status(200).send();
        } catch (error) {
            handleErrors(res, this.logger, error);
        }
    }

    async validatePassword(req: IAuthRequest, res: Response): Promise<void> {
        const { password } = req.body;

        try {
            this.userService.validatePassword(password);
            res.status(200).send();
        } catch (e) {
            res.status(400).send([{ msg: e.message }]);
        }
    }

    async changePassword(req: IAuthRequest, res: Response): Promise<void> {
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
