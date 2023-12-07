import { isNotSnakeCase } from './database-init-helpers';

describe('isNotSnakeCase', () => {
    it('should return true for non-snake case strings', () => {
        expect(isNotSnakeCase('HelloWorld')).toBe(true);
        expect(isNotSnakeCase('helloWorld')).toBe(true);
        expect(isNotSnakeCase('hello-world')).toBe(true);
        expect(isNotSnakeCase('hello world')).toBe(true);
        expect(isNotSnakeCase('HELLO_WORLD')).toBe(true);
    });

    it('should return false for snake case strings', () => {
        expect(isNotSnakeCase('hello_world')).toBe(false);
        expect(isNotSnakeCase('hello')).toBe(false);
    });
});
