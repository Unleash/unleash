import UserService from './user-service';
import UserStoreMock from '../../test/fixtures/fake-user-store';
import AccessServiceMock from '../../test/fixtures/access-service-mock';
import { ResetTokenStoreMock } from '../../test/fixtures/fake-reset-token-store';
import ResetTokenService from './reset-token-service';
import { EmailService } from './email-service';
import OwaspValidationError from '../error/owasp-validation-error';
import { IUnleashConfig } from '../types/option';
import { createTestConfig } from '../../test/config/test-config';

const config: IUnleashConfig = createTestConfig();

test('Should create new user', async () => {
    const userStore = new UserStoreMock();
    const accessService = new AccessServiceMock();
    const resetTokenStore = new ResetTokenStoreMock();
    const resetTokenService = new ResetTokenService(
        { userStore, resetTokenStore },
        config,
    );
    const emailService = new EmailService(config.email, config.getLogger);

    const service = new UserService({ userStore }, config, {
        accessService,
        resetTokenService,
        emailService,
    });
    const user = await service.createUser({
        username: 'test',
        rootRole: 1,
    });
    const storedUser = await userStore.get(user);
    const allUsers = await userStore.getAll();

    expect(user.id).toBeTruthy();
    expect(user.username).toBe('test');
    expect(allUsers.length).toBe(1);
    expect(storedUser.username).toBe('test');
});

test('Should create default user', async () => {
    const userStore = new UserStoreMock();
    const accessService = new AccessServiceMock();
    const resetTokenStore = new ResetTokenStoreMock();
    const resetTokenService = new ResetTokenService(
        { userStore, resetTokenStore },
        config,
    );
    const emailService = new EmailService(config.email, config.getLogger);

    const service = new UserService({ userStore }, config, {
        accessService,
        resetTokenService,
        emailService,
    });

    await service.initAdminUser();

    const user = await service.loginUser('admin', 'admin');
    expect(user.username).toBe('admin');
});

test('Should be a valid password', async () => {
    const userStore = new UserStoreMock();
    const accessService = new AccessServiceMock();
    const resetTokenStore = new ResetTokenStoreMock();
    const resetTokenService = new ResetTokenService(
        { userStore, resetTokenStore },
        config,
    );

    const emailService = new EmailService(config.email, config.getLogger);

    const service = new UserService({ userStore }, config, {
        accessService,
        resetTokenService,
        emailService,
    });

    const valid = service.validatePassword('this is a strong password!');

    expect(valid).toBe(true);
});

test('Password must be at least 10 chars', async () => {
    const userStore = new UserStoreMock();
    const accessService = new AccessServiceMock();
    const resetTokenStore = new ResetTokenStoreMock();
    const resetTokenService = new ResetTokenService(
        { userStore, resetTokenStore },
        config,
    );
    const emailService = new EmailService(config.email, config.getLogger);

    const service = new UserService({ userStore }, config, {
        accessService,
        resetTokenService,
        emailService,
    });

    expect(() => service.validatePassword('admin')).toThrowError({
        message: 'The password must be at least 10 characters long.',
        instanceOf: OwaspValidationError,
    });
});

test('The password must contain at least one uppercase letter.', async () => {
    const userStore = new UserStoreMock();
    const accessService = new AccessServiceMock();
    const resetTokenStore = new ResetTokenStoreMock();
    const resetTokenService = new ResetTokenService(
        { userStore, resetTokenStore },
        config,
    );
    const emailService = new EmailService(config.email, config.getLogger);

    const service = new UserService({ userStore }, config, {
        accessService,
        resetTokenService,
        emailService,
    });

    expect(() => service.validatePassword('qwertyabcde')).toThrowError({
        message: 'The password must contain at least one uppercase letter.',
        instanceOf: OwaspValidationError,
    });
});

test('The password must contain at least one number', async () => {
    const userStore = new UserStoreMock();
    const accessService = new AccessServiceMock();
    const resetTokenStore = new ResetTokenStoreMock();
    const resetTokenService = new ResetTokenService(
        { userStore, resetTokenStore },
        config,
    );

    const emailService = new EmailService(config.email, config.getLogger);
    const service = new UserService({ userStore }, config, {
        accessService,
        resetTokenService,
        emailService,
    });

    expect(() => service.validatePassword('qwertyabcdE')).toThrowError({
        message: 'The password must contain at least one number.',
        instanceOf: OwaspValidationError,
    });
});

test('The password must contain at least one special character', async () => {
    const userStore = new UserStoreMock();
    const accessService = new AccessServiceMock();
    const resetTokenStore = new ResetTokenStoreMock();
    const resetTokenService = new ResetTokenService(
        { userStore, resetTokenStore },
        config,
    );
    const emailService = new EmailService(config.email, config.getLogger);

    const service = new UserService({ userStore }, config, {
        accessService,
        resetTokenService,
        emailService,
    });

    expect(() => service.validatePassword('qwertyabcdE2')).toThrowError({
        message: 'The password must contain at least one special character.',
        instanceOf: OwaspValidationError,
    });
});

test('Should be a valid password with special chars', async () => {
    const userStore = new UserStoreMock();
    const accessService = new AccessServiceMock();
    const resetTokenStore = new ResetTokenStoreMock();
    const resetTokenService = new ResetTokenService(
        { userStore, resetTokenStore },
        config,
    );
    const emailService = new EmailService(config.email, config.getLogger);

    const service = new UserService({ userStore }, config, {
        accessService,
        resetTokenService,
        emailService,
    });

    const valid = service.validatePassword('this is a strong password!');

    expect(valid).toBe(true);
});
