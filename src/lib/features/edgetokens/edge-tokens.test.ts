import { scopeHash } from './edge-tokens.js';

describe('Scope hashing tokens', () => {
    test(`order of projects doesn't matter`, () => {
        const first = scopeHash('development', ['a', 'c', 'd']);
        const second = scopeHash('development', ['d', 'a', 'c']);
        expect(first).toStrictEqual(second);
    });
    test('Same project list but different environment should be different', () => {
        const projects = ['projecta', 'default', 'eg', 'dx'];
        const devHash = scopeHash('development', projects);
        const prodHash = scopeHash('production', projects);
        expect(devHash).not.toStrictEqual(prodHash);
    });
    test('If wildcard project is in list, rest of project list is not relevant', () => {
        const projects = ['projecta', 'projectb', '*'];
        const otherList = ['eg', 'dx', '*'];
        const projectsHash = scopeHash('development', projects);
        const otherHash = scopeHash('development', otherList);
        expect(projectsHash).toStrictEqual(otherHash);
    });
});
