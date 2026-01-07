import { deepOmit } from './deepOmit.js';

test('should omit all instances of a given field', () => {
    const input = {
        name: 'some-name',
        color: 'blue',
        children: {
            name: 'some-name',
            color: 'blue',
            children: {
                name: 'some-name',
                color: 'blue',
                children: {
                    name: 'some-name',
                    color: 'blue',
                    children: {},
                },
            },
        },
    };

    expect(deepOmit(input, 'name')).toEqual({
        color: 'blue',
        children: {
            color: 'blue',
            children: {
                color: 'blue',
                children: {
                    color: 'blue',
                    children: {},
                },
            },
        },
    });

    expect(deepOmit(input, 'color')).toEqual({
        name: 'some-name',
        children: {
            name: 'some-name',
            children: {
                name: 'some-name',
                children: {
                    name: 'some-name',
                    children: {},
                },
            },
        },
    });
});

test('should omit all instances of multiple fields', () => {
    const input = {
        name: 'some-name',
        color: 'blue',
        children: {
            name: 'some-name',
            color: 'blue',
            children: {
                name: 'some-name',
                color: 'blue',
                children: {
                    name: 'some-name',
                    color: 'blue',
                    children: {},
                },
            },
        },
    };

    expect(deepOmit(input, 'name', 'color')).toEqual({
        children: {
            children: {
                children: {
                    children: {},
                },
            },
        },
    });
});
