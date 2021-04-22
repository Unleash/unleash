'use strict';

const User = require('./user');

test('should create user', () => {
    const user = new User({ name: 'ole', email: 'some@email.com' });
    expect(user.name).toBe('ole');
    expect(user.email).toBe('some@email.com');
    expect(user.imageUrl).toBe(
        'https://gravatar.com/avatar/d8ffeba65ee5baf57e4901690edc8e1b?size=42&default=retro',
    );
});

test('should create user, all fields', () => {
    const user = new User({
        name: 'Admin',
        username: 'admin',
        email: 'some@email.com',
        permissions: ['admin', 'client'],
    });
    expect(user.name).toBe('Admin');
    expect(user.username).toBe('admin');
    expect(user.email).toBe('some@email.com');
    expect(user.permissions).toEqual(['admin', 'client']);
    expect(user.imageUrl).toBe(
        'https://gravatar.com/avatar/d8ffeba65ee5baf57e4901690edc8e1b?size=42&default=retro',
    );
});

test('should require email or username', () => {
    expect(() => {
        const user = new User(); // eslint-disable-line
    }).toThrowError(new TypeError('Username or Email is required'));
});

test('Should create user with only email defined', () => {
    const user = new User({ email: 'some@email.com' });

    expect(user.email).toBe('some@email.com');
});

test('Should require valid email', () => {
    expect(() => {
        new User({ email: 'some@' }); // eslint-disable-line
    }).toThrowError(new Error('Email "value" must be a valid email'));
});

test('Should create user with only username defined', () => {
    const user = new User({ username: 'some-user' });
    expect(user.username).toBe('some-user');
    expect(user.imageUrl).toBe(
        'https://gravatar.com/avatar/140fd5a002fb8d728a9848f8c9fcea2a?size=42&default=retro',
    );
});

test('Should create user with only username defined and undefined email', () => {
    const user = new User({ username: 'some-user', email: undefined });
    expect(user.username).toBe('some-user');
});
