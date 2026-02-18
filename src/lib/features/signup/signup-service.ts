import type { WithTransactional } from '../../db/transaction.js';
import { BadDataError, PasswordUndefinedError } from '../../error/index.js';
import type {
    IUnleashServices,
    SettingService,
    UserService,
} from '../../services/index.js';
import {
    RoleName,
    type IAuditUser,
    type IUnleashConfig,
    type IUnleashStores,
    type IUser,
    type IUserStore,
} from '../../types/index.js';

type UserSignupData = {
    name?: string;
    companyRole?: string;
    productUpdatesEmailConsent?: boolean;
    shouldSetPassword?: boolean;
};

type CompanySignupData = {
    companyName?: string;
    companyIsNA?: boolean;
};

type SignupData = UserSignupData & CompanySignupData;
type SubmitSignupData = Omit<SignupData, 'shouldSetPassword'> & {
    password?: string;
    inviteEmails?: string[];
};

export class SignupService {
    private userStore: IUserStore;
    private userService: WithTransactional<UserService>;

    private settingService: SettingService;

    constructor(
        { userStore }: Pick<IUnleashStores, 'userStore'>,
        {
            userService,
            settingService,
        }: Pick<IUnleashServices, 'userService' | 'settingService'>,
        _config: IUnleashConfig,
    ) {
        this.userStore = userStore;
        this.userService = userService;
        this.settingService = settingService;
    }

    async getSignupData(user: IUser): Promise<SignupData> {
        const companySignupData = await this.getCompanySignupData();

        return {
            name: user.name,
            companyRole: user.companyRole,
            productUpdatesEmailConsent: user.productUpdatesEmailConsent,
            shouldSetPassword: user.shouldSetPassword,
            ...companySignupData,
        };
    }

    async submitSignupData(
        user: IUser,
        {
            password,
            name,
            companyRole,
            companyName,
            companyIsNA,
            productUpdatesEmailConsent,
            inviteEmails,
        }: SubmitSignupData,
        auditUser: IAuditUser,
    ): Promise<void> {
        const { companyName: existingCompanyName } =
            await this.getCompanySignupData();

        await this.userStore.update(user.id, {
            name,
            companyRole,
            productUpdatesEmailConsent,
        });

        if (user.shouldSetPassword) {
            if (!password) {
                throw new PasswordUndefinedError();
            }
            await this.userService.changePassword(user.id, password, {
                logoutUser: false,
            });
        }

        if (!existingCompanyName) {
            if (!companyName) {
                throw new BadDataError('Company name is required');
            }

            if (companyIsNA === undefined || companyIsNA === null) {
                throw new BadDataError('Company location is required');
            }

            await this.settingService.insert(
                'organizationInfo',
                {
                    companyName,
                    companyIsNA,
                },
                auditUser,
            );
            // TODO: Send this data to auth-app if we're a cloud instance
        }

        for (const email of inviteEmails ?? []) {
            await this.inviteUser(email, auditUser);
        }
    }

    private getCompanySignupData(): Promise<CompanySignupData> {
        return this.settingService.getWithDefault<CompanySignupData>(
            'organizationInfo',
            {
                companyName: undefined,
                companyIsNA: undefined,
            },
        );
    }

    private async inviteUser(email: string, auditUser: IAuditUser) {
        await this.userService.transactional(async (txUserService) => {
            const createdUser = await txUserService.createUser(
                {
                    email,
                    rootRole: RoleName.VIEWER,
                },
                auditUser,
            );

            const inviteLink = await txUserService.newUserInviteLink(
                createdUser,
                auditUser,
            );

            await txUserService.sendWelcomeEmail(createdUser, inviteLink);
        });
    }
}
