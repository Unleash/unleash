import { generateObjectCombinations } from './generateObjectCombinations';

test('should generate all combinations correctly', () => {
    const obj = {
        sessionId: '1,2',
        appName: 'a,b,c',
        channels: 'internet',
    };

    const expectedCombinations = [
        { sessionId: '1', appName: 'a', channels: 'internet' },
        { sessionId: '1', appName: 'b', channels: 'internet' },
        { sessionId: '1', appName: 'c', channels: 'internet' },
        { sessionId: '2', appName: 'a', channels: 'internet' },
        { sessionId: '2', appName: 'b', channels: 'internet' },
        { sessionId: '2', appName: 'c', channels: 'internet' },
    ];

    const actualCombinations = generateObjectCombinations(obj);

    expect(actualCombinations).toEqual(expectedCombinations);
});

test('should generate all combinations correctly when only one combination', () => {
    const obj = {
        sessionId: '1',
        appName: 'a',
        channels: 'internet',
    };

    const expectedCombinations = [
        { sessionId: '1', appName: 'a', channels: 'internet' },
    ];

    const actualCombinations = generateObjectCombinations(obj);

    expect(actualCombinations).toEqual(expectedCombinations);
});
