import UserService from './user-service';
import UserStoreMock from '../../test/fixtures/fake-user-store';
import EventStoreMock from '../../test/fixtures/fake-event-store';
import AccessServiceMock from '../../test/fixtures/access-service-mock';
import ResetTokenService from './reset-token-service';
import { EmailService } from './email-service';
import OwaspValidationError from '../error/owasp-validation-error';
import { IUnleashConfig } from '../types/option';
import { createTestConfig } from '../../test/config/test-config';
import SessionService from './session-service';
import FakeSessionStore from '../../test/fixtures/fake-session-store';
import User from '../types/user';
import FakeResetTokenStore from '../../test/fixtures/fake-reset-token-store';

const config: IUnleashConfig = createTestConfig();

const systemUser = new User({ id: -1, username: 'system' });

test('Should create new user', async () => {
    const userStore = new UserStoreMock();
    const eventStore = new EventStoreMock();
    const accessService = new AccessServiceMock();
    const resetTokenStore = new FakeResetTokenStore();
    const resetTokenService = new ResetTokenService(
        { resetTokenStore },
        config,
    );
    const sessionStore = new FakeSessionStore();
    const sessionService = new SessionService({ sessionStore }, config);
    const emailService = new EmailService(config.email, config.getLogger);

    const service = new UserService({ userStore, eventStore }, config, {
        accessService,
        resetTokenService,
        emailService,
        sessionService,
    });
    const user = await service.createUser(
        {
            username: 'test',
            rootRole: 1,
        },
        systemUser,
    );
    const storedUser = await userStore.get(user.id);
    const allUsers = await userStore.getAll();

    expect(user.id).toBeTruthy();
    expect(user.username).toBe('test');
    expect(allUsers.length).toBe(1);
    expect(storedUser.username).toBe('test');
});

test('Should create default user', async () => {
    const userStore = new UserStoreMock();
    const eventStore = new EventStoreMock();
    const accessService = new AccessServiceMock();
    const resetTokenStore = new FakeResetTokenStore();
    const resetTokenService = new ResetTokenService(
        { resetTokenStore },
        config,
    );
    const emailService = new EmailService(config.email, config.getLogger);
    const sessionStore = new FakeSessionStore();
    const sessionService = new SessionService({ sessionStore }, config);

    const service = new UserService({ userStore, eventStore }, config, {
        accessService,
        resetTokenService,
        emailService,
        sessionService,
    });

    await service.initAdminUser();

    const user = await service.loginUser('admin', 'unleash4all');
    expect(user.username).toBe('admin');
});

test('Should be a valid password', async () => {
    const userStore = new UserStoreMock();
    const eventStore = new EventStoreMock();
    const accessService = new AccessServiceMock();
    const resetTokenStore = new FakeResetTokenStore();
    const resetTokenService = new ResetTokenService(
        { resetTokenStore },
        config,
    );

    const emailService = new EmailService(config.email, config.getLogger);
    const sessionStore = new FakeSessionStore();
    const sessionService = new SessionService({ sessionStore }, config);

    const service = new UserService({ userStore, eventStore }, config, {
        accessService,
        resetTokenService,
        emailService,
        sessionService,
    });

    const valid = service.validatePassword('this is a strong password!');

    expect(valid).toBe(true);
});

test('Password must be at least 10 chars', async () => {
    const userStore = new UserStoreMock();
    const eventStore = new EventStoreMock();
    const accessService = new AccessServiceMock();
    const resetTokenStore = new FakeResetTokenStore();
    const resetTokenService = new ResetTokenService(
        { resetTokenStore },
        config,
    );
    const emailService = new EmailService(config.email, config.getLogger);
    const sessionStore = new FakeSessionStore();
    const sessionService = new SessionService({ sessionStore }, config);

    const service = new UserService({ userStore, eventStore }, config, {
        accessService,
        resetTokenService,
        emailService,
        sessionService,
    });
    expect(() => service.validatePassword('admin')).toThrow(
        'The password must be at least 10 characters long.',
    );
    expect(() => service.validatePassword('qwertyabcde')).toThrowError(
        OwaspValidationError,
    );
});

test('The password must contain at least one uppercase letter.', async () => {
    const userStore = new UserStoreMock();
    const eventStore = new EventStoreMock();
    const accessService = new AccessServiceMock();
    const resetTokenStore = new FakeResetTokenStore();
    const resetTokenService = new ResetTokenService(
        { resetTokenStore },
        config,
    );
    const emailService = new EmailService(config.email, config.getLogger);
    const sessionStore = new FakeSessionStore();
    const sessionService = new SessionService({ sessionStore }, config);

    const service = new UserService({ userStore, eventStore }, config, {
        accessService,
        resetTokenService,
        emailService,
        sessionService,
    });

    expect(() => service.validatePassword('qwertyabcde')).toThrowError(
        'The password must contain at least one uppercase letter.',
    );
    expect(() => service.validatePassword('qwertyabcde')).toThrowError(
        OwaspValidationError,
    );
});

test('The password must contain at least one number', async () => {
    const userStore = new UserStoreMock();
    const eventStore = new EventStoreMock();
    const accessService = new AccessServiceMock();
    const resetTokenStore = new FakeResetTokenStore();
    const resetTokenService = new ResetTokenService(
        { resetTokenStore },
        config,
    );

    const emailService = new EmailService(config.email, config.getLogger);
    const sessionStore = new FakeSessionStore();
    const sessionService = new SessionService({ sessionStore }, config);

    const service = new UserService({ userStore, eventStore }, config, {
        accessService,
        resetTokenService,
        emailService,
        sessionService,
    });

    expect(() => service.validatePassword('qwertyabcdE')).toThrowError(
        'The password must contain at least one number.',
    );
    expect(() => service.validatePassword('qwertyabcdE')).toThrowError(
        OwaspValidationError,
    );
});

test('The password must contain at least one special character', async () => {
    const userStore = new UserStoreMock();
    const eventStore = new EventStoreMock();
    const accessService = new AccessServiceMock();
    const resetTokenStore = new FakeResetTokenStore();
    const resetTokenService = new ResetTokenService(
        { resetTokenStore },
        config,
    );
    const emailService = new EmailService(config.email, config.getLogger);
    const sessionStore = new FakeSessionStore();
    const sessionService = new SessionService({ sessionStore }, config);

    const service = new UserService({ userStore, eventStore }, config, {
        accessService,
        resetTokenService,
        emailService,
        sessionService,
    });

    expect(() => service.validatePassword('qwertyabcdE2')).toThrowError(
        'The password must contain at least one special character.',
    );
    expect(() => service.validatePassword('qwertyabcdE2')).toThrowError(
        OwaspValidationError,
    );
});

test('Should be a valid password with special chars', async () => {
    const userStore = new UserStoreMock();
    const eventStore = new EventStoreMock();
    const accessService = new AccessServiceMock();
    const resetTokenStore = new FakeResetTokenStore();
    const resetTokenService = new ResetTokenService(
        { resetTokenStore },
        config,
    );
    const emailService = new EmailService(config.email, config.getLogger);
    const sessionStore = new FakeSessionStore();
    const sessionService = new SessionService({ sessionStore }, config);

    const service = new UserService({ userStore, eventStore }, config, {
        accessService,
        resetTokenService,
        emailService,
        sessionService,
    });

    const valid = service.validatePassword('this is a strong password!');

    expect(valid).toBe(true);
});
