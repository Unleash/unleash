import User from './user';

test('should create user', () => {
    const user = new User({ id: 11, name: 'ole', email: 'some@email.com' });
    expect(user.name).toBe('ole');
    expect(user.email).toBe('some@email.com');
    expect(user.imageUrl).toBe(
        'https://gravatar.com/avatar/d8ffeba65ee5baf57e4901690edc8e1b?size=42&default=retro',
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
        'https://gravatar.com/avatar/d8ffeba65ee5baf57e4901690edc8e1b?size=42&default=retro',
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

test('Should require valid email', () => {
    expect(() => {
        new User({ id: 11, email: 'some@' }); // eslint-disable-line
    }).toThrowError(Error('Email "value" must be a valid email'));
});

test('Should create user with only username defined', () => {
    const user = new User({ id: 133, username: 'some-user' });
    expect(user.username).toBe('some-user');
    expect(user.imageUrl).toBe(
        'https://gravatar.com/avatar/140fd5a002fb8d728a9848f8c9fcea2a?size=42&default=retro',
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
