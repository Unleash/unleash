import test from 'ava';
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

test('Should create new user', async t => {
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

    t.truthy(user.id);
    t.is(user.username, 'test');
    t.is(allUsers.length, 1);
    t.is(storedUser.username, 'test');
});

test('Should create default user', async t => {
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
    t.is(user.username, 'admin');
});

test('Should be a valid password', async t => {
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

    t.true(valid);
});

test('Password must be at least 10 chars', async t => {
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

    t.throws(() => service.validatePassword('admin'), {
        message: 'The password must be at least 10 characters long.',
        instanceOf: OwaspValidationError,
    });
});

test('The password must contain at least one uppercase letter.', async t => {
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

    t.throws(() => service.validatePassword('qwertyabcde'), {
        message: 'The password must contain at least one uppercase letter.',
        instanceOf: OwaspValidationError,
    });
});

test('The password must contain at least one number', async t => {
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

    t.throws(() => service.validatePassword('qwertyabcdE'), {
        message: 'The password must contain at least one number.',
        instanceOf: OwaspValidationError,
    });
});

test('The password must contain at least one special character', async t => {
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

    t.throws(() => service.validatePassword('qwertyabcdE2'), {
        message: 'The password must contain at least one special character.',
        instanceOf: OwaspValidationError,
    });
});

test('Should be a valid password with special chars', async t => {
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

    t.true(valid);
});
