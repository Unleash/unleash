import { Request, Response } from 'express';
import Controller from '../controller';
import { ADMIN, NONE } from '../../types/permissions';
import UserService from '../../services/user-service';
import { AccessService } from '../../services/access-service';
import { Logger } from '../../logger';
import { IUnleashConfig } from '../../types/option';
import { EmailService } from '../../services/email-service';
import ResetTokenService from '../../services/reset-token-service';
import { IUnleashServices } from '../../types/services';
import SessionService from '../../services/session-service';
import { IAuthRequest } from '../unleash-types';
import SettingService from '../../services/setting-service';
import { IUser, SimpleAuthSettings } from '../../server-impl';
import { simpleAuthKey } from '../../types/settings/simple-auth-settings';
import { anonymise } from '../../util/anonymise';

interface ICreateUserBody {
    username: string;
    email: string;
    name: string;
    rootRole: number;
    sendEmail: boolean;
}

export default class UserAdminController extends Controller {
    private anonymise: boolean = false;

    private userService: UserService;

    private accessService: AccessService;

    private readonly logger: Logger;

    private emailService: EmailService;

    private resetTokenService: ResetTokenService;

    private sessionService: SessionService;

    private settingService: SettingService;

    readonly unleashUrl: string;

    constructor(
        config: IUnleashConfig,
        {
            userService,
            accessService,
            emailService,
            resetTokenService,
            sessionService,
            settingService,
        }: Pick<
            IUnleashServices,
            | 'userService'
            | 'accessService'
            | 'emailService'
            | 'resetTokenService'
            | 'sessionService'
            | 'settingService'
        >,
    ) {
        super(config);
        this.userService = userService;
        this.accessService = accessService;
        this.emailService = emailService;
        this.resetTokenService = resetTokenService;
        this.sessionService = sessionService;
        this.settingService = settingService;
        this.logger = config.getLogger('routes/user-controller.ts');
        this.unleashUrl = config.server.unleashUrl;
        this.anonymise = config.experimental?.anonymiseEventLog;

        this.get('/', this.getUsers, ADMIN);
        this.get('/search', this.search);
        this.post('/', this.createUser, ADMIN);
        this.post('/validate-password', this.validatePassword, NONE);
        this.get('/:id', this.getUser, ADMIN);
        this.put('/:id', this.updateUser, ADMIN);
        this.post('/:id/change-password', this.changePassword, ADMIN);
        this.delete('/:id', this.deleteUser, ADMIN);
        this.post('/reset-password', this.resetPassword, ADMIN);
        this.get('/active-sessions', this.getActiveSessions, ADMIN);
    }

    async resetPassword(req: IAuthRequest, res: Response): Promise<void> {
        const { user } = req;
        const receiver = req.body.id;
        const resetPasswordUrl =
            await this.userService.createResetPasswordEmail(receiver, user);
        res.json({ resetPasswordUrl });
    }

    async getUsers(req: Request, res: Response): Promise<void> {
        const users = await this.userService.getAll();
        const rootRoles = await this.accessService.getRootRoles();
        const inviteLinks = await this.resetTokenService.getActiveInvitations();

        const usersWithInviteLinks = users.map((user) => {
            const inviteLink = inviteLinks[user.id] || '';
            return { ...user, inviteLink };
        });

        res.json({ users: usersWithInviteLinks, rootRoles });
    }

    async getActiveSessions(req: Request, res: Response): Promise<void> {
        const sessions = await this.sessionService.getActiveSessions();
        res.json(sessions);
    }

    anonymiseUsers(users: IUser[]): IUser[] {
        return users.map((u) => ({
            ...u,
            email: anonymise(u.email || 'random'),
            imageUrl:
                'https://gravatar.com/avatar/21232f297a57a5a743894a0e4a801fc3?size=42&default=retro',
        }));
    }

    async search(req: Request, res: Response): Promise<void> {
        const { q } = req.query as any;
        try {
            let users =
                q && q.length > 1 ? await this.userService.search(q) : [];

            if (this.anonymise) {
                users = this.anonymiseUsers(users);
            }
            res.json(users);
        } catch (error) {
            this.logger.error(error);
            res.status(500).send({ msg: 'server errors' });
        }
    }

    async getUser(req: Request, res: Response): Promise<void> {
        const { id } = req.params;
        const user = await this.userService.getUser(Number(id));
        res.json(user);
    }

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

            const passwordAuthSettings =
                await this.settingService.get<SimpleAuthSettings>(
                    simpleAuthKey,
                );

            let inviteLink: string;
            if (!passwordAuthSettings?.disabled) {
                const inviteUrl = await this.resetTokenService.createNewUserUrl(
                    createdUser.id,
                    user.email,
                );
                inviteLink = inviteUrl.toString();
            }

            let emailSent = false;
            const emailConfigured = this.emailService.configured();
            const reallySendEmail =
                emailConfigured && (sendEmail !== undefined ? sendEmail : true);
            if (reallySendEmail) {
                try {
                    await this.emailService.sendGettingStartedMail(
                        createdUser.name,
                        createdUser.email,
                        this.unleashUrl,
                        inviteLink,
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
                inviteLink: inviteLink || this.unleashUrl,
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

        await this.userService.deleteUser(+id, user);
        res.status(200).send();
    }

    async validatePassword(req: IAuthRequest, res: Response): Promise<void> {
        const { password } = req.body;

        this.userService.validatePassword(password);
        res.status(200).send();
    }

    async changePassword(req: IAuthRequest, res: Response): Promise<void> {
        const { id } = req.params;
        const { password } = req.body;

        await this.userService.changePassword(+id, password);
        res.status(200).send();
    }
}
