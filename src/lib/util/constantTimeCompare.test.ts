import { constantTimeCompare } from './constantTimeCompare';

test('constantTimeCompare', () => {
    expect(constantTimeCompare('', '')).toEqual(false);
    expect(constantTimeCompare(' ', '')).toEqual(false);
    expect(constantTimeCompare('a', '')).toEqual(false);
    expect(constantTimeCompare('', 'b')).toEqual(false);
    expect(constantTimeCompare('a', 'b')).toEqual(false);

    expect(constantTimeCompare(' ', ' ')).toEqual(true);
    expect(constantTimeCompare('a', 'a')).toEqual(true);
    expect(constantTimeCompare('b', 'b')).toEqual(true);

    expect(
        constantTimeCompare(
            '*:*.63df5492f027129de9c9368bc80fb8200677e97fb107455497dc42d6',
            '*:production.431c724bd84fbe8484bc6437d8e189f0ee288ebee6332bd030a539f5',
        ),
    ).toEqual(false);

    expect(
        constantTimeCompare(
            '*:production.559520cc3c1a3b071260f77d80c4650a08699a1d918ea4e7b18c487e',
            'default:development.148bbfa96e91ca41d6580232b331bbbdbc40fcc3626a815055ba79b5',
        ),
    ).toEqual(false);

    expect(
        constantTimeCompare(
            '*:production.559520cc3c1a3b071260f77d80c4650a08699a1d918ea4e7b18c487e',
            '*:production.431c724bd84fbe8484bc6437d8e189f0ee288ebee6332bd030a539f5',
        ),
    ).toEqual(false);

    expect(
        constantTimeCompare(
            '*:production.431c724bd84fbe8484bc6437d8e189f0ee288ebee6332bd030a539f5',
            '*:production.559520cc3c1a3b071260f77d80c4650a08699a1d918ea4e7b18c487e',
        ),
    ).toEqual(false);

    expect(
        constantTimeCompare(
            '*:*.63df5492f027129de9c9368bc80fb8200677e97fb107455497dc42d6',
            '*:*.63df5492f027129de9c9368bc80fb8200677e97fb107455497dc42d6',
        ),
    ).toEqual(true);

    expect(
        constantTimeCompare(
            '*:production.431c724bd84fbe8484bc6437d8e189f0ee288ebee6332bd030a539f5',
            '*:production.431c724bd84fbe8484bc6437d8e189f0ee288ebee6332bd030a539f5',
        ),
    ).toEqual(true);
});
