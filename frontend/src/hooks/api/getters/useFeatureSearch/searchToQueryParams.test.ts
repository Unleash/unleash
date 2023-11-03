import { translateToQueryParams } from './searchToQueryParams';

describe('translateToQueryParams', () => {
    describe.each([
        ['search', 'query=search'],
        [' search', 'query=search'],
        [' search ', 'query=search'],
        ['search ', 'query=search'],
        ['search with space', 'query=search with space'],
        ['search type:release', 'query=search&type[]=release'],
        [' search type:release ', 'query=search&type[]=release'],
        [
            'search type:release,experiment',
            'query=search&type[]=release&type[]=experiment',
        ],
        [
            'search type:release ,experiment',
            'query=search&type[]=release&type[]=experiment',
        ],
        [
            'search type:release, experiment',
            'query=search&type[]=release&type[]=experiment',
        ],
        [
            'search type:release , experiment',
            'query=search&type[]=release&type[]=experiment',
        ],
        ['type:release', 'type[]=release'],
        ['production:enabled', 'status[]=production:enabled'],
        [
            'development:enabled,disabled',
            'status[]=development:enabled&status[]=development:disabled',
        ],
        ['tag:simple:web', 'tag[]=simple:web'],
        ['tag:enabled:enabled', 'tag[]=enabled:enabled'],
        [
            'tag:simple:web,complex:native',
            'tag[]=simple:web&tag[]=complex:native',
        ],
    ])('when input is "%s"', (input, expected) => {
        it(`returns "${expected}"`, () => {
            expect(translateToQueryParams(input)).toBe(expected);
        });
    });
});
