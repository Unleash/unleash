import { expect, it } from 'vitest';
import { createContextFieldOptions } from './createContextFieldOptions';

const contextField = (name: string, project?: string) => ({
    name,
    description: '',
    createdAt: '',
    sortOrder: 0,
    stickiness: false,
    project,
});

it('groups options by project and global', () => {
    const context = [
        contextField('a'),
        contextField('b'),
        contextField('c', 'project1'),
        contextField('d', 'project1'),
    ];

    const options = createContextFieldOptions(context, 'a');

    expect(options).toEqual([
        {
            groupHeader: 'Project context fields',
            options: [
                { value: 'c', label: 'c' },
                { value: 'd', label: 'd' },
            ],
        },
        {
            groupHeader: 'Global context fields',
            options: [
                { value: 'a', label: 'a' },
                { value: 'b', label: 'b' },
            ],
        },
    ]);
});

it('does not include empty groups', () => {
    const onlyGlobalContext = [contextField('a')];
    const onlyProjectContext = [contextField('a', 'project1')];

    const onlyGlobalOptions = createContextFieldOptions(onlyGlobalContext, 'a');

    expect(onlyGlobalOptions).toEqual([
        {
            groupHeader: 'Global context fields',
            options: [{ value: 'a', label: 'a' }],
        },
    ]);

    const onlyProjectOptions = createContextFieldOptions(
        onlyProjectContext,
        'a',
    );

    expect(onlyProjectOptions).toEqual([
        {
            groupHeader: 'Project context fields',
            options: [{ value: 'a', label: 'a' }],
        },
    ]);
});

it('puts deleted context fields in its own group', () => {
    const onlyGlobalContext = [contextField('b')];

    const options = createContextFieldOptions(onlyGlobalContext, 'a');

    expect(options).toEqual([
        {
            groupHeader: 'Global context fields',
            options: [{ value: 'b', label: 'b' }],
        },
        {
            groupHeader: 'Deleted context fields',
            options: [{ value: 'a', label: 'a' }],
        },
    ]);
});
