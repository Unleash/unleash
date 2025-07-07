import User from './user.js';

test('should create user', () => {
    const user = new User({ id: 11, name: 'ole', email: 'some@email.com' });
    expect(user.name).toBe('ole');
    expect(user.email).toBe('some@email.com');
    expect(user.imageUrl).toBe(
        'https://gravatar.com/avatar/676212ff796c79a3c06261eb10e3f455aa93998ee6e45263da13679c74b1e674?s=42&d=retro&r=g',
    );
});

test('should create user, all fields', () => {
    const user = new User({
        id: 11,
        name: 'Admin',
        username: 'admin',
        email: 'some@email.com',
    });
    expect(user.name).toBe('Admin');
    expect(user.username).toBe('admin');
    expect(user.email).toBe('some@email.com');
    expect(user.imageUrl).toBe(
        'https://gravatar.com/avatar/676212ff796c79a3c06261eb10e3f455aa93998ee6e45263da13679c74b1e674?s=42&d=retro&r=g',
    );
});

test('Should create user with only id defined', () => {
    const user = new User({ id: 123 });

    expect(user.id).toBe(123);
    expect(user.email).toBeUndefined();
    expect(user.username).toBeUndefined();
});
test('Should create user with only email defined', () => {
    const user = new User({ id: 123, email: 'some@email.com' });

    expect(user.email).toBe('some@email.com');
});

test.skip('Should require valid email', () => {
    expect(() => {
        new User({ id: 11, email: 'some@' });
    }).toThrow(Error('Email "value" must be a valid email'));
});

test('Should allow long emails on demo', () => {
    expect(() => {
        new User({
            id: 11,
            email: '0a1c1b6a59a582fdbe853739eefc599dxd1eb365eee385e345b5fc41f59172022a8f69c09f61121d8b4a155b792314ee@unleash.run',
        });
    }).not.toThrow();
});

test('Should create user with only username defined', () => {
    const user = new User({ id: 133, username: 'some-user' });
    expect(user.username).toBe('some-user');
    expect(user.imageUrl).toBe(
        'https://gravatar.com/avatar/7e90ac329986624ba9929659913354473c6f965d5b559704409e3f933c0643b7?s=42&d=retro&r=g',
    );
});

test('Should create user with only username defined and undefined email', () => {
    const user = new User({
        id: 1447,
        username: 'some-user',
        email: undefined,
    });
    expect(user.username).toBe('some-user');
});
