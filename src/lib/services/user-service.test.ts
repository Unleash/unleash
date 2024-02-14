import { URL } from 'url';
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
import SettingService from './setting-service';
import FakeSettingStore from '../../test/fixtures/fake-setting-store';
import EventService from '../features/events/event-service';
import FakeFeatureTagStore from '../../test/fixtures/fake-feature-tag-store';

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
    const emailService = new EmailService(config);
    const eventService = new EventService(
        { eventStore, featureTagStore: new FakeFeatureTagStore() },
        config,
    );
    const settingService = new SettingService(
        {
            settingStore: new FakeSettingStore(),
        },
        config,
        eventService,
    );

    const service = new UserService({ userStore }, config, {
        accessService,
        resetTokenService,
        emailService,
        eventService,
        sessionService,
        settingService,
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

test('Should create default user - with defaults', async () => {
    const userStore = new UserStoreMock();
    const eventStore = new EventStoreMock();
    const accessService = new AccessServiceMock();
    const resetTokenStore = new FakeResetTokenStore();
    const resetTokenService = new ResetTokenService(
        { resetTokenStore },
        config,
    );
    const emailService = new EmailService(config);
    const sessionStore = new FakeSessionStore();
    const sessionService = new SessionService({ sessionStore }, config);
    const eventService = new EventService(
        { eventStore, featureTagStore: new FakeFeatureTagStore() },
        config,
    );
    const settingService = new SettingService(
        {
            settingStore: new FakeSettingStore(),
        },
        config,
        eventService,
    );

    const service = new UserService({ userStore }, config, {
        accessService,
        resetTokenService,
        emailService,
        eventService,
        sessionService,
        settingService,
    });

    await service.initAdminUser({});

    const user = await service.loginUser('admin', 'unleash4all');
    expect(user.username).toBe('admin');
});

test('Should create default user - with provided username and password', async () => {
    const userStore = new UserStoreMock();
    const eventStore = new EventStoreMock();
    const accessService = new AccessServiceMock();
    const resetTokenStore = new FakeResetTokenStore();
    const resetTokenService = new ResetTokenService(
        { resetTokenStore },
        config,
    );
    const emailService = new EmailService(config);
    const sessionStore = new FakeSessionStore();
    const sessionService = new SessionService({ sessionStore }, config);
    const eventService = new EventService(
        { eventStore, featureTagStore: new FakeFeatureTagStore() },
        config,
    );
    const settingService = new SettingService(
        {
            settingStore: new FakeSettingStore(),
        },
        config,
        eventService,
    );

    const service = new UserService({ userStore }, config, {
        accessService,
        resetTokenService,
        emailService,
        eventService,
        sessionService,
        settingService,
    });

    await service.initAdminUser({
        initialAdminUser: {
            username: 'admin',
            password: 'unleash4all!',
        },
    });

    const user = await service.loginUser('admin', 'unleash4all!');
    expect(user.username).toBe('admin');
});

test('Should not create default user - with `createAdminUser` === false', async () => {
    const userStore = new UserStoreMock();
    const eventStore = new EventStoreMock();
    const accessService = new AccessServiceMock();
    const resetTokenStore = new FakeResetTokenStore();
    const resetTokenService = new ResetTokenService(
        { resetTokenStore },
        config,
    );
    const emailService = new EmailService(config);
    const sessionStore = new FakeSessionStore();
    const sessionService = new SessionService({ sessionStore }, config);
    const eventService = new EventService(
        { eventStore, featureTagStore: new FakeFeatureTagStore() },
        config,
    );
    const settingService = new SettingService(
        {
            settingStore: new FakeSettingStore(),
        },
        config,
        eventService,
    );

    const service = new UserService({ userStore }, config, {
        accessService,
        resetTokenService,
        emailService,
        eventService,
        sessionService,
        settingService,
    });

    await service.initAdminUser({
        createAdminUser: false,
        initialAdminUser: {
            username: 'admin',
            password: 'unleash4all!',
        },
    });

    await expect(
        service.loginUser('admin', 'unleash4all!'),
    ).rejects.toThrowError(
        'The combination of password and username you provided is invalid',
    );
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

    const emailService = new EmailService(config);
    const sessionStore = new FakeSessionStore();
    const sessionService = new SessionService({ sessionStore }, config);
    const eventService = new EventService(
        { eventStore, featureTagStore: new FakeFeatureTagStore() },
        config,
    );
    const settingService = new SettingService(
        {
            settingStore: new FakeSettingStore(),
        },
        config,
        eventService,
    );

    const service = new UserService({ userStore }, config, {
        accessService,
        resetTokenService,
        emailService,
        eventService,
        sessionService,
        settingService,
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
    const emailService = new EmailService(config);
    const sessionStore = new FakeSessionStore();
    const sessionService = new SessionService({ sessionStore }, config);
    const eventService = new EventService(
        { eventStore, featureTagStore: new FakeFeatureTagStore() },
        config,
    );
    const settingService = new SettingService(
        {
            settingStore: new FakeSettingStore(),
        },
        config,
        eventService,
    );

    const service = new UserService({ userStore }, config, {
        accessService,
        resetTokenService,
        emailService,
        eventService,
        sessionService,
        settingService,
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
    const emailService = new EmailService(config);
    const sessionStore = new FakeSessionStore();
    const sessionService = new SessionService({ sessionStore }, config);
    const eventService = new EventService(
        { eventStore, featureTagStore: new FakeFeatureTagStore() },
        config,
    );
    const settingService = new SettingService(
        {
            settingStore: new FakeSettingStore(),
        },
        config,
        eventService,
    );

    const service = new UserService({ userStore }, config, {
        accessService,
        resetTokenService,
        emailService,
        eventService,
        sessionService,
        settingService,
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

    const emailService = new EmailService(config);
    const sessionStore = new FakeSessionStore();
    const sessionService = new SessionService({ sessionStore }, config);
    const eventService = new EventService(
        { eventStore, featureTagStore: new FakeFeatureTagStore() },
        config,
    );
    const settingService = new SettingService(
        {
            settingStore: new FakeSettingStore(),
        },
        config,
        eventService,
    );

    const service = new UserService({ userStore }, config, {
        accessService,
        resetTokenService,
        emailService,
        eventService,
        sessionService,
        settingService,
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
    const emailService = new EmailService(config);
    const sessionStore = new FakeSessionStore();
    const sessionService = new SessionService({ sessionStore }, config);
    const eventService = new EventService(
        { eventStore, featureTagStore: new FakeFeatureTagStore() },
        config,
    );
    const settingService = new SettingService(
        {
            settingStore: new FakeSettingStore(),
        },
        config,
        eventService,
    );

    const service = new UserService({ userStore }, config, {
        accessService,
        resetTokenService,
        emailService,
        eventService,
        sessionService,
        settingService,
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
    const emailService = new EmailService(config);
    const sessionStore = new FakeSessionStore();
    const sessionService = new SessionService({ sessionStore }, config);
    const eventService = new EventService(
        { eventStore, featureTagStore: new FakeFeatureTagStore() },
        config,
    );
    const settingService = new SettingService(
        {
            settingStore: new FakeSettingStore(),
        },
        config,
        eventService,
    );

    const service = new UserService({ userStore }, config, {
        accessService,
        resetTokenService,
        emailService,
        eventService,
        sessionService,
        settingService,
    });

    const valid = service.validatePassword('this is a strong password!');

    expect(valid).toBe(true);
});

test('Should send password reset email if user exists', async () => {
    const userStore = new UserStoreMock();
    const eventStore = new EventStoreMock();
    const accessService = new AccessServiceMock();
    const resetTokenStore = new FakeResetTokenStore();
    const resetTokenService = new ResetTokenService(
        { resetTokenStore },
        config,
    );
    const emailService = new EmailService(config);
    const sessionStore = new FakeSessionStore();
    const sessionService = new SessionService({ sessionStore }, config);
    const eventService = new EventService(
        { eventStore, featureTagStore: new FakeFeatureTagStore() },
        config,
    );
    const settingService = new SettingService(
        {
            settingStore: new FakeSettingStore(),
        },
        config,
        eventService,
    );

    const service = new UserService({ userStore }, config, {
        accessService,
        resetTokenService,
        emailService,
        eventService,
        sessionService,
        settingService,
    });

    const unknownUser = service.createResetPasswordEmail('unknown@example.com');
    expect(unknownUser).rejects.toThrowError('Could not find user');

    await userStore.insert({
        id: 123,
        name: 'User',
        username: 'Username',
        email: 'known@example.com',
        permissions: [],
        imageUrl: '',
        seenAt: new Date(),
        loginAttempts: 0,
        createdAt: new Date(),
        isAPI: false,
        generateImageUrl: () => '',
    });

    const knownUser = service.createResetPasswordEmail('known@example.com');
    expect(knownUser).resolves.toBeInstanceOf(URL);
});

test('Should throttle password reset email', async () => {
    const userStore = new UserStoreMock();
    const eventStore = new EventStoreMock();
    const accessService = new AccessServiceMock();
    const resetTokenStore = new FakeResetTokenStore();
    const resetTokenService = new ResetTokenService(
        { resetTokenStore },
        config,
    );
    const emailService = new EmailService(config);
    const sessionStore = new FakeSessionStore();
    const sessionService = new SessionService({ sessionStore }, config);
    const eventService = new EventService(
        { eventStore, featureTagStore: new FakeFeatureTagStore() },
        config,
    );
    const settingService = new SettingService(
        {
            settingStore: new FakeSettingStore(),
        },
        config,
        eventService,
    );

    const service = new UserService({ userStore }, config, {
        accessService,
        resetTokenService,
        emailService,
        eventService,
        sessionService,
        settingService,
    });

    await userStore.insert({
        id: 123,
        name: 'User',
        username: 'Username',
        email: 'known@example.com',
        permissions: [],
        imageUrl: '',
        seenAt: new Date(),
        loginAttempts: 0,
        createdAt: new Date(),
        isAPI: false,
        generateImageUrl: () => '',
    });

    jest.useFakeTimers();

    const attempt1 = service.createResetPasswordEmail('known@example.com');
    await expect(attempt1).resolves.toBeInstanceOf(URL);

    const attempt2 = service.createResetPasswordEmail('known@example.com');
    await expect(attempt2).resolves.toBe(undefined);

    jest.runAllTimers();

    const attempt3 = service.createResetPasswordEmail('known@example.com');
    await expect(attempt3).resolves.toBeInstanceOf(URL);
});
